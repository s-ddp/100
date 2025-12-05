# Technical Specification — Ticket Sales Website & CRM

> This specification will be completed iteratively as we collect requirements. Sections marked **Pending user input** will be updated once details are provided.

## Scope Overview
- Public ticket sales website for water excursions, events, and rentals of boats/yachts with secure checkout and account management. **(Markets: operate in Russia; Languages: RU primary, EN + ZH secondary; Currency: RUB; Data storage: comply with Russian data residency requirements)**
- CRM for managing customers, orders, events, rentals, and support operations. **(Roles: Administrator with full access; Manager with configurable section-level permissions defined in settings)**

## Functional Requirements
### Ticket Sales Website
- Browse/search events, view schedules, and select seats or general admission tickets based on vessel/event configuration (seat maps shown only when assigned seating is required; otherwise default to general admission flows).
- Pricing, fees, taxes, and promotions displayed transparently through checkout with configurable VAT (Russian rates 0%/10%/20%). Launch default: **20% VAT included**; support `none/included/excluded` per product/rental. No commissions/withholdings applied to customers on refunds; merchant absorbs payment gateway fees. Invoices/acts are required; generate automatically post-payment/confirmation with CRM-triggered regeneration/resend; requisites included in all non-fiscal documents/communications.
- Checkout with payments (ЮMoney) in RUB, order confirmation, and receipts via email/SMS, including issuance of fiscal receipts via direct online cash register/ЮKassa integration (54-ФЗ compliant). Fiscal/receipt requisites are not embedded into tickets or refund documents. Required customer fields: full name (ФИО), email, and phone; no additional retention constraints specified.
- Refund eligibility enforced: customer self-service refunds permitted until 24 hours before event start; no exchanges or transfers supported; within 24 hours of event start tickets are non-refundable/non-transferable; refunds are processed without commissions/withholdings to the customer and the merchant covers payment gateway fees. When applicable, invoices/acts must reflect refund status and requisite details.
- Customer accounts: authentication, profile, order history, and download of tickets/QR codes. **(Resolved: no external SSO/MFA required at launch; standard auth applies)**
- Notifications: email for registration, booking confirmations, and e-ticket delivery; messaging follow-ups via preferred Maxx with WhatsApp/Telegram as alternatives (e.g., reminders, support updates).

### CRM
- Entity management: events, venues, inventory, customers, orders, promotions. **(Pending data model decisions)**
- Agent console: search/lookups, refunds (only when ≥24h before event start), resend confirmations. Exchanges and transfers are not supported. Refunds are issued without withholding fees from the customer; the merchant absorbs payment fees.
- Support case management with statuses, notes, attachments, and SLA tracking. **(Pending SLA definitions)**
- Role-based access control with audit trails for sensitive actions: Administrator profile has unrestricted access; Manager profile is granted section-level visibility and actions as configured in settings (e.g., catalog, orders, refunds, support cases). **(Authentication uses standard login; no SSO/MFA required at launch)**
- Supplier integrations: ingest schedules, vessels, routes/berths, pricing, ticket categories, and seating maps (when available) from Astra Marin and Neva Travel via API; support periodic syncs and conflict resolution rules.
- Reporting and dashboards: launch KPIs to surface sales, occupancy, conversion, refunds, channel performance, CRM productivity, supplier feed health, and document issuance status (invoices/acts) with requisite completeness. **(Pending confirmation/prioritization)**

## Non-Functional Requirements
- Availability and performance: target 99.5–99.9% availability. SLOs — catalog p95 ≤ 250 ms/p99 ≤ 450 ms; search p95 ≤ 200 ms/p99 ≤ 400 ms; checkout p95 ≤ 600 ms/p99 ≤ 1200 ms; CRM API p95 ≤ 800 ms/p99 ≤ 1500 ms. Peak design loads: 300 RPS overall; 600 RPS search+catalog; 20 RPS checkout; 150 RPS CRM.
- Disaster recovery and backup posture: RPO ≤ 5–15 minutes; RTO ≤ 15 minutes; backups retained indefinitely with manual cleanup; no secondary/DR site for the bare-metal hosting model in Russia.
- Security: authentication/authorization approach, PCI scope boundaries, and data protection policies. **(Resolved in part: no SSO/MFA requirements specified for customers or agents at launch; standard authentication needed)**
- Observability: OpenTelemetry instrumentation with Prometheus/Grafana for metrics and SLO/SLA burn alerts; Loki for centralized logs; Jaeger/Tempo for distributed tracing; alerting via Alertmanager/webhooks. Matomo (self-hosted) for web and cross-channel analytics with UTM/event taxonomy aligned to product/CRM flows.
- Compliance: operate under Russian legislation with data residency in Russia; online cash register/54-ФЗ fiscalization via ЮKassa/ЮMoney is required; receipts/fiscal requisites are not shown on tickets/refunds; taxation configurable with Russian VAT 0%/10%/20% and modes `none/included/excluded`, launch default 20% included; invoices/acts required with requisites in all non-fiscal communications; automatic issuance with CRM regeneration/resend; оплата всегда полной суммой (нет броней без оплаты и частичных оплат).

## Architecture (Initial Draft)
- **Frontend:** Next.js/React + TypeScript with SSR/ISR for catalog/search speed; shared design system and component library.
- **Backend:** NestJS on Node.js/TypeScript (REST-first, modular) with OpenAPI; service layering for payments, inventory, documents, and suppliers.
- **Database:** PostgreSQL (primary store) with schema for events/sailings, fares, seats, orders, payments, refunds, documents; Redis for caching, locks, and short holds; RabbitMQ for async tasks (ingestion, notifications, reconciliation).
- **Payments:** Payment service abstraction with initial gateway: ЮMoney (accepting customer payments in RUB; no alternate payout schedules or currencies required). Integrate online cash register/54-ФЗ fiscalization via ЮKassa/ЮMoney for sales and refunds. Refunds are full to the customer (no commissions/withholdings) with payment fees absorbed by the merchant. No partial payments or unpaid holds; checkout always charges full amount.
- **Documents:** Generate and send invoices/acts for tickets/rentals automatically after payment/confirmation; include requisite details (юрлицо, ИНН/КПП, ОГРН, юр. адрес, банк/реквизиты, контакты, оферта/договор) in all customer documents/communications except fiscal receipts. Support CRM-triggered regeneration/resend; draft documents are not needed because брони без оплаты и частичные оплаты исключены.
- **Notifications:** Email provider for registration/booking/e-ticket messages; messaging provider (preferred Maxx, with WhatsApp/Telegram as alternatives) for reminders and support updates. Template management and event-driven dispatch required. **(Pending final provider selection)**
- **Analytics:** Self-hosted Matomo for web and cross-channel attribution/UTM tracking with event instrumentation across site, CRM, and messaging touchpoints.
- **Infrastructure:** Containerized services with CI/CD (build/test/scan), IaC via Terraform + Ansible for bare metal in Russia. Bare metal (no virtualization) with prod/stage/dev segmentation; daily full backups plus multiple intra-day backups of operational tables retained indefinitely; no secondary/DR site planned.

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

## Data Model (To Refine)
- Core entities: Event, Venue, Section/Seat, TicketType, InventoryHold, Order, Payment, Customer, Promotion, SupportCase, User/Role.
- Seating configuration per vessel/event to declare whether assigned seating (with seat maps) or general admission applies.
- Audit fields and soft-delete where appropriate.
- Unique constraints to prevent overselling; reservation expirations for seat holds.

## Interactive Seatmap — Water Events

### Backend
- **Routes**
  - `GET /events` — список событий (Астрамарин + локальные water-*).
  - `GET /events/:id` — детальная карточка события.
  - `GET /events/:id/seat-layout` — иерархия палуб/рядов/мест, единый `seatCode`.
  - `GET /events/:id/seats` — статусы мест (`free|sold|reserved|selected|unknown`).
  - `GET /events/:id/ticket-types` — типы билетов для события.
  - `GET /events/:id/prices` — цены по типам билетов и местам.
  - `POST /events/:id/seats/lock` — блокировка мест на TTL.
  - `POST /events/:id/seats/unlock` — снятие блокировки.

- **Seat Locking**
  - Модель Prisma: `WaterSeatLock` (таблица `water_seat_locks`).
  - Рабочий процесс:
    1. Клиент вызывает `/seats/lock` с `sessionId` и `seats[]`.
    2. API создаёт записи `WaterSeatLock` с `expiresAt = now + TTL`.
    3. При необходимости вызывает `astraClient.lockSeat`.
    4. Worker `seatLockCleaner` регулярно чистит истёкшие блокировки и отменяет удалённые локи у Астрамарин.

- **WebSocket**
  - Собственный WebSocket-сервер на `/ws/seatmap`.
  - При изменении статуса места `emitSeatStatus(eventId, seatCode, status)` пушит обновление всем подписчикам события.

### Frontend (Next.js)
- Используется Next.js App Router (`/services/web/app`).
- Основные страницы:
  - `/events` — список событий.
  - `/events/[id]` — карточка события.
  - `/events/[id]/seatmap` — интерактивная схема мест.
  - Компонент `SeatMapClient`:
    - грузит layout / статусы мест / типы билетов / цены,
    - управляет выбором мест и отправкой `lock` / `unlock`,
    - подписывается на обновления по WebSocket,
    - отображает легенду, количество выбранных мест и сумму заказа.

## CRM Orders for Water Events

- **Prisma models**
  - `CrmOrder` with customer contacts, status (`PENDING|LOCKED|PAID|CANCELLED|EXPIRED`), payment metadata, relation to `WaterEvent`, and `totalPrice` in minor units.
  - `CrmOrderSeat` for seat-level price breakdowns bound to `CrmOrder`.

- **Admin API (RBAC protected)**
  - `GET /admin/orders` with filters by status, eventId, email, phone, dateFrom/dateTo.
  - `GET /admin/orders/:orderId` — карточка заказа с местами и событием.
  - `POST /admin/orders` — создание заказа (черновик/PENDING) с местами и ценами.
  - `POST /admin/orders/:orderId/status` — смена статуса (PENDING/LOCKED/PAID/EXPIRED/CANCELLED).
  - `POST /admin/orders/:orderId/cancel` — отмена с освобождением seat locks и пушем в seatmap WebSocket.

- **Payments (ЮKassa)**
  - `POST /payments/yookassa/create` — создаёт оплату по заказу, сохраняет `paymentId`/`paymentStatus` в `CrmOrder` и возвращает `confirmationUrl`.
  - `POST /payments/yookassa/webhook` — обновляет `paymentStatus` и переводит заказ в `PAID`/`CANCELLED` по событиям YooKassa.

- **Admin UI (Next.js)**
  - `/admin/orders` — таблица заказов с фильтрами по email/телефон/статус/событие; ссылки на карточки.
  - `/admin/orders/[id]` — детализация заказа, контактные данные, оплата, список мест, кнопки «Оплачен» и «Отменить».

## API Surface (To Refine)
- Public APIs for catalog retrieval, seat maps, availability checks, checkout, and order retrieval.
- CRM APIs for agent actions (refunds when eligible; resend confirmations), support cases, and reporting. Exchanges and transfers are out of scope.
- Webhooks/events for payment updates, ticket delivery, and analytics tracking.
- Supplier ingestion APIs/clients for Astra Marin and Neva Travel with mapping/normalization of vessels, routes, berths, pricing, ticket categories, and seating maps.
- Document generation endpoints/services for invoices/acts with requisite templates; CRM actions to regenerate/resend documents; no draft issuance needed (оплата всегда полной суммой).

## Testing & Quality
- Automated tests: unit, integration, and e2e for checkout flows and CRM actions.
- Load tests for peak sales and seat map operations.
- Security testing: dependency scanning, SAST, DAST, and periodic penetration tests.

## Deployment & Operations
- Environments: dev/staging/production with feature flagging for incremental rollouts.
- Observability: dashboards for errors, latency, throughput, and business KPIs (sales, conversion).
- Runbooks for incident response, rollbacks, and data recovery; backup schedule: daily full backups plus multiple intra-day backups of operational tables.

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
- Нет открытых вопросов: SLA для CRM/поддержки привязаны к CRM API SLO (p95 ≤ 800 мс, p99 ≤ 1500 мс; 99.5–99.9% SLA).

## Immediate Next Steps
- Отслеживать прогресс по пяти активным потокам (стек/CI/CD, VAT/документы, доменная модель/миграции, вертикальный срез, SLA/observability) в [Execution Tracker](./execution-tracker.md); compose уже поднимает PostgreSQL, Redis, RabbitMQ, Prometheus, Grafana.
- Развернуть выбранный стек (Next.js/React + TypeScript; NestJS/Node.js + TypeScript; PostgreSQL; Redis; RabbitMQ; OpenTelemetry + Prometheus/Grafana/Loki/Jaeger; Matomo) и CI/CD/деплой для bare metal в РФ под согласованные SLO/RPS, используя compose-базис как точку старта.
- Закрепить мониторинг/алертинг по SLO/SLA (включая burn rate) и шаблоны документов/коммуникаций с requisites под автоматическую выдачу после полной оплаты; API уже отдаёт VAT-aware totals и `/orders/:id/documents` для счетов/актов.

### Kickoff focus (to start building)
- Build against the confirmed stack: Next.js/React + TypeScript (frontend); NestJS/Node.js + TypeScript (backend); PostgreSQL; Redis; RabbitMQ; observability with OpenTelemetry + Prometheus/Grafana/Loki/Jaeger; analytics with Matomo; environments prod/stage/dev on bare metal in Russia with backups.
- Capture sample payloads/credentials for Astra Marin, Neva Travel, and ЮMoney/ЮKassa sandbox to model ingestion and payment flows.
- Design the initial schema/migrations for sailings/events, fares/ticket types, seats, orders/payments, customers, refunds, and documents (invoices/acts) with reservation expiry/oversell safeguards and full-payment assumption (без броней/частичных оплат); первый SQL файл лежит в `services/api/db/migrations/001_init.sql`.
- Implement a vertical slice: catalog/search → selection/seat map → ЮMoney checkout (sandbox, полная оплата) → e-ticket/email + авто счета/акты → CRM order view with 24h refund enforcement. CRM/API now surface `/crm/orders`, `/crm/sla`, and `/crm/support/cases` to wire the UI and support workflows with SLA deadlines.

## Action Plan (execution path)
1. Применить выбранный стек (Next.js/React + TypeScript; NestJS/Node.js + TypeScript; PostgreSQL; Redis; RabbitMQ; OpenTelemetry + Prometheus/Grafana/Loki/Jaeger; Matomo) и схему деплоя на bare metal в РФ, соответствующую SLA 99.5–99.9%, SLO и RPO ≤ 5–15м / RTO ≤ 15м.
2. Подготовить оценки и поэтапный план (ticketing, CRM, интеграции, отчётность) под нагрузки: 300 RPS общие, 600 RPS поиск/каталог, 20 RPS чекаут, 150 RPS CRM.
3. Реализовать вертикальный срез: каталог/поиск → выбор/seat map → ЮMoney checkout (полная оплата) → e-ticket/email + авто счета/акты → CRM-view + возврат с 24h cutoff, затем расширять до полного объёма.
