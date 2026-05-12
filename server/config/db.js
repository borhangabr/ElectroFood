// Mongoose connection. Exits the process if the initial connect fails
// (no point running the server with no DB); logs reconnect events after that.
const mongoose = require('mongoose');
const { env } = require('./env');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

async function connectDb() {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10_000,
      autoIndex: env.NODE_ENV !== 'production', // build indexes in dev/test only
    });
    logger.info({ db: mongoose.connection.name }, 'mongo connected');
  } catch (err) {
    logger.fatal({ err: err.message }, 'mongo connect failed');
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => logger.warn('mongo disconnected'));
  mongoose.connection.on('reconnected', () => logger.info('mongo reconnected'));
  mongoose.connection.on('error', (err) => logger.error({ err: err.message }, 'mongo error'));
}

function dbReady() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDb, dbReady };
