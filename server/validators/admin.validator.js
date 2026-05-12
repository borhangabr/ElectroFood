const { z } = require('zod');

const bilingual = z.object({
  en: z.string().trim().min(1).max(120),
  ar: z.string().trim().min(1).max(120),
});
const bilingualDesc = z.object({
  en: z.string().trim().max(800).optional().default(''),
  ar: z.string().trim().max(800).optional().default(''),
});

// Admin form submissions land as multipart/form-data, so nested fields arrive
// as either real JSON strings or flat keys. We pre-parse JSON-coded strings.
function jsonish(field) {
  return z.preprocess((v) => {
    if (typeof v !== 'string') return v;
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }, field);
}

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

const upsertCategory = {
  body: z.object({
    name: jsonish(bilingual),
    slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/, 'lowercase letters/digits/hyphens only'),
    order: z.coerce.number().int().min(0).optional().default(0),
    isActive: z.preprocess((v) => v === 'false' ? false : v === 'true' ? true : v, z.boolean().optional().default(true)),
  }),
};

const updateCategory = {
  params: z.object({ id: objectId }),
  body: z.object({
    name: jsonish(bilingual).optional(),
    slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/).optional(),
    order: z.coerce.number().int().min(0).optional(),
    isActive: z.preprocess((v) => v === 'false' ? false : v === 'true' ? true : v, z.boolean().optional()),
  }),
};

const upsertProduct = {
  body: z.object({
    name: jsonish(bilingual),
    description: jsonish(bilingualDesc).optional(),
    price: z.coerce.number().min(0),
    category: objectId,
    isAvailable: z.preprocess((v) => v === 'false' ? false : v === 'true' ? true : v, z.boolean().optional().default(true)),
    tags: jsonish(z.array(z.string()).optional()).optional(),
  }),
};

const updateProduct = {
  params: z.object({ id: objectId }),
  body: z.object({
    name: jsonish(bilingual).optional(),
    description: jsonish(bilingualDesc).optional(),
    price: z.coerce.number().min(0).optional(),
    category: objectId.optional(),
    isAvailable: z.preprocess((v) => v === 'false' ? false : v === 'true' ? true : v, z.boolean().optional()),
    tags: jsonish(z.array(z.string()).optional()).optional(),
  }),
};

const orderStatusUpdate = {
  params: z.object({ id: objectId }),
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
  }),
};

const listOrders = {
  query: z.object({
    status: z.enum(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  }),
};

const blockUser = {
  params: z.object({ id: objectId }),
  body: z.object({ isBlocked: z.boolean() }),
};

module.exports = {
  upsertCategory,
  updateCategory,
  upsertProduct,
  updateProduct,
  orderStatusUpdate,
  listOrders,
  blockUser,
};
