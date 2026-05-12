const { z } = require('zod');

const listProducts = {
  query: z
    .object({
      category: z.string().trim().optional(), // category slug OR id
      q: z.string().trim().max(80).optional(),
      page: z.coerce.number().int().positive().optional(),
      limit: z.coerce.number().int().positive().max(100).optional(),
    })
    .strict(),
};

const productById = {
  params: z.object({
    id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid product id'),
  }),
};

module.exports = { listProducts, productById };
