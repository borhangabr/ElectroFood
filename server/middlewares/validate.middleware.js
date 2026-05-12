// Zod request validator. Accepts a schema shaped like:
//   { body?: ZodSchema, query?: ZodSchema, params?: ZodSchema }
// On success it replaces req.body/query/params with the parsed value, so
// downstream code gets type-safe input. On failure it throws — the central
// error middleware translates ZodError into a 400 with field details.

module.exports = function validate(schema) {
  return (req, _res, next) => {
    try {
      if (schema.body) req.body = schema.body.parse(req.body);
      if (schema.query) req.query = schema.query.parse(req.query);
      if (schema.params) req.params = schema.params.parse(req.params);
      next();
    } catch (err) {
      next(err);
    }
  };
};
