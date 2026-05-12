const { Router } = require('express');

const ctrl = require('../controllers/order.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { requireAuth, optionalAuth } = require('../middlewares/auth.middleware');
const v = require('../validators/order.validator');

const router = Router();

// POST /api/orders — guests can create orders too. optionalAuth attaches
// req.user if a valid cookie is present; otherwise req.user stays null and the
// service requires `guest: { name, email, phone }` in the body.
router.post('/', optionalAuth, validate(v.createOrder), asyncHandler(ctrl.create));

// /mine is per-user; needs auth.
router.get('/mine', requireAuth, validate(v.listOrders), asyncHandler(ctrl.getMine));

// /:id allows admin / owner / guest-with-token. optionalAuth + token in query.
router.get('/:id', optionalAuth, validate(v.orderById), asyncHandler(ctrl.getOne));

module.exports = router;
