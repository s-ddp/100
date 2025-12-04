# Ticket Sales Website & CRM

This repository will house the roadmap and technical specification for a ticket sales website and its supporting CRM.

## Documents
- [Roadmap](docs/roadmap.md)
- [Technical Specification](docs/technical-spec.md)
- [Context Snapshot](docs/context.md)

## Local development (kickoff)
- Dependencies: the starter API now uses only built-in Node.js modules, so `npm install` is optional and does **not** reach external registries. If your environment injects proxy settings that break installs, clear them with `npm config delete proxy && npm config delete https-proxy`.
- Run the API locally: `npm run start:api` (starts a minimal Node.js server with health/readiness probes and an `/echo` endpoint)

The initial service lives in `services/api` and will grow into the backend for catalog/search/checkout/CRM flows. Health endpoints
are available at `/health` and `/readiness` for container orchestration/readiness checks; both include the configured service name (`SERVICE_NAME` env) and environment. A simple `/echo` POST endpoint is available for quick connectivity checks.

## Collaboration Workflow
We will iterate on requirements by asking focused questions one at a time. Your answers will be captured in the documents above to refine scope, milestones, and the technical plan.

## Current Next Steps
- Answer the open VAT/invoicing/requisites questions in the context snapshot to finalize tax behavior at launch.
- Lock the legal document needs (счета/акты) for rentals/B2B so they can be wired into CRM and customer communications.
- Once those are resolved, proceed to stack selection, estimations, and delivery planning for the ticketing site and CRM.

## Action Plan (предлагаемые шаги)
1. Финализировать стартовые ставки и поведение НДС + подтвердить необходимость счетов/актов и дополнительных реквизитов (см. контекстный снепшот).
2. На основе подтверждённого налогообложения — зафиксировать архитектурный выбор (стек фронтенд/бекенд/БД, очереди, кэш, observability) и схему развёртывания на bare metal в РФ.
3. Подготовить оценки и поэтапный план реализации (ticketing, CRM, интеграции) с учётом SLO/RPO/RTO и пиковых нагрузок.

## Как начать разработку прямо сейчас
1. **Закрыть налоговые настройки по умолчанию.** Утвердить стартовые ставки НДС и дефолт «нет/включён/выделен» для продаж и аренды, чтобы зафиксировать ценовые и чек-аут правила.
2. **Зафиксировать стартовый стек.** Предлагаемый базовый вариант: frontend — React/Next.js; backend — Node.js/TypeScript (NestJS) или FastAPI; БД — PostgreSQL; кэш/блокировки — Redis; очереди/фоновые задачи — RabbitMQ или встроенный брокер; оркестрация/деплой — контейнеры + Ansible/Terraform на bare metal в РФ с сегментацией prod/stage/dev.
3. **Развернуть каркас репозитория и CI/CD.** Создать сервисы (web, api, worker), подключить линтеры/форматтеры, unit-тесты, Docker-образы и деплой скрипты на целевой сервер; настроить секреты/хранилище конфигов.
4. **Согласовать контракты с поставщиками и платежкой.** Получить/смоделировать API-ответы Astra Marin и Neva Travel, подключить sandbox ЮMoney/ЮKassa, подготовить маппинг сущностей (рейсы, суда, места, цены, причалы).
5. **Спроектировать доменную модель и миграции.** Зафиксировать сущности (событие/рейс, билет/тариф, места, заказ, оплата, клиент, возврат), отношения и ограничения для предотвращения оверселла; подготовить первые миграции.
6. **Собрать вертикальный срез.** Сделать минимальный поток: каталог → выбор рейса/мест → чек-аут с оплатой ЮMoney (sandbox) → выдача e-ticket/email, плюс базовый CRM-вью для просмотра заказа и запуска возврата с проверкой 24h cutoff.

## Контейнеризация и деплой
- Собрать образ API: `docker build -t ticketing-api:local ./services/api`
- Запустить локально: `docker run --rm -p 4000:4000 --env-file services/api/.env.example ticketing-api:local`
- Для продакшена: загрузите реальный `.env`, пересоберите образ с тегом реестра и задеплойте на целевой bare metal сервер через ваш оркестратор (Ansible/systemd/compose).
- Быстрый старт через Compose: `docker compose up --build api` (использует `services/api/.env.example`; обновите на реальный `.env` перед деплоем).
