// Vercel serverless function entry point
// The Express app is already set up as middleware in app.js

const mongoose = require('mongoose');
const { env } = require('./config/env');
const app = require('./app');

// Set global Mongoose timeout defaults
mongoose.set('serverSelectionTimeoutMS', 120_000);
mongoose.set('socketTimeoutMS', 120_000);

// Cache the connection promise across invocations
let connectionPromise = null;

function ensureDbConnection() {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  // If connection attempt is in progress, return that promise
  if (connectionPromise) {
    return connectionPromise;
  }

  // Initiate new connection attempt
  connectionPromise = mongoose
    .connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 120_000,
      socketTimeoutMS: 120_000,
      maxPoolSize: 2,
      minPoolSize: 0,
      maxIdleTimeMS: 60_000,
      waitQueueTimeoutMS: 120_000,
      family: 4, // Force IPv4
      retryWrites: true,
      retryReads: true,
      autoIndex: env.NODE_ENV !== 'production',
    })
    .then(() => {
      console.log('[Vercel] MongoDB connected');
      return true;
    })
    .catch(err => {
      console.error('[Vercel] MongoDB connection failed:', err.message);
      connectionPromise = null; // Reset on failure to retry next time
      throw err;
    });

  return connectionPromise;
}

// Attempt initial connection (non-blocking)
ensureDbConnection().catch(err => {
  console.error('[Vercel] Initial connection failed, will retry on first request');
});

// Middleware to ensure DB is connected before handling requests
app.use((req, res, next) => {
  ensureDbConnection()
    .then(() => {
      console.log('[Vercel] DB ready for request');
      next();
    })
    .catch(err => {
      console.error('[Vercel] Connection check failed:', err.message);
      // Continue anyway; error responses will be handled by app middleware
      next();
    });
});

// Export the Express app directly for Vercel
module.exports = app;
