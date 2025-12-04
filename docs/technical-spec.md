# Technical Specification — Ticket Sales Website & CRM

> This specification will be completed iteratively as we collect requirements. Sections marked **Pending user input** will be updated once details are provided.

## Scope Overview
- Public ticket sales website for water excursions, events, and rentals of boats/yachts with secure checkout and account management. **(Markets: operate in Russia; Languages: RU primary, EN + ZH secondary; Currency: RUB; Data storage: comply with Russian data residency requirements)**
- CRM for managing customers, orders, events, rentals, and support operations. **(Pending user input for roles/permissions)**

## Functional Requirements
### Ticket Sales Website
- Browse/search events, view schedules, and select seats or general admission tickets based on vessel/event configuration (seat maps shown only when assigned seating is required; otherwise default to general admission flows).
- Pricing, fees, taxes, and promotions displayed transparently through checkout. **(Pending tax/fee rules)**
- Checkout with payments (ЮMoney) in RUB, order confirmation, and receipts via email/SMS.
- Refund eligibility enforced: customer self-service refunds permitted until 24 hours before event start; no exchanges or transfers supported; within 24 hours of event start tickets are non-refundable/non-transferable.
- Customer accounts: authentication, profile, order history, and download of tickets/QR codes. **(Pending identity/SSO needs)**

### CRM
- Entity management: events, venues, inventory, customers, orders, promotions. **(Pending data model decisions)**
- Agent console: search/lookups, refunds (only when ≥24h before event start), resend confirmations. Exchanges and transfers are not supported.
- Support case management with statuses, notes, attachments, and SLA tracking. **(Pending SLA definitions)**
- Role-based access control with audit trails for sensitive actions. **(Pending roles/permissions)**

## Non-Functional Requirements (Pending user input)
- Availability targets, performance SLAs (page load, checkout latency), and concurrency expectations.
- Security: authentication/authorization approach, PCI scope boundaries, and data protection policies.
- Observability: logging standards, metrics, tracing, and alerting thresholds.
- Compliance: data retention, privacy, tax invoicing, and regional constraints. **(Data residency: store data in Russia per local legislation; other compliance specifics pending)**

## Architecture (Initial Draft)
- **Frontend:** Modern SPA/SSR framework (e.g., React/Next.js or Vue/Nuxt) with component library and design system. **(Pending selection)**
- **Backend:** API-first service (e.g., Node.js/TypeScript, Java/Kotlin, or Python) with REST/GraphQL endpoints. **(Pending selection)**
- **Database:** Relational DB for transactions; consider Redis for caching/reservations. **(Pending provider)**
- **Payments:** Payment service abstraction with initial gateway: ЮMoney (accepting customer payments in RUB; no alternate payout schedules or currencies required at this stage). Future gateways can be added behind the same abstraction.
- **Notifications:** Email/SMS providers with template management and event-driven dispatch. **(Pending providers)**
- **Infrastructure:** Containerized services with CI/CD, automated tests, IaC (Terraform), and cloud hosting. **(Pending cloud/region)**

## Data Model (To Refine)
- Core entities: Event, Venue, Section/Seat, TicketType, InventoryHold, Order, Payment, Customer, Promotion, SupportCase, User/Role.
- Seating configuration per vessel/event to declare whether assigned seating (with seat maps) or general admission applies.
- Audit fields and soft-delete where appropriate.
- Unique constraints to prevent overselling; reservation expirations for seat holds.

## API Surface (To Refine)
- Public APIs for catalog retrieval, seat maps, availability checks, checkout, and order retrieval.
- CRM APIs for agent actions (refunds when eligible; resend confirmations), support cases, and reporting. Exchanges and transfers are out of scope.
- Webhooks/events for payment updates, ticket delivery, and analytics tracking.

## Testing & Quality
- Automated tests: unit, integration, and e2e for checkout flows and CRM actions.
- Load tests for peak sales and seat map operations.
- Security testing: dependency scanning, SAST, DAST, and periodic penetration tests.

## Deployment & Operations
- Environments: dev/staging/production with feature flagging for incremental rollouts.
- Observability: dashboards for errors, latency, throughput, and business KPIs (sales, conversion).
- Runbooks for incident response, rollbacks, and data recovery.

- Markets/countries in scope? **(Resolved: operate in Russia)**
- Payment gateways and settlement rules? **(Resolved: integrate ЮMoney, RUB-only, no alternate payout schedules)**
- Seating model (reserved vs general admission)? **(Resolved: combined approach—enable seat maps when a vessel/event requires assigned seating; use general admission when not)**
- Refund/exchange/transfer policies? **(Partially resolved: refunds allowed until 24h before event start; no exchanges or transfers; fee/commission rules pending)**
- Integrations (email/SMS, analytics, accounting/ERP, marketing)? **(Pending)**
- Roles/permissions and audit requirements? **(Pending)**
- Compliance constraints (GDPR, PCI, tax invoices, data residency)? **(Partially resolved: data residency in Russia; tax/PCI specifics pending)**
- Reporting and dashboards needed at launch? **(Pending)**

