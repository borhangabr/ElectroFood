// Stripe client singleton. Reads STRIPE_SECRET from env; throws clearly if
// payment endpoints are called without it (Phase 6+ feature).

const Stripe = require('stripe');
const { env } = require('./env');
const { AppError } = require('../utils/errors');

let _stripe = null;

function getStripe() {
  if (!env.STRIPE_SECRET) {
    throw new AppError(
      'Online payments are not configured on this server',
      { status: 503, code: 'STRIPE_NOT_CONFIGURED' },
    );
  }
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET, {
      // Pin the API version so SDK upgrades don't subtly change behaviour.
      apiVersion: '2024-06-20',
      typescript: false,
    });
  }
  return _stripe;
}

module.exports = { getStripe };
