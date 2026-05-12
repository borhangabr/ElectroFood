// Top-level API router. Each feature router mounts here.
// New feature routers plug in during their phases.
const { Router } = require('express');
const { health } = require('../controllers/health.controller');
const authRoutes = require('./auth.routes');
const menuRoutes = require('./menu.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const adminRoutes = require('./admin.routes');

const router = Router();

router.get('/health', health);
router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/payment', paymentRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
