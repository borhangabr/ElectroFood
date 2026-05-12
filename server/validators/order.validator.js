const { z } = require('zod');

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

// Required guest contact block when no authed user.
// Name, phone, and email are all required for guest checkout.
const guest = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(5).max(32),
  email: z.string().email().max(254),
});

const createOrder = {
  body: z
    .object({
      items: z
        .array(
          z.object({
            productId: objectId,
            quantity: z.number().int().positive().max(99),
          }),
        )
        .min(1, 'Cart is empty')
        .max(50, 'Too many items'),
      address: z.object({
        line1: z.string().trim().min(3).max(200),
        city: z.string().trim().max(80).optional().default(''),
        phone: z.string().trim().min(5).max(32),
        notes: z.string().trim().max(300).optional().default(''),
      }),
      paymentMethod: z.enum(['stripe', 'cod']),
      // Guest contact for unauthenticated checkout. Ignored when user is logged in.
      guest: guest.optional(),
    })
    .strict(),
};

const orderById = {
  params: z.object({ id: objectId }),
  query: z
    .object({
      token: z.string().min(20).max(200).optional(),
    })
    .strict()
    .optional(),
};

const listOrders = {
  query: z
    .object({
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
    })
    .strict(),
};

module.exports = { createOrder, orderById, listOrders };
