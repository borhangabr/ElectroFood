// Express application assembly.
//
// Middleware ORDER matters here. The Stripe webhook is mounted with
// express.raw() BEFORE express.json() (see seam below). Do not reorder.

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");
const hpp = require("hpp");

const { env } = require("./config/env");
const logger = require("./utils/logger");
const requestId = require("./middlewares/requestId.middleware");
const errorMiddleware = require("./middlewares/error.middleware");
const asyncHandler = require("./middlewares/asyncHandler");
const { globalLimiter } = require("./middlewares/rateLimit.middleware");
const { NotFound } = require("./utils/errors");
const routes = require("./routes");
const paymentController = require("./controllers/payment.controller");

// Lightweight NoSQL-injection scrub. Strips $ and . from keys in
// req.body / req.query / req.params so payloads like { email: { $ne: null } }
// never make it to a Mongoose query. We avoid the `express-mongo-sanitize`
// package on Express 5 because it mutates req.query (which is a getter in v5).
function sanitizeKeys(obj) {
  if (!obj || typeof obj !== "object") return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete obj[key];
      continue;
    }
    const v = obj[key];
    if (v && typeof v === "object") sanitizeKeys(v);
  }
}
function mongoSanitize(req, _res, next) {
  sanitizeKeys(req.body);
  sanitizeKeys(req.params);
  // Sanitize the parsed query in-place without reassigning req.query (Express 5 getter).
  if (req.query) sanitizeKeys(req.query);
  next();
}

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

// --- Cross-cutting: ID, security headers, CORS ---
app.use(requestId);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // for Cloudinary images
  }),
);
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(compression());

if (env.NODE_ENV !== "test") {
  app.use(
    morgan(env.NODE_ENV === "development" ? "dev" : "combined", {
      stream: { write: (msg) => logger.info(msg.trim()) },
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STRIPE WEBHOOK — MUST be mounted with raw body BEFORE express.json().
// stripe.webhooks.constructEvent() requires the unmodified raw Buffer or
// signature verification fails with "No signatures found matching...".
// ─────────────────────────────────────────────────────────────────────────────
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(paymentController.webhook),
);

// --- Body parsers (after webhook seam) ---
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// --- Hardening: query pollution + NoSQL operator injection, soft global limit ---
app.use(hpp());
app.use(mongoSanitize);
app.use(globalLimiter);

// --- Mounted routers ---
app.use("/api", routes);

// --- 404 + centralized error handler ---
app.use((req, _res, next) =>
  next(new NotFound(`Route ${req.method} ${req.originalUrl} not found`)),
);
app.use(errorMiddleware);

module.exports = app;
