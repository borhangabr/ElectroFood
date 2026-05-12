const { dbReady } = require('../config/db');

exports.health = (req, res) => {
  const db = dbReady() ? 'up' : 'down';
  const ok = db === 'up';
  res.status(ok ? 200 : 503).json({
    success: ok,
    data: {
      ok,
      db,
      env: process.env.NODE_ENV,
      uptime: Math.round(process.uptime()),
      requestId: req.id,
    },
  });
};
