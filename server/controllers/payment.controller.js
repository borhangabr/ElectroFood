// Payment HTTP boundary.
//
// IMPORTANT: webhook() is mounted in app.js BEFORE express.json(). It reads
// req.body as a raw Buffer (set by express.raw()). Do NOT change that wiring.

const paymentService = require('../services/payment.service');

exports.createCheckoutSession = async (req, res) => {
  const { url, sessionId } = await paymentService.createCheckoutSession({
    userId: req.user?.id || null,
    role: req.user?.role || null,
    orderId: req.body.orderId,
    guestToken: req.body.guestToken || null,
  });
  res.json({ success: true, data: { url, sessionId } });
};

// Local-dev fallback: success page calls this so the order flips to paid even
// when the Stripe CLI isn't tunneling webhooks to localhost. Stripe stays the
// source of truth — we ask it via sessions.retrieve.
exports.confirmCheckoutSession = async (req, res) => {
  const result = await paymentService.confirmCheckoutSession({
    userId: req.user?.id || null,
    role: req.user?.role || null,
    orderId: req.body.orderId,
    guestToken: req.body.guestToken || null,
  });
  res.json({ success: true, data: result });
};

exports.webhook = async (req, res, next) => {
  try {
    const signature = req.header('stripe-signature');
    const data = await paymentService.handleStripeEvent(req.body, signature);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
