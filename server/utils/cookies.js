// Single source of truth for the auth cookie.
//
// We use a single long-lived access token cookie (no refresh token). This
// simplifies cross-domain deployment on Vercel where the frontend and backend
// live on different subdomains. The access token TTL is set to 7 days, which
// is a reasonable trade-off for a prototype.
//
// Mismatched options between set and clear is the #1 cause of "logout doesn't
// clear the cookie." Always go through setAuthCookie / clearAuthCookie.

const { env } = require('../config/env');

const IS_PROD = env.NODE_ENV === 'production';

const baseCookieOptions = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'none' : 'lax',
  path: '/',
};

const ACCESS_COOKIE = 'fo_at';

function setAuthCookies(res, { accessToken }) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  });
}

function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { ...baseCookieOptions });
}

module.exports = { setAuthCookies, clearAuthCookies, ACCESS_COOKIE };
