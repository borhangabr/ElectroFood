// Vercel serverless function entry point
// The Express app is already set up as middleware in app.js

const { connectDb } = require('./config/db');
const app = require('./app');

// Cache the database connection across invocations
let dbConnected = false;

// Connect to DB on first invocation
connectDb().then(() => {
  dbConnected = true;
}).catch(err => {
  console.error('DB connection error:', err.message);
});

// Export the Express app directly for Vercel
module.exports = app;
