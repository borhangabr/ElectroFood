// Wraps async route handlers so thrown errors flow to the error middleware
// instead of becoming UnhandledPromiseRejection.
//
//   router.get('/x', asyncHandler(async (req, res) => { ... }));
//
// Per CLAUDE.md §B.5, every async handler MUST go through this.
module.exports = function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
};
