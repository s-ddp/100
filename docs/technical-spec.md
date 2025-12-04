# Technical Specification — Ticket Sales Website & CRM

> This specification will be completed iteratively as we collect requirements. Sections marked **Pending user input** will be updated once details are provided.

## Scope Overview
- Public ticket sales website for water excursions, events, and rentals of boats/yachts with secure checkout and account management. **(Markets: operate in Russia; Languages: RU primary, EN + ZH secondary; Currency: RUB; Data storage: comply with Russian data residency requirements)**
- CRM for managing customers, orders, events, rentals, and support operations. **(Roles: Administrator with full access; Manager with configurable section-level permissions defined in settings)**
- CRM for managing customers, orders, events, rentals, and support operations. **(Pending user input for roles/permissions)**

## Functional Requirements
### Ticket Sales Website
- Browse/search events, view schedules, and select seats or general admission tickets based on vessel/event configuration (seat maps shown only when assigned seating is required; otherwise default to general admission flows).
- Pricing, fees, taxes, and promotions displayed transparently through checkout with configurable VAT (Russian rates, toggleable VAT on/off and multiple rates). **(Pending: default rate set and whether VAT is included/added per product type; no commissions/withholdings applied to customers on refunds; merchant absorbs payment gateway fees for refunds)**
- Checkout with payments (ЮMoney) in RUB, order confirmation, and receipts via email/SMS, including issuance of fiscal receipts via direct online cash register/ЮKassa integration (54-ФЗ compliant). Fiscal/receipt requisites are not embedded into tickets or refund documents. Required customer fields: full name (ФИО), email, and phone; no additional retention constraints specified.
- Refund eligibility enforced: customer self-service refunds permitted until 24 hours before event start; no exchanges or transfers supported; within 24 hours of event start tickets are non-refundable/non-transferable; refunds are processed without commissions/withholdings to the customer and the merchant covers payment gateway fees.
- Customer accounts: authentication, profile, order history, and download of tickets/QR codes. **(Resolved: no external SSO/MFA required at launch; standard auth applies)**
- Notifications: email for registration, booking confirmations, and e-ticket delivery; messaging follow-ups via preferred Maxx with WhatsApp/Telegram as alternatives (e.g., reminders, support updates).
- Pricing, fees, taxes, and promotions displayed transparently through checkout. **(Pending tax rules; no commissions/withholdings applied to customers on refunds; merchant absorbs payment gateway fees for refunds)**
- Checkout with payments (ЮMoney) in RUB, order confirmation, and receipts via email/SMS.
- Refund eligibility enforced: customer self-service refunds permitted until 24 hours before event start; no exchanges or transfers supported; within 24 hours of event start tickets are non-refundable/non-transferable; refunds are processed without commissions/withholdings to the customer and the merchant covers payment gateway fees.
- Customer accounts: authentication, profile, order history, and download of tickets/QR codes. **(Pending identity/SSO needs)**

### CRM
- Entity management: events, venues, inventory, customers, orders, promotions. **(Pending data model decisions)**
- Agent console: search/lookups, refunds (only when ≥24h before event start), resend confirmations. Exchanges and transfers are not supported. Refunds are issued without withholding fees from the customer; the merchant absorbs payment fees.
- Support case management with statuses, notes, attachments, and SLA tracking. **(Pending SLA definitions)**
- Role-based access control with audit trails for sensitive actions: Administrator profile has unrestricted access; Manager profile is granted section-level visibility and actions as configured in settings (e.g., catalog, orders, refunds, support cases). **(Authentication uses standard login; no SSO/MFA required at launch)**
- Supplier integrations: ingest schedules, vessels, routes/berths, pricing, ticket categories, and seating maps (when available) from Astra Marin and Neva Travel via API; support periodic syncs and conflict resolution rules.
- Reporting and dashboards: launch KPIs to surface sales, occupancy, conversion, refunds, channel performance, CRM productivity, and supplier feed health (see Reporting & Analytics section). **(Pending confirmation/prioritization)**

## Non-Functional Requirements (Pending user input)
- Availability and performance: target 99.5–99.9% availability. SLOs — catalog p95 ≤ 250 ms/p99 ≤ 450 ms; search p95 ≤ 200 ms/p99 ≤ 400 ms; checkout p95 ≤ 600 ms/p99 ≤ 1200 ms; CRM API p95 ≤ 800 ms/p99 ≤ 1500 ms. Peak design loads: 300 RPS overall; 600 RPS search+catalog; 20 RPS checkout; 150 RPS CRM.
- Disaster recovery and backup posture: RPO ≤ 5–15 minutes; RTO ≤ 15 minutes; backups retained indefinitely with manual cleanup; no secondary/DR site for the bare-metal hosting model in Russia.
- Security: authentication/authorization approach, PCI scope boundaries, and data protection policies. **(Resolved in part: no SSO/MFA requirements specified for customers or agents at launch; standard authentication needed)**
- Observability: logging standards, metrics, tracing, and alerting thresholds.
- Compliance: data retention, privacy, tax invoicing, and regional constraints. **(Resolved: operate under Russian legislation with data residency in Russia; online cash register/54-ФЗ fiscalization via ЮKassa/ЮMoney is required; receipts/fiscal requisites are not shown on tickets/refunds; taxation must be configurable with Russian VAT on/off and multiple rates; invoice/act needs and extra receipt content still pending)**
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
- **Payments:** Payment service abstraction with initial gateway: ЮMoney (accepting customer payments in RUB; no alternate payout schedules or currencies required at this stage). Integrate online cash register/54-ФЗ fiscalization via ЮKassa/ЮMoney for sales and refunds. Refunds are full to the customer (no commissions/withholdings) with payment fees absorbed by the merchant. Future gateways can be added behind the same abstraction.
- **Notifications:** Email provider for registration/booking/e-ticket messages; messaging provider (preferred Maxx, with WhatsApp/Telegram as alternatives) for reminders and support updates. Template management and event-driven dispatch required. **(Pending final provider selection)**
- **Analytics:** Web analytics and cross-channel attribution/UTM tracking with event instrumentation across site, CRM, and messaging touchpoints. **(Pending specific tool selection)**
- **Infrastructure:** Containerized services with CI/CD, automated tests, IaC (Terraform), and self-hosting in Russia on owned servers. Bare metal (no virtualization) is preferred; isolate prod/stage/dev via network segmentation. Include daily full backups plus multiple intra-day backups of operational tables retained indefinitely with manual cleanup; no secondary/DR site planned. **(Provider/segmentation recommendation pending)**

## Reporting & Analytics (Draft — Pending confirmation)
- **Sales & revenue**: gross/net sales; revenue by route/itinerary, vessel/event, ticket category, promo code; device/channel/UTM breakdown; average order value.
- **Occupancy & capacity**: load factor per sailing/event; seat-map utilization where applicable; holds/expiration trends; rental calendar utilization.
- **Conversion funnel**: visits → search → selection → checkout start → paid; abandonment stages; ЮMoney payment success vs. decline/error rates.
- **Refunds**: approved vs. rejected (<24h) requests; refunded volume/value by reason and timeframe; share of sales refunded; merchant-covered payment fees tracking.
- **Performance by source**: marketing/affiliate channels, UTMs, repeat vs. new customers; revenue and conversion by locale (RU/EN/ZH).
- **CRM productivity**: case/ticket volumes, resolution times vs. SLA, refund handling times, resend/notification actions; per-agent/team activity respecting Manager permissions.
- **Supplier feed health**: Astra Marin and Neva Travel sync freshness, failure counts, field mismatch rates, and downstream impact on availability/inventory.
- **Fiscalization/54-ФЗ**: issued/failed fiscal receipts for sales and refunds, discrepancy tracking vs. payment records, and reconciliation timelines.
- **Reporting slices/filters (launch priority)**: route/itinerary, vessel/event, ticket category/fare class, supplier, berth/port, departure date/time, channel/source/UTM, locale/language, device, promo/campaign, customer type (new vs. repeat), and CRM manager/team.
- **Payments:** Payment service abstraction with initial gateway: ЮMoney (accepting customer payments in RUB; no alternate payout schedules or currencies required at this stage). Refunds are full to the customer (no commissions/withholdings) with payment fees absorbed by the merchant. Future gateways can be added behind the same abstraction.
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
- Supplier ingestion APIs/clients for Astra Marin and Neva Travel with mapping/normalization of vessels, routes, berths, pricing, ticket categories, and seating maps.

## Testing & Quality
- Automated tests: unit, integration, and e2e for checkout flows and CRM actions.
- Load tests for peak sales and seat map operations.
- Security testing: dependency scanning, SAST, DAST, and periodic penetration tests.

## Deployment & Operations
- Environments: dev/staging/production with feature flagging for incremental rollouts.
- Observability: dashboards for errors, latency, throughput, and business KPIs (sales, conversion).
- Runbooks for incident response, rollbacks, and data recovery; backup schedule: daily full backups plus multiple intra-day backups of operational tables.
- Runbooks for incident response, rollbacks, and data recovery.

- Markets/countries in scope? **(Resolved: operate in Russia)**
- Payment gateways and settlement rules? **(Resolved: integrate ЮMoney, RUB-only, no alternate payout schedules)**
- Seating model (reserved vs general admission)? **(Resolved: combined approach—enable seat maps when a vessel/event requires assigned seating; use general admission when not)**
- Refund/exchange/transfer policies? **(Resolved: refunds allowed until 24h before event start; no exchanges or transfers; refunds carry no commissions/withholdings for the customer; merchant covers payment fees; sub-24h window is non-refundable/non-transferable)**
- Integrations (email/SMS, analytics, accounting/ERP, marketing)? **(Resolved: email for registration/booking/e-ticket delivery; messaging via preferred Maxx with WhatsApp/Telegram alternatives; web and cross-channel analytics required)**
- Roles/permissions and audit requirements? **(Resolved: Administrator full access; Manager with configurable section-level permissions set via settings; audit trails required for sensitive actions)**
- Compliance constraints (GDPR, PCI, tax invoices, data residency)? **(Resolved: operate under Russian legislation; data residency in Russia; online cash register/54-ФЗ fiscalization via ЮKassa/ЮMoney required; receipts/fiscal requisites not shown on tickets/refunds; other tax/PCI specifics pending)**
- Reporting and dashboards needed at launch? **(Resolved: deliver comprehensive dashboards with slices by route/itinerary, vessel/event, ticket category/fare class, supplier, berth/port, departure date/time, channel/source/UTM, locale/language, device, promo/campaign, customer type, and CRM manager/team)**
- What customer data is mandatory and how long is it stored? **(Resolved: collect full name, email, and phone; no retention limit specified)**

## New Open Questions (for next iteration)
- Which VAT rates should be available at launch (e.g., 0%, 10%, 20%), and what is the default VAT inclusion/exclusion behavior for products and rentals?
- Are invoices/acts or other legal documents required for B2B or rental orders, and should they be generated from CRM or automatically?
- Do we need additional requisites in emails/receipts beyond fiscalization (e.g., legal entity details, offer/contract references)?

## Immediate Next Steps
- Confirm launch VAT rates and default inclusion/exclusion behavior so pricing/checkout logic can be finalized.
- Decide whether счета/акты or other legal docs are needed for rentals/B2B orders and the generation path (CRM vs. automatic).
- Specify any additional requisites for customer communications beyond fiscalization to finalize templates.

### Kickoff focus (to start building)
- Lock VAT defaults to unblock pricing and receipt logic for both tickets and rentals.
- Confirm initial stack: React/Next.js frontend; Node.js/TypeScript (NestJS) or FastAPI backend; PostgreSQL; Redis for cache/locks; RabbitMQ (or built-in broker) for async tasks; containerized deployment with Ansible/Terraform to bare metal in Russia (prod/stage/dev) with daily + intra-day backups.
- Capture sample payloads/credentials for Astra Marin, Neva Travel, and ЮMoney/ЮKassa sandbox to model ingestion and payment flows.
- Design the initial schema/migrations for sailings/events, fares/ticket types, seats, orders/payments, customers, and refunds with reservation expiry/oversell safeguards.
- Implement a vertical slice: catalog/search → selection/seat map → ЮMoney checkout (sandbox) → e-ticket/email → CRM order view with 24h refund enforcement.

## Action Plan (execution path)
1. Finalize tax defaults and legal docs: lock VAT rates/behavior and whether invoices/acts or extra requisites are required at launch.
2. With taxation fixed, select implementation stack (frontend/backend/DB, caching, queues, observability) and deployment on bare metal in Russia that meets 99.5–99.9% availability, the defined SLOs, and RPO ≤ 5–15m / RTO ≤ 15m.
3. Produce estimates and a phased delivery plan (ticketing, CRM, integrations, reporting) sized to peak loads: 300 RPS overall, 600 RPS search/catalog, 20 RPS checkout, 150 RPS CRM.
- Integrations (email/SMS, analytics, accounting/ERP, marketing)? **(Pending)**
- Roles/permissions and audit requirements? **(Pending)**
- Compliance constraints (GDPR, PCI, tax invoices, data residency)? **(Partially resolved: data residency in Russia; tax/PCI specifics pending)**
- Reporting and dashboards needed at launch? **(Pending)**

