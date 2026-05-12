// Admin routes. Auth + admin guard run on every route via the top-level use().
//
// For routes that accept image uploads, multer.single('image') runs BEFORE the
// Zod validator (so req.body has the text fields parsed from multipart).

const { Router } = require('express');

const ctrl = require('../controllers/admin.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const validate = require('../middlewares/validate.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');
const requireAdmin = require('../middlewares/admin.middleware');
const upload = require('../middlewares/upload.middleware');
const v = require('../validators/admin.validator');

const router = Router();
router.use(requireAuth, requireAdmin);

// Categories
router.get('/categories', asyncHandler(ctrl.listCategories));
router.post('/categories', upload.single('image'), validate(v.upsertCategory), asyncHandler(ctrl.createCategory));
router.patch('/categories/:id', upload.single('image'), validate(v.updateCategory), asyncHandler(ctrl.updateCategory));
router.delete('/categories/:id', asyncHandler(ctrl.deleteCategory));

// Products
router.get('/products', asyncHandler(ctrl.listProducts));
router.post('/products', upload.single('image'), validate(v.upsertProduct), asyncHandler(ctrl.createProduct));
router.patch('/products/:id', upload.single('image'), validate(v.updateProduct), asyncHandler(ctrl.updateProduct));
router.delete('/products/:id', asyncHandler(ctrl.deleteProduct));

// Orders
router.get('/orders', validate(v.listOrders), asyncHandler(ctrl.listOrders));
router.patch('/orders/:id/status', validate(v.orderStatusUpdate), asyncHandler(ctrl.updateOrderStatus));

// Users
router.get('/users', asyncHandler(ctrl.listUsers));
router.patch('/users/:id/block', validate(v.blockUser), asyncHandler(ctrl.setUserBlocked));

// Stats
router.get('/stats', asyncHandler(ctrl.stats));

module.exports = router;
