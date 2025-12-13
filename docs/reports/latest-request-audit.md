# Latest request audit

Summary of the outstanding gaps relative to the final request (seat locks/orders/payments, admin CRM, prod hardening, multi-tenant, refunds, reporting, seatmap editor).

## Implemented
- Production ops stack and CI/CD workflows: `docker-compose.prod.yml`, nginx reverse proxy, certbot service hooks, backups, Prometheus/Grafana assets, and GH Actions workflows are present.
- Production environment template `.env.prod.example` is available.

## Missing or incomplete
- Prisma schema still uses legacy ticketing models and lacks the required enums and models: `SeatLockStatus`, `OrderStatus`, `PaymentStatus` with the requested values, plus the new `SeatLock`, `Order`, `OrderItem`, `Payment`, `OrderLog`, and `Tenant` shapes from the spec.
- No migrations or generated Prisma client for the requested schema exist.
- API routes for seat locks, events seatmap/prices/availability, orders, payments (mock and YooKassa), admin orders, admin seatmap, refunds, and reports are absent.
- Seat lock TTL worker logic is not implemented in API or worker.
- Web frontend (seatmap selection, checkout/payment flow, admin orders UI) still uses the prior App Router pages without the requested seatmap SVG flow, CRM updates, or mock payment screens.
- Enterprise features (white-label/tenant resolver, refunds endpoint/UI, sales CSV/Excel reports, seatmap editor) are not present.
- Nginx certbot directories exist but contain only placeholders; initial certificate issuance and provisioning content must be supplied during deployment.

## Recommended next steps
- Update `services/api/prisma/schema.prisma` to match the requested enums/models and run migrations/generate client.
- Implement the new Express routers and hook them into the app entry point; add the TTL worker loop.
- Extend `services/seatlock-worker` to expire locks if a separate worker is required.
- Rebuild the web UI under `services/web/app` (or pages) to use the seatmap → lock → checkout → mock payment flow and CRM pages.
- Add tenant middleware and associated API/UI changes for white-label support.
- Implement refunds, admin reports export, and seatmap editor endpoints/UI.
- Verify production compose with certbot assets, rate limiting, webhook hardening, and observability per the specification.
