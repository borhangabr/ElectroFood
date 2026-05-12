// Vercel serverless function entry point
// The Express app is already set up as middleware in app.js

const mongoose = require('mongoose');
const { env } = require('./config/env');
const app = require('./app');

// Cache the database connection across invocations
let dbConnected = false;

// Connect to DB on first invocation (non-blocking)
if (!dbConnected && !mongoose.connection.readyState) {
  mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10_000,
    autoIndex: env.NODE_ENV !== 'production',
  }).then(() => {
    dbConnected = true;
    console.log('[Vercel] MongoDB connected');
  }).catch(err => {
    console.error('[Vercel] MongoDB connection failed:', err.message);
  });
}

// Export the Express app directly for Vercel
module.exports = app;
