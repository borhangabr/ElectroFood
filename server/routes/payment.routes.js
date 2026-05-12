// NOTE: the webhook is wired SEPARATELY in app.js (before express.json) so the
// raw body reaches the controller untouched. These routes use the normal
// JSON parser.

const { Router } = require('express');

const ctrl = require('../controllers/payment.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { optionalAuth } = require('../middlewares/auth.middleware');
const v = require('../validators/payment.validator');

const router = Router();

// optionalAuth: authed users skip the guestToken; guests must include it.
// Authorization (admin / owner / guest-token) is enforced inside the service.
router.post(
  '/checkout-session',
  optionalAuth,
  validate(v.createCheckoutSession),
  asyncHandler(ctrl.createCheckoutSession),
);

// Called by the success page in local dev (or as a belt-and-suspenders check
// in prod). Stripe is the source of truth — we ask it directly.
router.post(
  '/confirm',
  optionalAuth,
  validate(v.confirmCheckoutSession),
  asyncHandler(ctrl.confirmCheckoutSession),
);

module.exports = router;
