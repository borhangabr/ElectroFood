// On serverless (Vercel), function instances start cold and Mongoose can take
// 5–30 seconds to reach Atlas the first time. Without this guard, the very
// first request on a cold instance hits a query while readyState is still 2
// (connecting) and times out at 10s with a "buffering timed out" error.
//
// This middleware blocks every request until mongoose.connection.readyState === 1,
// retrying the connect call if it's not in progress. Once warm, it's a no-op
// (single readyState check) and adds zero latency.

const mongoose = require('mongoose');
const { connectDb } = require('../config/db');
const logger = require('../utils/logger');

const READY = 1;       // connected
const CONNECTING = 2;  // mongoose dialing
const POLL_MS = 100;
const TOTAL_WAIT_MS = 30_000;

let connectInFlight = null;

async function waitForReady() {
  if (mongoose.connection.readyState === READY) return true;

  // Kick off (or re-use) a connect call if we're not already mid-handshake.
  if (mongoose.connection.readyState !== CONNECTING && !connectInFlight) {
    connectInFlight = connectDb()
      .catch((err) => {
        logger.error({ err: err.message }, 'dbReady: connectDb retry failed');
      })
      .finally(() => {
        connectInFlight = null;
      });
  }

  const deadline = Date.now() + TOTAL_WAIT_MS;
  while (Date.now() < deadline) {
    if (mongoose.connection.readyState === READY) return true;
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  return mongoose.connection.readyState === READY;
}

module.exports = async function dbReady(req, res, next) {
  // Fast path: already connected. Don't even await — synchronous next() keeps
  // the hot-path overhead at zero.
  if (mongoose.connection.readyState === READY) return next();

  const ok = await waitForReady();
  if (!ok) {
    return res.status(503).json({
      success: false,
      message: 'Database is warming up, please retry',
      code: 'DB_WARMING',
      requestId: req.id,
    });
  }
  next();
};
