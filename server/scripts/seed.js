/* Idempotent seed script.
 *
 *   npm run seed           — upserts admin + categories + products
 *   npm run seed:fresh     — wipes non-admin users + categories + products + orders first
 *
 * Uses upserts so re-running is safe. Prints the admin credentials at the end
 * — this is acceptable only in a dev seed, never in production paths.
 */

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const { connectDb } = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const logger = require('../utils/logger');

const WIPE = process.argv.includes('--wipe');

const ADMIN_EMAIL = 'admin@food.test';
const ADMIN_PASSWORD = 'Admin123!';

const CATEGORIES = [
  { slug: 'pizza', name: { en: 'Pizza', ar: 'بيتزا' }, order: 1, image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600' },
  { slug: 'burgers', name: { en: 'Burgers', ar: 'برغر' }, order: 2, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600' },
  { slug: 'desserts', name: { en: 'Desserts', ar: 'حلويات' }, order: 3, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600' },
  { slug: 'salads', name: { en: 'Salads', ar: 'سلطات' }, order: 4, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600' },
];

const PRODUCTS = [
  // Pizzas
  { slug: 'pizza', n_en: 'Margherita', n_ar: 'مارغريتا', d_en: 'San Marzano tomato, mozzarella, basil.', d_ar: 'طماطم سان مارزانو، موزاريلا، ريحان.', price: 9, img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800' },
  { slug: 'pizza', n_en: 'Pepperoni', n_ar: 'بيبروني', d_en: 'Spicy cured pepperoni and mozzarella.', d_ar: 'بيبروني حار وموزاريلا.', price: 11, img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800' },
  { slug: 'pizza', n_en: 'BBQ Chicken', n_ar: 'دجاج باربكيو', d_en: 'Smoky BBQ chicken, red onion, cilantro.', d_ar: 'دجاج باربكيو، بصل أحمر، كزبرة.', price: 13, img: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800' },
  { slug: 'pizza', n_en: 'Veggie Supreme', n_ar: 'خضار سوبريم', d_en: 'Peppers, olives, mushrooms, onions.', d_ar: 'فلفل، زيتون، فطر، بصل.', price: 10, img: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=800' },

  // Burgers
  { slug: 'burgers', n_en: 'Classic Burger', n_ar: 'برغر كلاسيك', d_en: 'Smashed beef patty, lettuce, tomato, house sauce.', d_ar: 'لحم بقري مطحون، خس، طماطم، صلصة المنزل.', price: 7, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800' },
  { slug: 'burgers', n_en: 'Double Cheese', n_ar: 'دبل تشيز', d_en: 'Two patties, double cheddar, pickles.', d_ar: 'قطعتان لحم، شيدر مضاعف، مخللات.', price: 10, img: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=800' },
  { slug: 'burgers', n_en: 'Spicy Chicken', n_ar: 'دجاج حار', d_en: 'Crispy chicken with chipotle mayo and jalapeños.', d_ar: 'دجاج مقرمش مع مايونيز شيبوتلي وفلفل هالابينو.', price: 9, img: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800' },
  { slug: 'burgers', n_en: 'Mushroom Swiss', n_ar: 'مشروم سويسري', d_en: 'Sautéed mushrooms, swiss cheese, garlic aioli.', d_ar: 'فطر سوتيه، جبنة سويسرية، أيولي الثوم.', price: 11, img: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800' },

  // Desserts
  { slug: 'desserts', n_en: 'Chocolate Brownie', n_ar: 'براوني الشوكولاتة', d_en: 'Warm fudgy brownie with vanilla ice cream.', d_ar: 'براوني دافئ مع آيس كريم فانيليا.', price: 5, img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800' },
  { slug: 'desserts', n_en: 'Tiramisu', n_ar: 'تيراميسو', d_en: 'Espresso-soaked ladyfingers, mascarpone, cocoa.', d_ar: 'بسكويت مغمس بالإسبريسو، ماسكاربوني، كاكاو.', price: 6, img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800' },
  { slug: 'desserts', n_en: 'NY Cheesecake', n_ar: 'تشيز كيك نيويورك', d_en: 'Classic baked cheesecake with berry coulis.', d_ar: 'تشيز كيك مخبوز كلاسيكي مع صلصة التوت.', price: 6, img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800' },
  { slug: 'desserts', n_en: 'Sundae Supreme', n_ar: 'صانداي سوبريم', d_en: 'Vanilla ice cream, hot fudge, nuts, cherry.', d_ar: 'آيس كريم فانيليا، فادج ساخن، مكسرات، كرز.', price: 4, img: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=800' },

  // Salads
  { slug: 'salads', n_en: 'Caesar Salad', n_ar: 'سلطة قيصر', d_en: 'Romaine, parmesan, croutons, house Caesar dressing.', d_ar: 'خس روماني، بارميزان، خبز محمص، صلصة قيصر.', price: 7, img: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800' },
  { slug: 'salads', n_en: 'Greek Salad', n_ar: 'سلطة يونانية', d_en: 'Cucumber, tomato, olives, feta, oregano, olive oil.', d_ar: 'خيار، طماطم، زيتون، جبن فيتا، زعتر، زيت زيتون.', price: 7, img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800' },
  { slug: 'salads', n_en: 'Fattoush', n_ar: 'فتوش', d_en: 'Mixed greens, radish, crispy pita, sumac dressing.', d_ar: 'خضروات مشكلة، فجل، خبز مقرمش، صلصة السماق.', price: 6, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800' },
  { slug: 'salads', n_en: 'Quinoa Bowl', n_ar: 'طبق الكينوا', d_en: 'Quinoa, avocado, cherry tomatoes, lemon tahini.', d_ar: 'كينوا، أفوكادو، طماطم كرزية، طحينة بالليمون.', price: 9, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' },
];

async function upsertAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const res = await User.updateOne(
    { email: ADMIN_EMAIL },
    {
      $setOnInsert: {
        email: ADMIN_EMAIL,
        name: 'Site Admin',
        role: 'admin',
        passwordHash, // only set on insert; we don't overwrite a rotated admin password
      },
    },
    { upsert: true },
  );
  return res.upsertedCount > 0 ? 'created' : 'exists';
}

async function upsertCategories() {
  const map = {};
  for (const c of CATEGORIES) {
    const doc = await Category.findOneAndUpdate(
      { slug: c.slug },
      { $set: { name: c.name, image: c.image, order: c.order, isActive: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    map[c.slug] = doc._id;
  }
  return map;
}

async function upsertProducts(catMap) {
  for (const p of PRODUCTS) {
    const categoryId = catMap[p.slug];
    if (!categoryId) {
      logger.warn({ product: p.n_en, missingCategory: p.slug }, 'skipping product');
      continue;
    }
    await Product.findOneAndUpdate(
      { 'name.en': p.n_en, category: categoryId },
      {
        $set: {
          name: { en: p.n_en, ar: p.n_ar },
          description: { en: p.d_en, ar: p.d_ar },
          price: p.price,
          image: p.img,
          category: categoryId,
          isAvailable: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

async function wipe() {
  // Keep admins safe; clear customers, categories, products, orders.
  const Order = mongoose.models.Order; // may not be registered yet — guarded below
  await User.deleteMany({ role: { $ne: 'admin' } });
  await Category.deleteMany({});
  await Product.deleteMany({});
  if (Order) await Order.deleteMany({});
  logger.info('wiped non-admin users, categories, products, orders');
}

(async function run() {
  await connectDb();

  if (WIPE) await wipe();

  const adminState = await upsertAdmin();
  logger.info({ adminState }, `admin ${adminState}`);

  const catMap = await upsertCategories();
  logger.info({ categories: Object.keys(catMap).length }, 'categories upserted');

  await upsertProducts(catMap);
  const productCount = await Product.countDocuments();
  logger.info({ productCount }, 'products upserted');

  // eslint-disable-next-line no-console
  console.log(`\n  ✅ Seed complete\n  admin:    ${ADMIN_EMAIL}\n  password: ${ADMIN_PASSWORD}\n`);

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  logger.fatal({ err: err.message, stack: err.stack }, 'seed failed');
  process.exit(1);
});
