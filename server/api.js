// Vercel serverless function entry point
const { connectDb } = require('./config/db');
const app = require('./app');

// Attempt connection on cold start
connectDb();

// Export the Express app directly for Vercel
module.exports = app;
