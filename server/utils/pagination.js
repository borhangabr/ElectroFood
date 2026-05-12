// Pagination helpers used by every list endpoint.
//
//   parsePageQuery(req.query)        -> { page, limit, skip }
//   buildPageMeta(total, page, limit) -> { total, page, pages, limit }
//
// Defaults: page=1, limit=12, hard cap 100 (prevents accidental "give me everything").

function parsePageQuery({ page, limit } = {}) {
  const p = Math.max(1, Number.parseInt(page, 10) || 1);
  const lRaw = Number.parseInt(limit, 10) || 12;
  const l = Math.min(100, Math.max(1, lRaw));
  return { page: p, limit: l, skip: (p - 1) * l };
}

function buildPageMeta(total, page, limit) {
  return { total, page, pages: Math.max(1, Math.ceil(total / limit)), limit };
}

module.exports = { parsePageQuery, buildPageMeta };
