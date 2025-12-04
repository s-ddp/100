# Ticket Sales Website & CRM Roadmap

> This roadmap is a living document. Items marked **Pending user input** will be refined as we gather details.

## Objectives
- Launch a customer-facing ticket sales website focused on water excursions, events, and rentals of boats/yachts.
- Deliver an integrated CRM to manage events, customers, orders, rentals, and support workflows.

## Phases

### Phase 0 — Discovery (Pending user input)
- Capture business goals, target audience, and success metrics.
- Define supported markets (countries, currencies, languages) and compliance needs (tax, invoicing, data retention). **(Markets: focus on water excursions/events; Languages: RU primary, EN + ZH secondary; Currency: RUB)**
- Inventory existing systems to integrate (payment providers, email/SMS gateways, analytics, accounting/ERP).

### Phase 1 — Foundations
- Confirm information architecture and UX flows for browsing events, adaptive seat selection, and checkout.
- Establish system architecture and hosting strategy (cloud/region, high availability, backups).
- Choose core stack for web app (frontend, backend, DB), CRM UI framework, and CI/CD pipeline.
- Define payment service approach with initial integration to ЮMoney (RUB settlements; no alternate payout schedules needed).

### Phase 2 — Core Ticketing
- Build catalog management for events, venues, seating/sections, pricing tiers, and promotions.
- Implement availability management and seat reservation/expiry logic (enable seat maps for vessels/events that require assigned seating; allow general admission when seating is not applicable).
- Deliver checkout with payments, taxes/fees, and order confirmation flows.
- Set up customer accounts, authentication, and basic profile management.

### Phase 3 — CRM Foundations
- Create CRM data model for customers, orders, events, and support cases.
- Provide agent console with search, ticket lookups, and refund/transfer workflows.
- Integrate notifications (email/SMS) for confirmations, reminders, and support updates.

### Phase 4 — Growth Features
- Add analytics dashboards (sales, conversion, abandonment, channel performance).
- Implement marketing tools (promo codes, campaigns, segmentation) and loyalty options.
- Introduce access control/roles for operations, finance, and support teams.

### Phase 5 — Hardening & Launch
- Performance testing (traffic spikes, seat maps), security review, and observability (logging, metrics, tracing).
- Data migration/imports from legacy systems if applicable.
- Go-live checklist and runbooks for support and operations.

### Phase 6 — Post-Launch
- Incident management processes and SLAs.
- Ongoing A/B tests, funnel optimization, and backlog grooming from feedback.

## Open Questions (to be resolved with stakeholders)
1. What markets/countries are in scope for launch and compliance? **(Pending)**
2. Which payment providers and payout/settlement requirements do we have? **(Resolved: integrate ЮMoney for RUB payments; no alternate payout schedules/currencies required)**
3. Do we need reserved seating maps, general admission, or both? **(Resolved: combined model—seat maps shown when the vessel/event requires assigned seating; general admission flows when seating is not applicable)**
4. What integrations are required (email/SMS, analytics, accounting/ERP, marketing)? **(Pending)**
5. What refund, exchange, and transfer policies apply? **(Pending)**
6. What operational roles should the CRM support, and what permissions are needed? **(Pending)**
7. Are there compliance constraints (GDPR, PCI scope, tax invoicing, data residency)? **(Pending)**
8. What reporting and KPI dashboards are required at launch? **(Pending)**

## Next Steps
- Collect answers to open questions (see below for the first one).
- Refine scope, milestones, and estimates based on confirmed requirements.
- Finalize delivery plan with dependencies and timelines.
