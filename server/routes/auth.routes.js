const { Router } = require('express');

const ctrl = require('../controllers/auth.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { requireAuth, optionalAuth } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimit.middleware');
const v = require('../validators/auth.validator');

const router = Router();

router.post('/register', authLimiter, validate(v.register), asyncHandler(ctrl.register));
router.post('/login', authLimiter, validate(v.login), asyncHandler(ctrl.login));
router.post('/refresh', authLimiter, asyncHandler(ctrl.refresh));
router.post('/logout', optionalAuth, asyncHandler(ctrl.logout));
router.get('/me', requireAuth, asyncHandler(ctrl.me));

module.exports = router;
