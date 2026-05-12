// Reads the access-token cookie, verifies it, attaches { id, role } to req.user.
//
// Two shapes:
//   requireAuth  — 401 if no/invalid token (use on protected endpoints).
//   optionalAuth — sets req.user if a valid token is present, never errors
//                  (use on logout, or routes that personalize when logged in).

const { verifyAccessToken } = require('../utils/jwt');
const { ACCESS_COOKIE } = require('../utils/cookies');
const { Unauthorized } = require('../utils/errors');

function readUser(req) {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) return null;
  try {
    const claims = verifyAccessToken(token);
    return { id: claims.sub, role: claims.role };
  } catch {
    return null;
  }
}

function requireAuth(req, _res, next) {
  const user = readUser(req);
  if (!user) return next(new Unauthorized('Authentication required', 'AUTH_REQUIRED'));
  req.user = user;
  next();
}

function optionalAuth(req, _res, next) {
  req.user = readUser(req);
  next();
}

module.exports = { requireAuth, optionalAuth };
