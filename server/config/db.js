// Mongoose connection. Exits the process if the initial connect fails
// (no point running the server with no DB); logs reconnect events after that.
const mongoose = require('mongoose');
const { env } = require('./env');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

async function connectDb() {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 60_000,
      socketTimeoutMS: 90_000,
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30_000,
      waitQueueTimeoutMS: 60_000,
      autoIndex: env.NODE_ENV !== 'production', // build indexes in dev/test only
    });
    logger.info({ db: mongoose.connection.name }, 'mongo connected');
  } catch (err) {
    logger.fatal({ err: err.message }, 'mongo connect failed');
    if (env.NODE_ENV === 'production') {
      // In production (Vercel), don't exit — let the app serve errors gracefully
      logger.error({ err: err.message }, 'mongo connection failed but continuing');
    } else {
      process.exit(1);
    }
  }

  mongoose.connection.on('disconnected', () => logger.warn('mongo disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('mongo reconnected'));
  mongoose.connection.on('error', (err) => logger.error({ err: err.message }, 'mongo error'));
}

function dbReady() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDb, dbReady };
