// Product model. Bilingual name + description, priced in MAJOR currency units
// (e.g. dollars). We convert to cents at the Stripe boundary only.
//
// Index notes:
//   - category: filtered listings ("show me pizzas") run on every menu visit.
//   - isAvailable: admin can soft-hide a product without deleting it.

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, trim: true, maxlength: 120 },
      ar: { type: String, required: true, trim: true, maxlength: 120 },
    },
    description: {
      en: { type: String, default: '', trim: true, maxlength: 800 },
      ar: { type: String, default: '', trim: true, maxlength: 800 },
    },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' }, // Cloudinary id
    // Indexed: every public listing filters/groups by category.
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    isAvailable: { type: Boolean, default: true, index: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

// Compound index supporting the most common query: list available products
// in a category, newest first.
productSchema.index({ category: 1, isAvailable: 1, createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
