const orderService = require('../services/order.service');

exports.create = async (req, res) => {
  const order = await orderService.createOrder({
    userId: req.user?.id || null,
    items: req.body.items,
    address: req.body.address,
    paymentMethod: req.body.paymentMethod,
    guest: req.body.guest,
  });
  res.status(201).json({ success: true, data: { order } });
};

exports.getMine = async (req, res) => {
  const result = await orderService.listMyOrders({
    userId: req.user.id,
    query: req.query,
  });
  res.json({ success: true, data: result });
};

exports.getOne = async (req, res) => {
  const order = await orderService.getOrderForUser({
    userId: req.user?.id || null,
    role: req.user?.role || null,
    orderId: req.params.id,
    guestToken: req.query.token || null,
  });
  res.json({ success: true, data: { order } });
};
