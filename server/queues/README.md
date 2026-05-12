# queues/

Placeholder folder retained to match the BookTask reference layout.

**Current status:** unused. Order-status notifications are handled synchronously inside `services/order.service.js` for the prototype.

**Future intent:** when traffic warrants it, this is where we'd add BullMQ (or similar) workers:

- Email confirmation on order creation
- Push notification on status transitions
- Stripe webhook → idempotent retry queue
- Periodic reconciliation against Stripe for orphaned `paymentStatus=pending` orders

Until that happens, this folder stays empty by design. Do not import from it.
