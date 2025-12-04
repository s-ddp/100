# Ticket Sales Website & CRM Roadmap

> This roadmap is a living document. Items marked **Pending user input** will be refined as we gather details.

## Objectives
- Launch a customer-facing ticket sales website focused on water excursions, events, and rentals of boats/yachts.
- Deliver an integrated CRM to manage events, customers, orders, rentals, and support workflows.
- Operate within Russia with data residency/storage aligned to Russian legislation.

## Phases

### Phase 0 — Discovery (Pending user input)
- Capture business goals, target audience, and success metrics.
- Define supported markets (countries, currencies, languages) and compliance needs (tax, invoicing, data retention). **(Markets: operate in Russia; Languages: RU primary, EN + ZH secondary; Currency: RUB; Data storage: comply with Russian data residency laws)**
- Inventory existing systems to integrate (payment providers, email/SMS gateways, analytics, accounting/ERP).

### Phase 1 — Foundations
- Confirm information architecture and UX flows for browsing events, adaptive seat selection, and checkout.
- Establish system architecture and hosting strategy (self-hosted in Russia on bare metal without virtualization; propose provider options and prod/stage/dev segmentation), including high availability and backup strategy to meet the availability target (daily full backups plus multiple intra-day backups of operational tables; backups retained indefinitely with manual cleanup; no secondary/DR site planned). Availability target: 99.5–99.9%.
- Choose core stack for web app (frontend, backend, DB), CRM UI framework, and CI/CD pipeline.
- Define payment service approach with initial integration to ЮMoney (RUB settlements; no alternate payout schedules needed) and required online-fiscalization via ЮKassa/ЮMoney (54-ФЗ compliant; receipts not embedded in tickets/refunds).
- Capture refund/after-sales rules for tickets and rentals (refunds allowed until 24h before event start; no exchanges or transfers; sub-24h window is non-refundable/non-transferable; no commissions/withholdings from the customer, merchant covers payment fees on refunds).
- Establish customer communications for registration, booking, and e-ticket delivery via email, plus set up web and cross-channel analytics foundations.

### Phase 2 — Core Ticketing
- Build catalog management for events, venues, seating/sections, pricing tiers, and promotions.
- Implement availability management and seat reservation/expiry logic (enable seat maps for vessels/events that require assigned seating; allow general admission when seating is not applicable).
- Deliver checkout with payments, taxes/fees, and order confirmation flows.
- Set up customer accounts, authentication, and basic profile management.
- Integrate supplier APIs (Astra Marin and Neva Travel) to ingest routes, schedules, vessels, pricing, ticket categories, seating maps (when applicable), and berth/port details.
- Implement online-cash-register/fiscalization flows with ЮKassa/ЮMoney for sales and refunds, and baseline reporting for fiscal events.

### Phase 3 — CRM Foundations
- Create CRM data model for customers, orders, events, and support cases.
- Provide agent console with search, ticket lookups, and refund workflows that enforce the 24h cutoff; exchanges/transfers are out of scope.
- Integrate notifications (email for registration, booking, and ticket delivery; messaging via preferred Maxx with WhatsApp/Telegram as alternatives) for confirmations, reminders, and support updates.
- Define launch reporting/KPIs and wire dashboards to the analytics stack (see Reporting draft below). 

### Phase 4 — Growth Features
- Add analytics dashboards (sales, conversion, abandonment, channel performance) leveraging the web and cross-channel analytics stack.
- Implement marketing tools (promo codes, campaigns, segmentation) and loyalty options.
- Introduce flexible access control for CRM teams, starting with Administrator (full access) and configurable Manager profiles with section-level permissions.

### Phase 5 — Hardening & Launch
- Performance testing (large peak traffic, seat maps) against SLOs: catalog p95 ≤ 250 ms/p99 ≤ 450 ms; search p95 ≤ 200 ms/p99 ≤ 400 ms; checkout p95 ≤ 600 ms/p99 ≤ 1200 ms; CRM API p95 ≤ 800 ms/p99 ≤ 1500 ms. Peak design loads: 300 RPS overall; 600 RPS search+catalog; 20 RPS checkout; 150 RPS CRM. Security review and observability (logging, metrics, tracing).
- Data migration/imports from legacy systems if applicable.
- Go-live checklist and runbooks for support and operations.

### Phase 6 — Post-Launch
- Incident management processes and SLAs (to uphold the 99.5–99.9% availability target; recommend formalizing achievable SLOs/SLIs).
- Ongoing A/B tests, funnel optimization, and backlog grooming from feedback.

## Open Questions (to be resolved with stakeholders)
1. What markets/countries are in scope for launch and compliance? **(Resolved: operate in Russia; data stored per Russian legislation)**
2. Which payment providers and payout/settlement requirements do we have? **(Resolved: integrate ЮMoney for RUB payments; no alternate payout schedules/currencies required)**
3. Do we need reserved seating maps, general admission, or both? **(Resolved: combined model—seat maps shown when the vessel/event requires assigned seating; general admission flows when seating is not applicable)**
4. What integrations are required (email/SMS, analytics, accounting/ERP, marketing)? **(Resolved: email for registration/booking/e-ticket delivery; messaging via preferred Maxx with WhatsApp/Telegram as alternatives; web and cross-channel analytics required)**
5. What refund, exchange, and transfer policies apply? **(Resolved: refunds allowed until 24h before event start; no exchanges or transfers; no commissions/withholdings from the customer, merchant covers payment fees on refunds; sub-24h window is non-refundable/non-transferable)**
6. What operational roles should the CRM support, and what permissions are needed? **(Resolved: Administrator with full access; Manager with configurable section-level permissions set in settings)**
7. Are there compliance constraints (GDPR, PCI scope, tax invoicing, data residency)? **(Resolved: operate under Russian legislation with data residency in Russia; online cash register/54-ФЗ fiscalization via direct ЮKassa/ЮMoney integration required; receipts/fiscal requisites not shown on tickets/refunds; tax/PCI specifics still to be detailed)**
8. What reporting and KPI dashboards are required at launch? **(Resolved: include comprehensive dashboards; prioritize slices by route/itinerary, vessel/event, ticket category, supplier, berth/port, date/time, channel/UTM, locale/language, device, promo, customer segment, and CRM manager/team)**
9. What availability and performance SLAs are required? **(Resolved: target 99.5–99.9% availability; SLOs — catalog p95 ≤ 250 ms/p99 ≤ 450 ms; search p95 ≤ 200 ms/p99 ≤ 400 ms; checkout p95 ≤ 600 ms/p99 ≤ 1200 ms; CRM API p95 ≤ 800 ms/p99 ≤ 1500 ms; peak loads: 300 RPS overall, 600 RPS search+catalog, 20 RPS checkout, 150 RPS CRM)**
10. Is customer/agent SSO or MFA required? **(Resolved: no SSO/MFA requirements specified at launch)**
11. What hosting regions/providers and environment segmentation are required? **(Resolved: host on own server in Russia; provider/segmentation approach to be recommended—default prod/stage/dev segmentation proposed)**
12. What customer data is mandatory and how long is it stored? **(Resolved: collect full name, email, and phone; no retention limit specified)**
13. What numeric performance targets (p95/p99 for catalog/search/checkout/CRM) and peak load/concurrency assumptions should we design for to validate the availability goal? **Resolved: catalog p95 ≤ 250 ms/p99 ≤ 450 ms; search p95 ≤ 200 ms/p99 ≤ 400 ms; checkout p95 ≤ 600 ms/p99 ≤ 1200 ms; CRM API p95 ≤ 800 ms/p99 ≤ 1500 ms; peak loads: 300 RPS overall, 600 RPS search+catalog, 20 RPS checkout, 150 RPS CRM**
14. What disaster recovery posture is required (RPO/RTO, backup retention, secondary site/DR) to support the availability target on bare metal in Russia? **Resolved: RPO ≤ 5–15 minutes; RTO ≤ 15 minutes; backups retained indefinitely with manual cleanup; no secondary/DR site planned**
15. What tax/VAT rules, invoicing, and receipt content (beyond fiscalization) must be supported for sales and refunds? **Partially resolved: configurable tax system with Russian VAT on/off and multiple rates; need to confirm default rates and whether invoices/acts or extra requisites are required**

## Reporting Draft (to confirm with stakeholders)
- **Sales & revenue**: gross/net sales by day/week/month; by route/itinerary; by vessel/event; by ticket category and promo; by device/channel/UTM.
- **Occupancy & capacity**: load factor per sailing/event; seat-map utilization where applicable; overbooking/hold expirations; rentals calendar utilization.
- **Conversion funnel**: visits → search → selection → checkout start → paid; abandonment points; payment success/decline rates (ЮMoney); average order value.
- **Refunds**: refund volume/value by reason and timeframe; share of sales refunded; within-policy vs. rejected (<24h) attempts; merchant-covered fees tracking.
- **Performance by source**: marketing channels/UTMs and affiliate/referral performance; repeat vs. new customers; revenue by language locale.
- **CRM productivity**: tickets/cases handled; resolution times vs. SLA; refund handling times; resend/communication actions; per-user/team activity for Manager profiles.
- **Supplier feed health**: ingestion freshness for Astra Marin and Neva Travel; errors/field mismatches; schedule changes impacting inventory.
- **Fiscalization/54-ФЗ**: receipt issuance success/failure for sales and refunds; discrepancies vs. payment records; reconciliation timeliness.
- **Reporting slices/filters (launch priority)**: route/itinerary, vessel/event, ticket category/fare class, supplier, berth/port, departure date/time, channel/source/UTM, locale (RU/EN/ZH), device, promo/campaign, customer type (new vs. repeat), and CRM manager/team.

## Next Steps
- Collect answers to remaining questions (see below for the next set).
- Refine scope, milestones, and estimates based on confirmed requirements.
- Finalize delivery plan with dependencies and timelines.

### Immediate Next Actions
- Confirm launch VAT rates and default inclusion/exclusion behavior for products and rentals.
- Decide whether счета/акты or other legal documents are required for rentals/B2B orders and how they are generated (CRM vs. auto).
- Specify any additional requisites needed in customer-facing emails/receipts beyond fiscalization.

### Kickoff Checklist (start of development)
- Lock VAT defaults to unblock pricing/checkout logic for both sales and rentals.
- Choose the initial stack (React/Next.js; Node.js/TypeScript with NestJS/FastAPI; PostgreSQL; Redis; RabbitMQ/alternative queue) and provision prod/stage/dev on bare metal in Russia with backups.
- Acquire/sample supplier API payloads (Astra Marin, Neva Travel) and ЮMoney/ЮKassa sandbox credentials; map routes/vessels/ports/pricing/seat maps.
- Design the initial domain model and migrations for events/sailings, fares/ticket types, seats, orders, payments, customers, and refunds with oversell protections.
- Build a thin vertical slice: catalog → selection (incl. seat maps where needed) → ЮMoney checkout (sandbox) → e-ticket/email → CRM order view + 24h refund control.

### Action Plan (execution path)
1. Close tax/legal items: lock initial VAT rates and defaults, and confirm whether invoices/acts or extra requisites are required.
2. With taxation fixed, select the implementation stack (frontend/backend/DB, caching, queues, observability) and deployment layout on bare metal in Russia that can meet the 99.5–99.9% availability target, defined SLOs, and RPO/RTO.
3. Produce effort estimates and a phased delivery schedule (ticketing, CRM, integrations, reporting) sized to peak loads: 300 RPS overall, 600 RPS search/catalog, 20 RPS checkout, 150 RPS CRM.

### Next Questions (batch of three)
1. Подтвердить стартовый набор ставок НДС (например, 0%, 10%, 20%) и дефолтное поведение “НДС нет/включён/выделен” для продуктов и аренды.
2. Нужны ли счета/акты или другие юридические документы для B2B/арендных заказов, и как их выдавать (из CRM или автоматически)?
3. Требуются ли дополнительные реквизиты в письмах/квитанциях помимо фискализации (например, реквизиты юрлица, договор, оферта)?
