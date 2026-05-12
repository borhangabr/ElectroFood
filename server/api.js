// Vercel serverless function entry point
const { connectDb } = require('./config/db');
const app = require('./app');

// Attempt connection on cold start (non-blocking)
connectDb().catch(err => {
  console.error('[Vercel] DB connection error:', err.message);
});

// Export the Express app directly for Vercel
module.exports = app;
