// Payment service.
//
//   createCheckoutSession  — build a Stripe Hosted Checkout for an existing
//                            pending order. Passes metadata.orderId so the
//                            webhook can find the order without trusting input.
//
//   confirmCheckoutSession — local-dev fallback when the Stripe CLI isn't
//                            running and webhooks can't reach localhost. Asks
//                            Stripe directly (sessions.retrieve) and marks the
//                            order paid if Stripe says it is. Idempotent.
//
//   handleStripeEvent      — production webhook dispatcher. Idempotent too.

const { getStripe } = require('../config/stripe');
const Order = require('../models/Order');
const orderService = require('./order.service');
const { env } = require('../config/env');
const { NotFound, BadRequest, Forbidden, AppError } = require('../utils/errors');
const logger = require('../utils/logger');

// Shared authorization check. Returns the order (with guestToken selected)
// or throws Forbidden/NotFound.
async function loadAuthorizedOrder({ userId, role, orderId, guestToken }) {
  const order = await Order.findById(orderId).select('+guestToken');
  if (!order) throw new NotFound('Order not found', 'ORDER_NOT_FOUND');

  const isAdmin = role === 'admin';
  const isOwner = userId && order.user && order.user.toString() === userId;
  const isGuestWithToken =
    !order.user && order.guestToken && guestToken && order.guestToken === guestToken;
  if (!isAdmin && !isOwner && !isGuestWithToken) {
    throw new Forbidden('Not your order', 'ORDER_FORBIDDEN');
  }
  return order;
}

async function createCheckoutSession({ userId, role, orderId, guestToken }) {
  const stripe = getStripe();
  const order = await loadAuthorizedOrder({ userId, role, orderId, guestToken });

  if (order.paymentMethod !== 'stripe') {
    throw new BadRequest('Order is not configured for online payment', 'ORDER_NOT_STRIPE');
  }
  if (order.paymentStatus === 'paid') {
    throw new BadRequest('Order is already paid', 'ORDER_ALREADY_PAID');
  }

  const lineItems = order.items.map((it) => ({
    quantity: it.quantity,
    price_data: {
      currency: env.STRIPE_CURRENCY,
      unit_amount: Math.round(it.price_snapshot * 100),
      product_data: { name: it.name_snapshot.en },
    },
  }));
  if (order.deliveryFee > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: env.STRIPE_CURRENCY,
        unit_amount: Math.round(order.deliveryFee * 100),
        product_data: { name: 'Delivery fee' },
      },
    });
  }

  // Guest tracking URL carries the guestToken so the success page can read the order.
  const trackingSuffix = order.user ? '' : `&token=${order.guestToken}`;
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: `${env.CLIENT_URL}/orders/${order._id}?payment=success${trackingSuffix}`,
    cancel_url: `${env.CLIENT_URL}/orders/${order._id}?payment=cancel${trackingSuffix}`,
    // Only set customer_email if the guest provided one (it's optional now).
    customer_email: order.user ? undefined : order.guest?.email || undefined,
    metadata: {
      orderId: order._id.toString(),
      userId: order.user ? order.user.toString() : 'guest',
    },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });

  order.stripeSessionId = session.id;
  await order.save();

  return { url: session.url, sessionId: session.id };
}

// Called by the success page on /orders/:id?payment=success. The client asks us
// to ask Stripe "is this paid?" — Stripe is the source of truth, never the
// client. Idempotent: orderService.markPaidByStripeSession is a no-op once paid.
async function confirmCheckoutSession({ userId, role, orderId, guestToken }) {
  const stripe = getStripe();
  const order = await loadAuthorizedOrder({ userId, role, orderId, guestToken });

  if (order.paymentStatus === 'paid') {
    return { paid: true, order: order.toJSON() };
  }
  if (!order.stripeSessionId) {
    throw new BadRequest('Order has no Stripe session', 'NO_STRIPE_SESSION');
  }

  const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
  // Stripe's payment_status: 'paid' | 'unpaid' | 'no_payment_required'.
  if (session.payment_status === 'paid') {
    const updated = await orderService.markPaidByStripeSession({
      sessionId: session.id,
      orderId: order._id.toString(),
    });
    return { paid: true, order: updated };
  }
  // Mirror the webhook's failure-path for expired sessions.
  if (session.status === 'expired' && order.paymentStatus === 'pending') {
    order.paymentStatus = 'failed';
    await order.save();
  }
  return { paid: false, order: order.toJSON() };
}

async function handleStripeEvent(rawBody, signatureHeader) {
  const stripe = getStripe();
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError('Webhook not configured', { status: 503, code: 'WEBHOOK_NOT_CONFIGURED' });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signatureHeader,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    logger.warn({ err: err.message }, 'stripe webhook signature failed');
    throw new BadRequest('Invalid signature', 'INVALID_SIGNATURE');
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (!orderId) {
        logger.warn({ sessionId: session.id }, 'webhook missing orderId metadata');
        break;
      }
      await orderService.markPaidByStripeSession({ sessionId: session.id, orderId });
      logger.info({ orderId, sessionId: session.id }, 'order marked paid via webhook');
      break;
    }
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus === 'pending') {
          order.paymentStatus = 'failed';
          await order.save();
        }
      }
      break;
    }
    default:
      logger.debug({ type: event.type }, 'unhandled stripe event');
  }

  return { received: true };
}

module.exports = { createCheckoutSession, confirmCheckoutSession, handleStripeEvent };
