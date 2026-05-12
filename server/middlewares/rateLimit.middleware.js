// Rate limiters.
//
//   authLimiter   — protects /api/auth/{login,register,refresh}: 10 req / 15 min per IP.
//   globalLimiter — softer global guard: 300 req / 15 min per IP.
//
// Both no-op in test mode so suites stay deterministic.

const rateLimit = require("express-rate-limit");
const { env } = require("../config/env");

const SHARED = {
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, slow down.",
    code: "RATE_LIMITED",
  },
  skip: () => env.NODE_ENV === "test",
};

const authLimiter = rateLimit({
  windowMs: 1000,
  max: 10,
  ...SHARED,
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  ...SHARED,
});

module.exports = { authLimiter, globalLimiter };
