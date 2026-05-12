// Process entry point. Connects to Mongo, then starts the HTTP server.
// Kept separate from app.js so tests can import the app without booting a port.

const { env } = require('./config/env');
const { connectDb } = require('./config/db');
const logger = require('./utils/logger');
const app = require('./app');

(async function bootstrap() {
  await connectDb();

  const server = app.listen(env.PORT, () => {
    logger.info(`api listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  // Graceful shutdown: stop accepting new connections, then exit.
  const shutdown = (signal) => () => {
    logger.info(`received ${signal}, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref(); // hard kill if hung
  };
  process.on('SIGTERM', shutdown('SIGTERM'));
  process.on('SIGINT', shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error({ err: err?.message, stack: err?.stack }, 'unhandledRejection');
  });
  process.on('uncaughtException', (err) => {
    logger.fatal({ err: err.message, stack: err.stack }, 'uncaughtException');
    process.exit(1);
  });
})();
