// HTTP boundary for auth. Translates service results → cookies + JSON.
// No business logic here — that lives in services/auth.service.js.

const authService = require('../services/auth.service');
const { setAuthCookies, clearAuthCookies } = require('../utils/cookies');

exports.register = async (req, res) => {
  const { user, accessToken } = await authService.register(req.body);
  setAuthCookies(res, { accessToken });
  res.status(201).json({ success: true, data: { user } });
};

exports.login = async (req, res) => {
  const { user, accessToken } = await authService.login(req.body);
  setAuthCookies(res, { accessToken });
  res.json({ success: true, data: { user } });
};

exports.logout = async (req, res) => {
  if (req.user?.id) await authService.logout(req.user.id);
  clearAuthCookies(res);
  res.json({ success: true, data: { ok: true } });
};

exports.me = async (req, res) => {
  const user = await authService.me(req.user.id);
  res.json({ success: true, data: { user } });
};
