// HTTP boundary for auth. Translates service results → cookies + JSON.
// No business logic here — that lives in services/auth.service.js.

const authService = require('../services/auth.service');
const { setAuthCookies, clearAuthCookies, REFRESH_COOKIE } = require('../utils/cookies');

exports.register = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  setAuthCookies(res, { accessToken, refreshToken });
  res.status(201).json({ success: true, data: { user } });
};

exports.login = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  setAuthCookies(res, { accessToken, refreshToken });
  res.json({ success: true, data: { user } });
};

exports.refresh = async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  const { user, accessToken, refreshToken } = await authService.refresh(token);
  setAuthCookies(res, { accessToken, refreshToken });
  res.json({ success: true, data: { user } });
};

exports.logout = async (req, res) => {
  // req.user may be absent if the access token already expired — that's fine,
  // we still clear the cookies. If we have a user, also wipe the server hash.
  if (req.user?.id) await authService.logout(req.user.id);
  clearAuthCookies(res);
  res.json({ success: true, data: { ok: true } });
};

exports.me = async (req, res) => {
  const user = await authService.me(req.user.id);
  res.json({ success: true, data: { user } });
};
