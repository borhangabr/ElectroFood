// Menu service — public reads only. Admin mutations live in category/admin services.
// All reads use .lean() per CLAUDE.md §B.3 (read-only paths skip Mongoose overhead).

const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { parsePageQuery, buildPageMeta } = require('../utils/pagination');
const { NotFound } = require('../utils/errors');

async function listCategories() {
  return Category.find({ isActive: true })
    .sort({ order: 1, createdAt: 1 })
    .lean();
}

// Escape user input before stuffing into a regex.
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function resolveCategoryFilter(categoryParam) {
  if (!categoryParam) return null;
  // Accept either a 24-char ObjectId or a slug.
  if (/^[a-f0-9]{24}$/i.test(categoryParam)) {
    return new mongoose.Types.ObjectId(categoryParam);
  }
  const cat = await Category.findOne({ slug: categoryParam.toLowerCase() })
    .select('_id')
    .lean();
  return cat ? cat._id : null;
}

async function listProducts(query) {
  const { page, limit, skip } = parsePageQuery(query);

  const filter = { isAvailable: true };

  if (query.category) {
    const id = await resolveCategoryFilter(query.category);
    if (id) filter.category = id;
    else return { items: [], ...buildPageMeta(0, page, limit) };
  }

  if (query.q) {
    const re = new RegExp(escapeRegex(query.q), 'i');
    filter.$or = [{ 'name.en': re }, { 'name.ar': re }, { tags: re }];
  }

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

async function getProductById(id) {
  const product = await Product.findOne({ _id: id, isAvailable: true })
    .populate('category', 'slug name')
    .lean();
  if (!product) throw new NotFound('Product not found', 'PRODUCT_NOT_FOUND');
  return product;
}

module.exports = { listCategories, listProducts, getProductById };
