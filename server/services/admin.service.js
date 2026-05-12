// Admin service: aggregates and mutations behind requireAdmin.
// Image uploads happen in the controller (Multer parses multipart first);
// services accept the {url, publicId} payload and persist it on the doc.

const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const orderService = require('./order.service');
const cloudinaryService = require('./cloudinary.service');
const { NotFound, Conflict } = require('../utils/errors');
const { parsePageQuery, buildPageMeta } = require('../utils/pagination');

// ---- Categories ----
async function listCategories() {
  return Category.find({}).sort({ order: 1, createdAt: 1 }).lean();
}

async function createCategory({ payload, image }) {
  // Slug uniqueness enforced by the unique index — translate dup key into 409.
  try {
    const doc = await Category.create({
      name: payload.name,
      slug: payload.slug,
      order: payload.order,
      isActive: payload.isActive,
      image: image?.url || '',
      imagePublicId: image?.publicId || '',
    });
    return doc.toJSON();
  } catch (err) {
    if (err?.code === 11000) throw new Conflict('Slug already exists', 'SLUG_TAKEN');
    throw err;
  }
}

async function updateCategory({ id, payload, image }) {
  const doc = await Category.findById(id);
  if (!doc) throw new NotFound('Category not found', 'CATEGORY_NOT_FOUND');

  if (payload.name) doc.name = payload.name;
  if (payload.slug) doc.slug = payload.slug;
  if (payload.order !== undefined) doc.order = payload.order;
  if (payload.isActive !== undefined) doc.isActive = payload.isActive;

  // If a new image arrived, destroy the old one so Cloudinary doesn't fill up.
  if (image) {
    if (doc.imagePublicId) await cloudinaryService.destroy(doc.imagePublicId);
    doc.image = image.url;
    doc.imagePublicId = image.publicId;
  }

  try {
    await doc.save();
  } catch (err) {
    if (err?.code === 11000) throw new Conflict('Slug already exists', 'SLUG_TAKEN');
    throw err;
  }
  return doc.toJSON();
}

async function deleteCategory(id) {
  const doc = await Category.findById(id);
  if (!doc) throw new NotFound('Category not found', 'CATEGORY_NOT_FOUND');

  // Soft guard: don't allow delete if products still reference it.
  const productCount = await Product.countDocuments({ category: doc._id });
  if (productCount > 0) {
    throw new Conflict(
      `Category has ${productCount} product(s); reassign or delete them first`,
      'CATEGORY_HAS_PRODUCTS',
    );
  }
  if (doc.imagePublicId) await cloudinaryService.destroy(doc.imagePublicId);
  await doc.deleteOne();
}

// ---- Products ----
async function listProducts(query) {
  const { page, limit, skip } = parsePageQuery(query);
  const filter = {};
  if (query.category) filter.category = query.category;
  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'slug name')
      .lean(),
    Product.countDocuments(filter),
  ]);
  return { items, ...buildPageMeta(total, page, limit) };
}

async function createProduct({ payload, image }) {
  const cat = await Category.findById(payload.category).select('_id').lean();
  if (!cat) throw new NotFound('Category not found', 'CATEGORY_NOT_FOUND');
  const doc = await Product.create({
    name: payload.name,
    description: payload.description || { en: '', ar: '' },
    price: payload.price,
    category: cat._id,
    isAvailable: payload.isAvailable,
    tags: payload.tags || [],
    image: image?.url || '',
    imagePublicId: image?.publicId || '',
  });
  return doc.toJSON();
}

async function updateProduct({ id, payload, image }) {
  const doc = await Product.findById(id);
  if (!doc) throw new NotFound('Product not found', 'PRODUCT_NOT_FOUND');

  if (payload.name) doc.name = payload.name;
  if (payload.description) doc.description = payload.description;
  if (payload.price !== undefined) doc.price = payload.price;
  if (payload.category) {
    const cat = await Category.findById(payload.category).select('_id').lean();
    if (!cat) throw new NotFound('Category not found', 'CATEGORY_NOT_FOUND');
    doc.category = cat._id;
  }
  if (payload.isAvailable !== undefined) doc.isAvailable = payload.isAvailable;
  if (payload.tags) doc.tags = payload.tags;

  if (image) {
    if (doc.imagePublicId) await cloudinaryService.destroy(doc.imagePublicId);
    doc.image = image.url;
    doc.imagePublicId = image.publicId;
  }

  await doc.save();
  return doc.toJSON();
}

async function deleteProduct(id) {
  const doc = await Product.findById(id);
  if (!doc) throw new NotFound('Product not found', 'PRODUCT_NOT_FOUND');
  if (doc.imagePublicId) await cloudinaryService.destroy(doc.imagePublicId);
  await doc.deleteOne();
}

// ---- Orders ----
async function listOrders(query) {
  const { page, limit, skip } = parsePageQuery(query);
  const filter = {};
  if (query.status) filter.status = query.status;
  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .lean(),
    Order.countDocuments(filter),
  ]);
  return { items, ...buildPageMeta(total, page, limit) };
}

async function updateOrderStatus({ orderId, status, by }) {
  return orderService.updateStatus({ orderId, status, by });
}

// ---- Users ----
async function listUsers(query) {
  const { page, limit, skip } = parsePageQuery(query);
  const [items, total] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments({}),
  ]);
  // Strip secrets defensively (lean bypasses toJSON transform).
  for (const u of items) {
    delete u.passwordHash;
    delete u.refreshTokenHash;
  }
  return { items, ...buildPageMeta(total, page, limit) };
}

async function setUserBlocked({ userId, isBlocked }) {
  const u = await User.findById(userId);
  if (!u) throw new NotFound('User not found', 'USER_NOT_FOUND');
  // Don't ever lock yourself out: refuse to block the last admin.
  if (isBlocked && u.role === 'admin') {
    const remaining = await User.countDocuments({ role: 'admin', isBlocked: false, _id: { $ne: u._id } });
    if (remaining === 0) {
      throw new Conflict('Cannot block the last active admin', 'LAST_ADMIN');
    }
  }
  u.isBlocked = isBlocked;
  if (isBlocked) u.refreshTokenHash = null; // force re-login if unblocked
  await u.save();
  return u.toJSON();
}

// ---- Stats ----
async function getStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Match only revenue-bearing orders. Paid Stripe orders count immediately;
  // for the prototype we also count COD orders that reached `delivered`.
  const revenueMatch = {
    $or: [{ paymentStatus: 'paid' }, { status: 'delivered', paymentMethod: 'cod' }],
  };

  const sumSince = async (date) => {
    const [row] = await Order.aggregate([
      { $match: { ...revenueMatch, createdAt: { $gte: date } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);
    return { total: row?.total || 0, count: row?.count || 0 };
  };

  const [today, week, month, byStatus, productCount, categoryCount, userCount] = await Promise.all([
    sumSince(startOfToday),
    sumSince(startOfWeek),
    sumSince(startOfMonth),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Product.countDocuments({}),
    Category.countDocuments({}),
    User.countDocuments({ role: 'customer' }),
  ]);

  return {
    revenue: { today, week, month },
    ordersByStatus: byStatus.reduce((m, b) => ({ ...m, [b._id]: b.count }), {}),
    productCount,
    categoryCount,
    userCount,
  };
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listOrders,
  updateOrderStatus,
  listUsers,
  setUserBlocked,
  getStats,
};
