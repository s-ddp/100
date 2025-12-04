# Execution Tracker — Ticket Sales Web + CRM

Status board for the five outstanding workstreams. Use this to coordinate the engineering kickoff and keep the plan aligned with the agreed SLOs and policies.

## 1) Stack, CI/CD, and Bare-Metal Deployment — In Progress
- **Goal**: Stand up prod/stage/dev on bare metal in Russia for Next.js/React (web) + NestJS/Node.js (API), PostgreSQL, Redis, RabbitMQ with OpenTelemetry → Prometheus/Grafana/Loki/Jaeger and Matomo.
- **Immediate actions**:
  - Use the new `docker-compose.yml` baseline (api, web, PostgreSQL, Redis, RabbitMQ, Prometheus, Grafana) as the starting point for bare-metal provisioning via Ansible/Terraform.
  - Define CI steps: lint/test → build → image publish → smoke via docker-compose on stage, then promote to prod.
  - Wire baseline alerting for availability (99.5–99.9%) and RPO/RTO (≤15m) burn rates; expose API metrics via `/metrics` (already available).
- **Owner**: Engineering (backend + infra).

## 2) VAT, Pricing, and Document Templates — In Progress
- **Goal**: Apply VAT defaults (0/10/20%, default 20% included) and requisites across checkout, price displays, and auto-issued invoices/acts.
- **Immediate actions**:
  - API now calculates VAT with defaults and exposes `/orders/:id/documents` for invoice/act payloads; wire this into frontend/CRM templates with requisite fields.
  - Align catalog/detail UIs to display VAT-included by default with rate/mode hints; add email templates for invoices/acts.
- **Owner**: Backend + Web.

## 3) Domain Model & Migrations — In Progress
- **Goal**: Model events/sailings, fares/ticket types, seats, orders/payments/refunds, customers, documents, with oversell protection.
- **Immediate actions**:
  - Base migration added at `services/api/db/migrations/001_init.sql`; hook it into NestJS/TypeORM or Prisma migration runner.
  - Capture supplier payload mappings (Astra Marin, Neva Travel) to internal entities and map VAT fields.
  - Add reservation expiry/locks with Redis to respect peak RPS and 24h refund rule.
- **Owner**: Backend.

## 4) Vertical Slice (Catalog → Seat Map → Checkout → Docs → CRM) — In Progress
- **Goal**: Deliver a sandbox flow: catalog/search → selection/seat map → ЮMoney checkout (full payment) → e-ticket/email + auto invoices/acts → CRM order view with 24h refund enforcement.
- **Immediate actions**:
  - CRM order listing now available at `/crm/orders` (with SLO context) and document payloads at `/orders/:id/documents`; wire these into the front-end CRM view.
  - Integrate ЮMoney sandbox with fiscalization hooks and refund API honoring cutoff; reuse `/metrics` for basic health dashboards.
  - Surface SLA flags and refund controls in CRM while persisting orders/documents to PostgreSQL.
- **Owner**: Full-stack.

## 5) CRM/Support SLA & Observability — In Progress
- **Goal**: Finalize p95/p99 targets for agent actions and ticket handling SLAs; instrument observability accordingly.
- **Immediate actions**:
  - Expose CRM SLO (p95 ≤ 800 ms, p99 ≤ 1500 ms) and support SLA deadlines via `/crm/sla` and `/crm/support/cases`; ensure Prometheus scrapes CRM counters in `/metrics`.
  - Add dashboards/alerts in Grafana for CRM API latency/error rates and support queue times.
  - Reflect SLAs in runbooks and customer/agent-facing expectations.
- **Owner**: Product + Engineering.

## 6) Interactive Seatmap — Implemented (MVP, ready for integration)
- **Goal**: Deliver interactive seat maps for water events with live status, locking, and pricing integration.
- **Notes**: API exposes layout, seat statuses, ticket types, prices, lock/unlock endpoints, plus WebSocket broadcast. Next.js seatmap UI consumes these and shows totals.

## 7) Provider Integration (AstraMarine) — Ready (pending credentials/testing)
- **Goal**: Run against the real AstraMarine API instead of stubs.
- **Notes**: `astraClient` supports stub/real modes; set `ASTRA_USE_STUB=false`, `ASTRA_BASE_URL`, and `ASTRA_AUTH` to enable live calls. Awaiting real credentials and end-to-end verification.
