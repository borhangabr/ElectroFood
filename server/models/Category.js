// Category model. Bilingual names; slug is the public URL key.
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    // Bilingual labels. Admin UI edits both; the wire returns both and the
    // client picks via useLocalizedField.
    name: {
      en: { type: String, required: true, trim: true, maxlength: 80 },
      ar: { type: String, required: true, trim: true, maxlength: 80 },
    },
    // Unique index: public URLs (/menu?category=pizza) + admin lookups.
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' }, // Cloudinary id for deletion
    order: { type: Number, default: 0 }, // sort key on the menu page
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Category', categorySchema);
