const { z } = require('zod');

const orderIdBody = z
  .object({
    orderId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid order id'),
    // Required when the caller has no auth cookie (guest checkout).
    guestToken: z.string().min(20).max(200).optional(),
  })
  .strict();

const createCheckoutSession = { body: orderIdBody };
const confirmCheckoutSession = { body: orderIdBody };

module.exports = { createCheckoutSession, confirmCheckoutSession };
