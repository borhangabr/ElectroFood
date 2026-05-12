// Vercel serverless function entry point
// Exports the Express app for Vercel to handle HTTP requests

const { connectDb } = require('./config/db');
const app = require('./app');

// Cache the database connection across invocations
let dbConnected = false;

module.exports = async (req, res) => {
  // Connect to MongoDB once (cached across invocations)
  if (!dbConnected) {
    await connectDb();
    dbConnected = true;
  }

  // Pass the request to Express
  app(req, res);
};
