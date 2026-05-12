// Order model.
//
// CRITICAL: prices are SNAPSHOTS taken at order creation time. The Product's
// current price is never used to display historical orders — `price_snapshot`
// is what the customer paid. Same for `name_snapshot` (so renamed products
// don't rewrite the customer's receipt).
//
// All monetary values are stored in the major currency unit (e.g. dollars),
// matching Product.price. Conversion to Stripe cents happens at the Stripe boundary.

const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];
const PAYMENT_METHODS = ['stripe', 'cod'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name_snapshot: {
      en: { type: String, required: true },
      ar: { type: String, required: true },
    },
    price_snapshot: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 99 },
  },
  { _id: false },
);

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, required: true, trim: true, maxlength: 200 },
    city: { type: String, trim: true, maxlength: 80 },
    phone: { type: String, trim: true, maxlength: 32 },
    notes: { type: String, trim: true, maxlength: 300 },
  },
  { _id: false },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    // Indexed: "my orders" lookup runs on every visit to /orders.
    // Optional now — guest orders have no `user`, just the `guest` block + guestToken.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },

    // Guest contact info (only present when user is null). Required server-side
    // by the validator; the schema keeps it optional so authed orders skip it.
    guest: {
      name: { type: String, trim: true, maxlength: 80 },
      email: { type: String, trim: true, lowercase: true, maxlength: 254 },
      phone: { type: String, trim: true, maxlength: 32 },
    },

    // Random opaque token issued on guest checkout; client uses it to read the
    // order without logging in (e.g. /orders/:id?token=...). Indexed so the
    // GET endpoint can verify cheaply.
    guestToken: { type: String, default: null, index: true, select: false },

    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },

    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },

    address: { type: addressSchema, required: true },

    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'pending', index: true },

    // Indexed: admin Kanban filters by status; customer tracking page queries one.
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },

    statusHistory: { type: [statusHistorySchema], default: [] },

    stripeSessionId: { type: String, default: null, index: true }, // webhook lookup
  },
  { timestamps: true },
);

// Compound index for the admin board: "show me orders by status, newest first".
orderSchema.index({ status: 1, createdAt: -1 });

orderSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.__v;
    // guestToken is select:false but be defensive — toJSON may be called on
    // a doc that explicitly selected it; never let it back into a response.
    delete ret.guestToken;
    return ret;
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
