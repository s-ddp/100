# API Stub Overview

This document summarizes the stub API exposed by `services/api/src/router.js`. It is intended for quick smoke tests and to align frontend/CRM scaffolding while the production stack is being implemented.

## Environment defaults
- **Service name**: `ticketing-api`
- **Host/port**: `0.0.0.0:4000`
- **VAT defaults**: `VAT_DEFAULT_RATE=20%` and `VAT_DEFAULT_MODE=included`
- **CRM SLO defaults**: p95 = 800 ms, p99 = 1500 ms
- **Support SLA defaults**: first response = 15 minutes, resolution = 240 minutes

## Health and metrics
- `GET /health` → `{ service, env, status: "ok", uptimeMs }`
- `GET /readiness` → `{ service, env, status: "ready", timestamp }`
- `GET /metrics` → Prometheus text exposition with counters for requests, health, readiness, catalog, checkout, refund, documents, CRM orders, and CRM support cases.

## Catalog and suppliers
- `GET /catalog?type=&supplier=&lang=` — filters by `type`, `supplier`, and `lang` (locale match). Returns `{ items, total }` with sample catalog entries.
- `GET /catalog/:id` — returns `{ item }` or 404 when the ID is unknown.
- `GET /suppliers` — returns `{ suppliers, total }` using the bundled sample supplier list.

## Checkout and orders
- `POST /checkout` — required fields: `catalogItemId`, `fareCode`, `quantity` (positive integer), and `customer { name, email, phone }`. Optional `seating` is echoed back. Response: `{ order }` with totals (net, VAT amount/rate/mode, gross), refund policy (24h cutoff before departure when available), and generated invoice/act placeholders.
- `GET /orders/:id` — returns `{ order }` for known orders or 404.
- `GET /orders/:id/documents` — returns `{ documents: { invoice, act } }` with generated numbers and VAT-aware totals.
- `POST /orders/:id/refund` — enforces the 24h refund window; marks the order as `refunded` and returns `{ order }` when allowed, or 400 with `refundableUntil` when blocked.

## CRM and support
- `GET /crm/orders` — returns `{ slo, orders, total }` exposing CRM SLO targets alongside lightweight order summaries.
- `GET /crm/sla` — returns `{ crmSlo, supportSla }` with the current latency targets and support deadlines.
- `GET /crm/support/cases` — returns `{ cases, total, supportSla }` for created support tickets.
- `POST /crm/support/cases` — required fields: `subject`, `customer { name, email }`; optional `orderId`, `priority` (`standard` default, `high` halves SLA times, `low` extends by 50%), and `channel` (`email` default). Response: `{ case }` with SLA due timestamps.

## Utilities
- `POST /echo` — responds with `{ echo }`, attempting to JSON-parse the payload when possible.
