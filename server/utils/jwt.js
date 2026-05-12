// JWT helpers + refresh-token hashing.
//
// - signAccessToken / verifyAccessToken: short-lived, used on every request.
// - signRefreshToken / verifyRefreshToken: long-lived, sent only to /api/auth/refresh.
// - hashRefreshToken: SHA-256 — stored on the user. We compare hashes (not raw
//   tokens) on refresh to keep token reuse detectable without leaking the
//   live token through the DB.

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { env } = require('../config/env');

function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL,
  });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
};
