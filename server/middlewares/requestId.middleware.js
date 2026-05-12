// Tags every request with a UUID. Returned as X-Request-Id so users can
// quote it when reporting bugs; included in every log line via req.id.
const { randomUUID } = require('crypto');

module.exports = function requestId(req, res, next) {
  const incoming = req.header('x-request-id');
  req.id = incoming && /^[a-zA-Z0-9-]{8,64}$/.test(incoming) ? incoming : randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};
