// Order service — the integrity heart of the app.
//
// `createOrder` accepts ONLY { productId, quantity } pairs. The server fetches
// every product, validates availability, and computes line totals from the
// canonical DB prices. Client-supplied prices are NEVER trusted.
//
// Guest orders: when no userId is provided, `guest` must be present.
// The service issues a random guestToken (hex 32 bytes) so the guest's
// browser can read the order back without auth via /orders/:id?token=...

const crypto = require('crypto');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { BadRequest, NotFound, Forbidden } = require('../utils/errors');
const { parsePageQuery, buildPageMeta } = require('../utils/pagination');
const { env } = require('../config/env');

const DELIVERY_FEE = (env.DELIVERY_FEE_CENTS || 0) / 100;

async function fetchProductsForCart(items) {
  const ids = items.map((i) => new mongoose.Types.ObjectId(i.productId));
  const products = await Product.find({ _id: { $in: ids }, isAvailable: true }).lean();
  const byId = new Map(products.map((p) => [p._id.toString(), p]));
  return byId;
}

function roundMoney(n) {
  return Math.round(n * 100) / 100;
}

async function createOrder({ userId, items, address, paymentMethod, guest }) {
  if (!userId && !guest) {
    throw new BadRequest('Guest contact info is required for guest checkout', 'GUEST_INFO_REQUIRED');
  }

  const productMap = await fetchProductsForCart(items);

  const orderItems = items.map((line) => {
    const p = productMap.get(line.productId);
    if (!p) throw new BadRequest('One or more items are unavailable', 'ITEM_UNAVAILABLE');
    return {
      product: p._id,
      name_snapshot: { en: p.name.en, ar: p.name.ar },
      price_snapshot: p.price,
      quantity: line.quantity,
    };
  });

  const subtotal = roundMoney(
    orderItems.reduce((s, i) => s + i.price_snapshot * i.quantity, 0),
  );
  const deliveryFee = roundMoney(DELIVERY_FEE);
  const total = roundMoney(subtotal + deliveryFee);

  // Issue a fresh guest token for unauthenticated checkouts. 32 random bytes
  // → 64 hex chars; long enough to be unguessable, no PII required.
  const guestToken = userId ? null : crypto.randomBytes(32).toString('hex');

  const order = await Order.create({
    user: userId || null,
    guest: userId ? undefined : guest,
    guestToken,
    items: orderItems,
    subtotal,
    deliveryFee,
    total,
    address,
    paymentMethod,
    paymentStatus: 'pending',
    status: 'pending',
    statusHistory: [{ status: 'pending', by: userId || null }],
  });


  // Return the token ONCE in the create response so the client can build the
  // tracking URL. After this the token is select:false and never re-served.
  const json = order.toJSON();
  if (guestToken) json.guestToken = guestToken;
  return json;
}

async function getOrderForUser({ userId, role, orderId, guestToken }) {
  // Need to select guestToken so we can compare; toJSON still strips it.
  const order = await Order.findById(orderId).select('+guestToken');
  if (!order) throw new NotFound('Order not found', 'ORDER_NOT_FOUND');

  // Admin bypass.
  if (role === 'admin') return order.toJSON();
  // Owner read.
  if (userId && order.user && order.user.toString() === userId) return order.toJSON();
  // Guest-token read (only when the order has no associated user).
  if (
    !order.user &&
    order.guestToken &&
    guestToken &&
    crypto.timingSafeEqual(Buffer.from(order.guestToken), Buffer.from(guestToken))
  ) {
    return order.toJSON();
  }
  throw new Forbidden('Not your order', 'ORDER_FORBIDDEN');
}

async function listMyOrders({ userId, query }) {
  const { page, limit, skip } = parsePageQuery(query);
  const [items, total] = await Promise.all([
    Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments({ user: userId }),
  ]);
  return { items, ...buildPageMeta(total, page, limit) };
}

async function markPaidByStripeSession({ sessionId, orderId }) {
  const order = await Order.findById(orderId);
  if (!order) throw new NotFound('Order not found', 'ORDER_NOT_FOUND');
  if (order.paymentStatus === 'paid') return order.toJSON();

  order.paymentStatus = 'paid';
  order.stripeSessionId = sessionId;
  if (order.status === 'pending') {
    order.status = 'confirmed';
    order.statusHistory.push({ status: 'confirmed', by: null });
  }
  await order.save();
  return order.toJSON();
}

const { ORDER_STATUSES } = require('../models/Order');
async function updateStatus({ orderId, status, by }) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new BadRequest('Invalid status', 'INVALID_STATUS');
  }
  const order = await Order.findById(orderId);
  if (!order) throw new NotFound('Order not found', 'ORDER_NOT_FOUND');
  if (order.status === status) return order.toJSON();
  order.status = status;
  order.statusHistory.push({ status, by });
  await order.save();
  return order.toJSON();
}

module.exports = {
  createOrder,
  getOrderForUser,
  listMyOrders,
  markPaidByStripeSession,
  updateStatus,
};
