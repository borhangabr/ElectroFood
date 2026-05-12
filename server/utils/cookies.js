// Single source of truth for auth-cookie options.
//
// Mismatched options between set and clear is the #1 cause of "logout doesn't
// clear the cookie." Always go through setAuthCookies / clearAuthCookies.
//
// In dev the frontend runs through Vite's /api proxy, so the browser sees the
// API as same-origin (:5173 → :5173). That means sameSite:'lax' works without
// secure:true. In prod the frontend (electro-food-one.vercel.app) and backend
// (electro-food-api.vercel.app) are on different Vercel subdomains — they are
// cross-site, so we need sameSite:'none' (with secure:true) for cookies to flow.

const { env } = require('../config/env');

const IS_PROD = env.NODE_ENV === 'production';

const baseCookieOptions = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'none' : 'lax',
  path: '/',
};

// 15 min and 7 days respectively — matches JWT_ACCESS_TTL / JWT_REFRESH_TTL.
// We mirror the JWT lifetime in the cookie maxAge so browsers drop expired ones.
const ACCESS_COOKIE = 'fo_at';
const REFRESH_COOKIE = 'fo_rt';

function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000, // 15m
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
    // Tighten the refresh cookie path so it's only sent to /api/auth/* routes.
    // Shrinks attack surface; access token still goes everywhere.
    path: '/api/auth',
  });
}

function clearAuthCookies(res) {
  // Must match the options used at set time (sameSite + secure + path) or
  // some browsers refuse to clear. We pass the same base options minus maxAge.
  res.clearCookie(ACCESS_COOKIE, { ...baseCookieOptions });
  res.clearCookie(REFRESH_COOKIE, { ...baseCookieOptions, path: '/api/auth' });
}

module.exports = { setAuthCookies, clearAuthCookies, ACCESS_COOKIE, REFRESH_COOKIE };
