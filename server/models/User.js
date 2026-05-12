// User model.
//
// - email is the login identity (unique index — also documented inline)
// - passwordHash uses bcrypt (12 rounds) per CLAUDE.md §B.7
// - role gates admin routes via admin.middleware
// - refreshTokenHash stores the SHA-256 of the active refresh token so we
//   can detect refresh-token reuse (theft signal) and rotate safely.
// - language is a hint for sending localized notifications later; UI uses
//   browser/localStorage detection regardless.

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, maxlength: 40 },
    line1: { type: String, required: true, trim: true, maxlength: 200 },
    city: { type: String, trim: true, maxlength: 80 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    // Unique index: lookups on every login + register-conflict check.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer', index: true },
    phone: { type: String, trim: true, maxlength: 32 },
    addresses: { type: [addressSchema], default: [] },
    language: { type: String, enum: ['en', 'ar'], default: 'en' },
    isBlocked: { type: Boolean, default: false },
    // Hashed (not the raw refresh token). Compared on /auth/refresh to detect reuse.
    refreshTokenHash: { type: String, default: null, select: false },
  },
  { timestamps: true },
);

// Never leak the password hash or refresh token hash through toJSON.
userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
