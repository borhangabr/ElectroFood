// Gates admin-only routes. Must run AFTER requireAuth so req.user is set.
const { Forbidden } = require('../utils/errors');

module.exports = function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') {
    return next(new Forbidden('Admin only', 'ADMIN_REQUIRED'));
  }
  next();
};
