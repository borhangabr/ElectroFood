// Centralized error handler. Translates anything thrown anywhere in the
// request pipeline into the response shape from CLAUDE.md §B.5:
//   { success: false, message, code, [details], [requestId] }
//
// - Operational AppErrors map to their declared status + code.
// - Mongoose validation/cast errors map to 400 with field details.
// - Duplicate key (E11000) maps to 409.
// - JWT errors map to 401.
// - Anything else is treated as a 500; full stack only in dev logs.

const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');
const { env } = require('../config/env');

// eslint-disable-next-line no-unused-vars
module.exports = function errorMiddleware(err, req, res, _next) {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Something went wrong';
  let details;

  if (err instanceof AppError) {
    status = err.status;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err?.name === 'ZodError') {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid request';
    details = err.issues?.map((i) => ({ path: i.path.join('.'), message: i.message }));
  } else if (err?.name === 'ValidationError' && err?.errors) {
    // Mongoose
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid request';
    details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  } else if (err?.name === 'CastError') {
    status = 400;
    code = 'INVALID_ID';
    message = 'Invalid identifier';
  } else if (err?.code === 11000) {
    status = 409;
    code = 'DUPLICATE_KEY';
    message = 'Resource already exists';
    details = err.keyValue;
  } else if (err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError') {
    status = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid or expired token';
  }

  // Always log server-side. Stack only when it's an unknown 5xx, to keep logs readable.
  const logPayload = { reqId: req.id, status, code, path: req.originalUrl, method: req.method };
  if (status >= 500) {
    logger.error({ ...logPayload, err: { message: err.message, stack: err.stack } }, message);
  } else {
    logger.warn(logPayload, message);
  }

  const body = { success: false, message, code };
  if (details) body.details = details;
  if (status >= 500 && env.NODE_ENV !== 'production') body.stack = err.stack;
  body.requestId = req.id;

  res.status(status).json(body);
};
