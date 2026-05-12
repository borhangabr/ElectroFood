const { Router } = require('express');

const ctrl = require('../controllers/menu.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const v = require('../validators/menu.validator');

const router = Router();

router.get('/categories', asyncHandler(ctrl.listCategories));
router.get('/products', validate(v.listProducts), asyncHandler(ctrl.listProducts));
router.get('/products/:id', validate(v.productById), asyncHandler(ctrl.getProduct));

module.exports = router;
