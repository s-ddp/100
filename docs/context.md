# Context Snapshot — Ticket Sales Website & CRM

This snapshot consolidates the agreed requirements and pending decisions captured through the Q&A to date. Use it as a quick reference for scope alignment.

## Confirmed Scope & Policies
- **Offering**: Ticket sales for water excursions/events plus rentals (boats, yachts, boats) with adaptive seating (seat maps when required; general admission otherwise).
- **Markets & Compliance**: Operate in Russia; data stored in Russia in line with local legislation. Online cash register/54-ФЗ via ЮKassa/ЮMoney; receipts/fiscal requisites are **not** embedded in tickets/refunds.
- **Localization & Currency**: Languages — Russian (primary), English, Chinese; Currency — RUB only.
- **Payments & Fiscalization**: ЮMoney for payments, RUB settlements only, no alternative payout schedules. Оплата всегда полной суммой (нет броней без оплаты и частичных оплат). Merchant covers payment gateway fees on refunds. Fiscalization handled via ЮKassa/ЮMoney for sales and refunds.
- **Refund Policy**: Refunds allowed until 24h before event start; no exchanges or transfers; sub-24h window is non-refundable/non-transferable; no commissions/withholdings to customers.
- **Customer Data**: Collect full name, email, and phone; no retention limit specified.
- **Communications & Analytics**: Email for registration/booking/e-ticket delivery; messaging via preferred Maxx (WhatsApp/Telegram as alternatives). Web and cross-channel analytics with UTM tracking.
- **Integrations**: Supplier APIs — Astra Marin and Neva Travel (routes, schedules, vessels, berths, pricing, ticket categories, seat maps when applicable). Payment — ЮMoney/ЮKassa. Messaging — Maxx preferred.
- **CRM Roles**: Administrator (full access). Manager with configurable section-level permissions per module/section.
- **Reporting (drafted)**: Sales/revenue, occupancy, funnel, refunds, source/channel, CRM productivity, supplier feed health, fiscalization; slices by route/itinerary, vessel/event, ticket category/fare class, supplier, berth/port, datetime, channel/UTM, locale, device, promo, customer type, CRM manager/team.
- **Hosting & Operations**: Self-hosted in Russia on bare metal (no virtualization). Proposed prod/stage/dev segmentation. Daily full backups plus multiple intra-day backups for operational tables; backups retained indefinitely with manual cleanup. No secondary/DR site planned.
- **Availability & Performance**: Target 99.5–99.9% availability. Performance/SLOs: catalog p95 ≤ 250 ms, p99 ≤ 450 ms; search p95 ≤ 200 ms, p99 ≤ 400 ms; checkout p95 ≤ 600 ms, p99 ≤ 1200 ms; CRM API p95 ≤ 800 ms, p99 ≤ 1500 ms. Peak traffic: 300 RPS overall, 600 RPS for search+catalog, 20 RPS checkout, 150 RPS CRM.
- **Resilience**: RPO ≤ 5–15 minutes; RTO ≤ 15 minutes. No secondary/DR site; backups retained indefinitely with manual cleanup.
- **Taxation**: Configurable tax system with Russian VAT on/off and multiple VAT rates.

## Resolved Tax/Invoicing Decisions
- **VAT defaults**: Support Russian rates 0%, 10%, and 20% with a launch default of **20% VAT included**; allow `none/included/excluded` per product/rental.
- **Invoices/acts**: Required for tickets and rentals; generate automatically after successful payment/confirmation and allow CRM-triggered regeneration/resend.
- **Requisites**: Include юрлицо, ИНН/КПП, ОГРН, юр. адрес, банковские реквизиты (р/с, банк, БИК, к/с), контактные данные, и ссылка на оферту/договор во всех нефискальных документах/письмах.

## Immediate Next Steps
- Track execution across the five active workstreams via [Execution Tracker](./execution-tracker.md); compose now provisions PostgreSQL, Redis, RabbitMQ, Prometheus, and Grafana for local parity with bare metal.
- Use the confirmed VAT defaults and document rules to finalize pricing, checkout, and document templates — API already returns VAT-aware totals and `/orders/:id/documents` with invoice/act payloads.
- Apply the chosen stack (Next.js/React + TypeScript; NestJS on Node.js/TypeScript; PostgreSQL; Redis; RabbitMQ; observability via OpenTelemetry + Prometheus/Grafana for metrics, Loki for logs, Jaeger/Tempo for traces; self-hosted Matomo for web/cross-channel analytics) and stand up CI/CD plus bare-metal deployment in Russia (compose baseline is ready for bootstrap).
- Model the domain/schema (events/sailings, fares, seats, orders, payments, refunds, documents) — first SQL migration added at `services/api/db/migrations/001_init.sql` for the core entities.

## Action Plan (что делаем дальше)
1. Применить выбранный стек (Next.js/React + TypeScript; NestJS/Node.js + TypeScript; PostgreSQL; Redis; RabbitMQ; OpenTelemetry + Prometheus/Grafana/Loki/Jaeger; Matomo) и схему деплоя на bare metal в РФ с учётом 99.5–99.9% SLA, согласованных SLO и RPO/RTO.
2. Подготовить оценки и поэтапный план реализации (ticketing, CRM, интеграции, отчётность) под пиковые нагрузки: 300 RPS общие, 600 RPS поиск/каталог, 20 RPS чекаут, 150 RPS CRM.
3. Собрать вертикальный срез и расширять функциональность: каталог/поиск → выбор мест → ЮMoney checkout → e-ticket/email + счета/акты → CRM-вью + возврат ≥24h.

### Kickoff: что делать прямо сейчас
- Использовать зафиксированный стек: Next.js/React + TypeScript (frontend), NestJS на Node.js/TypeScript (backend), PostgreSQL (БД), Redis (кэш/блокировки), RabbitMQ (очередь), observability: OpenTelemetry + Prometheus/Grafana (метрики), Loki (логи), Jaeger/Tempo (трейсы), веб/сквозная аналитика: self-hosted Matomo. Развернуть prod/stage/dev на bare metal в РФ с бэкапами.
- Подготовить контракты поставщиков (Astra Marin, Neva Travel) и sandbox ЮMoney/ЮKassa, смоделировать схемы рейсов/мест/цен/причалов.
- Спроектировать доменную модель и миграции (рейс/событие, тариф/билет, места, заказ, оплата, клиент, возврат, документы) с защитой от оверселла.
- Собрать первый вертикальный срез: каталог → выбор рейса/мест → чек-аут (ЮMoney sandbox, полная оплата без броней/частичных оплат) → e-ticket/email + счета/акты → CRM-вью заказа + возврат ≥24h.

## Next Questions
- Нет открытых вопросов: CRM/поддержка используют те же SLO, что и CRM API (p95 ≤ 800 мс, p99 ≤ 1500 мс) и 99.5–99.9% доступности.
