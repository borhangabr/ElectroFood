// Vercel serverless function entry point
const mongoose = require('mongoose');
const { env } = require('./config/env');
const app = require('./app');

// Set global timeouts to handle slow MongoDB connections
mongoose.set('serverSelectionTimeoutMS', 60_000);
mongoose.set('socketTimeoutMS', 90_000);

// Simple connection cache
let db = null;

async function connectDb() {
  if (db) return db;
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 60_000,
      socketTimeoutMS: 90_000,
      maxPoolSize: 5,
      minPoolSize: 1,
      autoIndex: env.NODE_ENV !== 'production',
    });
    db = mongoose.connection;
    console.log('[api.js] MongoDB connected');
  } catch (err) {
    console.error('[api.js] MongoDB connection failed:', err.message);
    throw err;
  }
}

// Try to connect on cold start (non-blocking)
connectDb().catch(err => console.error('[api.js] Cold start connection failed'));

// Middleware: ensure connection before processing
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
  connectDb().then(() => next()).catch(() => next());
});

module.exports = app;
