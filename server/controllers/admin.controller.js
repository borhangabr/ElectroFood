// Admin HTTP boundary. Multer-uploaded files arrive on req.file; we pipe to
// Cloudinary then pass {url, publicId} to the service.

const adminService = require('../services/admin.service');
const cloudinaryService = require('../services/cloudinary.service');

async function imageFromReq(req) {
  if (!req.file) return null;
  return cloudinaryService.uploadBuffer(req.file.buffer);
}

// ---- Categories ----
exports.listCategories = async (_req, res) => {
  const items = await adminService.listCategories();
  res.json({ success: true, data: { items } });
};
exports.createCategory = async (req, res) => {
  const image = await imageFromReq(req);
  const cat = await adminService.createCategory({ payload: req.body, image });
  res.status(201).json({ success: true, data: { category: cat } });
};
exports.updateCategory = async (req, res) => {
  const image = await imageFromReq(req);
  const cat = await adminService.updateCategory({ id: req.params.id, payload: req.body, image });
  res.json({ success: true, data: { category: cat } });
};
exports.deleteCategory = async (req, res) => {
  await adminService.deleteCategory(req.params.id);
  res.json({ success: true, data: { ok: true } });
};

// ---- Products ----
exports.listProducts = async (req, res) => {
  const result = await adminService.listProducts(req.query);
  res.json({ success: true, data: result });
};
exports.createProduct = async (req, res) => {
  const image = await imageFromReq(req);
  const product = await adminService.createProduct({ payload: req.body, image });
  res.status(201).json({ success: true, data: { product } });
};
exports.updateProduct = async (req, res) => {
  const image = await imageFromReq(req);
  const product = await adminService.updateProduct({ id: req.params.id, payload: req.body, image });
  res.json({ success: true, data: { product } });
};
exports.deleteProduct = async (req, res) => {
  await adminService.deleteProduct(req.params.id);
  res.json({ success: true, data: { ok: true } });
};

// ---- Orders ----
exports.listOrders = async (req, res) => {
  const result = await adminService.listOrders(req.query);
  res.json({ success: true, data: result });
};
exports.updateOrderStatus = async (req, res) => {
  const order = await adminService.updateOrderStatus({
    orderId: req.params.id,
    status: req.body.status,
    by: req.user.id,
  });
  res.json({ success: true, data: { order } });
};

// ---- Users ----
exports.listUsers = async (req, res) => {
  const result = await adminService.listUsers(req.query);
  res.json({ success: true, data: result });
};
exports.setUserBlocked = async (req, res) => {
  const user = await adminService.setUserBlocked({
    userId: req.params.id,
    isBlocked: req.body.isBlocked,
  });
  res.json({ success: true, data: { user } });
};

// ---- Stats ----
exports.stats = async (_req, res) => {
  const stats = await adminService.getStats();
  res.json({ success: true, data: stats });
};
