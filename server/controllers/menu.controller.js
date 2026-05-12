const menuService = require('../services/menu.service');

exports.listCategories = async (_req, res) => {
  const items = await menuService.listCategories();
  res.json({ success: true, data: { items } });
};

exports.listProducts = async (req, res) => {
  const result = await menuService.listProducts(req.query);
  res.json({ success: true, data: result });
};

exports.getProduct = async (req, res) => {
  const product = await menuService.getProductById(req.params.id);
  res.json({ success: true, data: { product } });
};
