# Context Snapshot — Ticket Sales Website & CRM

This snapshot consolidates the agreed requirements and pending decisions captured through the Q&A to date. Use it as a quick reference for scope alignment.

## Confirmed Scope & Policies
- **Offering**: Ticket sales for water excursions/events plus rentals (boats, yachts, boats) with adaptive seating (seat maps when required; general admission otherwise).
- **Markets & Compliance**: Operate in Russia; data stored in Russia in line with local legislation. Online cash register/54-ФЗ via ЮKassa/ЮMoney; receipts/fiscal requisites are **not** embedded in tickets/refunds.
- **Localization & Currency**: Languages — Russian (primary), English, Chinese; Currency — RUB only.
- **Payments & Fiscalization**: ЮMoney for payments, RUB settlements only, no alternative payout schedules. Merchant covers payment gateway fees on refunds. Fiscalization handled via ЮKassa/ЮMoney for sales and refunds.
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

## Pending Decisions
- **Tax/Invoicing Details**: Confirm specific VAT rate set to ship with, whether invoices/acts are required, and any additional receipt/email requisites beyond fiscalization.

## Immediate Next Steps
- Confirm the launch VAT set (e.g., 0%, 10%, 20%) and default inclusion/exclusion behavior.
- Decide on issuance of invoices/acts for rentals and B2B orders and whether creation happens automatically or via CRM.
- Identify any extra requisites needed in customer communications beyond fiscalization.

## Action Plan (что делаем дальше)
1. Закрыть налоговые вопросы: зафиксировать стартовые ставки НДС и дефолт «нет/включён/выделен», понять нужны ли счета/акты и доп. реквизиты.
2. После подтверждения налогов — выбрать стек (фронтенд/бекенд/БД, кэш, очередь, observability) и схему деплоя на bare metal в РФ с учётом 99.5–99.9% SLA, SLO и RPO/RTO.
3. Подготовить оценки и поэтапный план реализации (ticketing, CRM, интеграции, отчётность) под пиковые нагрузки: 300 RPS общие, 600 RPS поиск/каталог, 20 RPS чекаут, 150 RPS CRM.

### Kickoff: что делать прямо сейчас
- Утвердить стартовые VAT-настройки (ставки + дефолт) для продаж и аренды.
- Зафиксировать базовый стек: React/Next.js + Node.js/TypeScript (NestJS/FastAPI), PostgreSQL, Redis, очередь (RabbitMQ/встроенный брокер), CI/CD и деплой контейнеров на bare metal в РФ (prod/stage/dev) с бэкапами.
- Подготовить контракты поставщиков (Astra Marin, Neva Travel) и sandbox ЮMoney/ЮKassa, смоделировать схемы рейсов/мест/цен/причалов.
- Спроектировать доменную модель и миграции (рейс/событие, тариф/билет, места, заказ, оплата, клиент, возврат) с защитой от оверселла.
- Собрать первый вертикальный срез: каталог → выбор рейса/мест → чек-аут (ЮMoney sandbox) → e-ticket/email → CRM-вью заказа + возврат ≥24h.

## Next Questions (current batch)
1. Подтвердить стартовый набор ставок НДС (например, 0%, 10%, 20%) и дефолтное поведение “НДС нет/включён/выделен” для продуктов и аренды.
2. Нужны ли счета/акты или другие юридические документы для B2B/арендных заказов, и как их выдавать (из CRM или автоматически)?
3. Требуются ли дополнительные реквизиты в письмах/квитанциях помимо фискализации (например, реквизиты юрлица, договор, оферта)?
