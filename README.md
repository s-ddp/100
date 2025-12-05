# Ticket Sales Website & CRM

This repository will house the roadmap and technical specification for a ticket sales website and its supporting CRM.

## Documents
- [Roadmap](docs/roadmap.md)
- [Technical Specification](docs/technical-spec.md)
- [Context Snapshot](docs/context.md)
- [Execution Tracker (5 workstreams)](docs/execution-tracker.md)
- [Stub API endpoints](docs/api-stub.md)
- [Water excursions API surface](docs/water-api.md)
- [Water excursions DB schema](docs/water-db-schema.md)

## Local development (kickoff)
- Dependencies: the starter API now uses only built-in Node.js modules, so `npm install` is optional and does **not** reach external registries. If your environment injects proxy settings that break installs, clear them with `npm config delete proxy && npm config delete https-proxy`.
- Run the API locally: `npm run start:api` (starts a minimal Node.js server with health/readiness probes, catalog/supplier stubs, a `/checkout` flow, order lookup/refund, and an `/echo` endpoint)
- Smoke tests: `npm test` exercises the health, catalog, supplier, checkout/order, refund, CRM listing, and support-case endpoints via Node's built-in test runner.
- Run the static web shell: `npm run start:web` (serves the static pages on port 3000 without external dependencies; suitable for quick previews and containerization). Key entry points:
  - `index.html` — главная с каруселями «Хиты продаж» и категориями
  - `event.html` — карточка экскурсии с расписанием, выбором мест и схемой судна
  - `rent.html` — каталог аренды судов с фильтрами
  - `boat.html` — карточка конкретного судна с ценами и модальным запросом аренды
  - `help.html` — справка/FAQ с правилами возврата, налогами и контактами поддержки

VAT defaults for totals can be set via `VAT_DEFAULT_RATE` (e.g., `20%`, `0.2`) and `VAT_DEFAULT_MODE` (`included`, `excluded`, `none`).

The initial service lives in `services/api` and will grow into the backend for catalog/search/checkout/CRM flows. Health endpoints
are available at `/health` and `/readiness` for container orchestration/readiness checks; both include the configured service name (`SERVICE_NAME` env) and environment. Catalog/supplier stubs are exposed at `/catalog` (filter by `type`, `supplier`, `lang`) and `/catalog/:id`, plus `/suppliers`. Checkout is available at `/checkout` (JSON payload with `catalogItemId`, `fareCode`, `quantity`, and `customer { name, email, phone }`) and returns calculated totals with VAT and refund eligibility (24h rule). Orders can be retrieved by id via `/orders/:id` and refunded via `/orders/:id/refund` while the 24h window is open. A simple `/echo` POST endpoint is available for quick connectivity checks and will JSON-parse payloads when possible.

## Collaboration Workflow
We will iterate on requirements by asking focused questions one at a time. Your answers will be captured in the documents above to refine scope, milestones, and the technical plan.

## Current Next Steps
- Все пять открытых направлений выведены в работу и зафиксированы в [Execution Tracker](docs/execution-tracker.md); compose-стек теперь включает PostgreSQL, Redis, RabbitMQ, Prometheus и Grafana для метрик, чтобы можно было развернуть bare-metal окружение целиком.
- Использовать зафиксированные VAT настройки (0%/10%/20%, дефолт 20% включён; режимы `none/included/excluded`) и автоматическую выдачу счетов/актов: API уже рассчитывает VAT и отдаёт `/orders/:id/documents`, осталось интегрировать это в будущий фронт и CRM.
- Применить выбранный стек под высокую нагрузку (frontend — Next.js/React + TypeScript; backend — NestJS на Node.js/TypeScript; БД — PostgreSQL; кэш/блокировки — Redis; очередь/фоновая обработка — RabbitMQ; observability — OpenTelemetry + Prometheus/Grafana для метрик, Loki для логов, Jaeger/Tempo для трассировок; веб-аналитика/сквозная — self-hosted Matomo с UTM/событиями) и подготовить CI/CD + деплой на bare metal в РФ — compose-скелет для локального развёртывания уже добавлен.
- Спроектировать схему/миграции (рейс/событие, тариф/билет, места, заказ, оплата, возврат, документы) — первый SQL-миграционный файл `services/api/db/migrations/001_init.sql` добавлен; второй миграционный файл `services/api/db/migrations/002_water_schema.sql` фиксирует водный домен с палубами/зонами/местами, ценами, блокировками мест и оплатами; далее нужно связать его с мигратором NestJS/TypeORM или Prisma.

## Action Plan (предлагаемые шаги)
1. Развернуть выбранный стек (Next.js/React + TypeScript; NestJS/Node.js + TypeScript; PostgreSQL; Redis; RabbitMQ; Prometheus/Grafana/Loki/Jaeger; Matomo) и схему развёртывания на bare metal в РФ.
2. Подготовить оценки и поэтапный план реализации (ticketing, CRM, интеграции) с учётом SLO/RPO/RTO и пиковых нагрузок.
3. Реализовать вертикальный срез: каталог/поиск → выбор (вкл. схемы мест) → ЮMoney checkout (sandbox) → e-ticket/email + авто счёта/акты → CRM-вью + возврат ≥24h.

## Как начать разработку прямо сейчас
1. **Стек зафиксирован.** Frontend — Next.js/React + TypeScript; Backend — NestJS на Node.js/TypeScript; БД — PostgreSQL; кэш/блокировки — Redis; очередь/фоновые задачи — RabbitMQ; оркестрация/деплой — контейнеры + Ansible/Terraform на bare metal в РФ с сегментацией prod/stage/dev; observability — OpenTelemetry + Prometheus/Grafana (метрики), Loki (логи), Jaeger/Tempo (трейсы); веб/сквозная аналитика — self-hosted Matomo с UTM и событийной моделью.
2. **Развернуть каркас репозитория и CI/CD.** Создать сервисы (web, api, worker), подключить линтеры/форматтеры, unit-тесты, Docker-образы и деплой скрипты на целевой сервер; настроить секреты/хранилище конфигов.
3. **Согласовать контракты с поставщиками и платежкой.** Получить/смоделировать API-ответы Astra Marin и Neva Travel, подключить sandbox ЮMoney/ЮKassa, подготовить маппинг сущностей (рейсы, суда, места, цены, причалы).
4. **Спроектировать доменную модель и миграции.** Зафиксировать сущности (событие/рейс, билет/тариф, места, заказ, оплата, клиент, возврат, документы), отношения и ограничения для предотвращения оверселла; подготовить первые миграции.
5. **Собрать вертикальный срез.** Сделать минимальный поток: каталог → выбор рейса/мест → чек-аут с полной оплатой ЮMoney (sandbox, без броней/частичных оплат) → выдача e-ticket/email + авто счета/акты, плюс базовый CRM-вью для просмотра заказа и запуска возврата с проверкой 24h cutoff.

## Контейнеризация и деплой
- Собрать образ API: `docker build -t ticketing-api:local ./services/api`
- Собрать образ веб-оболочки: `docker build -t ticketing-web:local ./services/web`
- Запустить локально: `docker run --rm -p 4000:4000 --env-file services/api/.env.example ticketing-api:local`
- Запустить статический фронт: `docker run --rm -p 3000:3000 ticketing-web:local`
- Для продакшена: загрузите реальный `.env`, пересоберите образ с тегом реестра и задеплойте на целевой bare metal сервер через ваш оркестратор (Ansible/systemd/compose).
- Быстрый старт через Compose: `docker compose up --build` поднимает API, web, PostgreSQL, Redis, RabbitMQ, Prometheus и Grafana (использует `services/api/.env.example`; обновите на реальный `.env` перед деплоем). Метрики API доступны на `/metrics` и автоматически скрапятся Prometheus.
- SQL-схемы лежат в `services/api/db/migrations/001_init.sql` и `services/api/db/migrations/002_water_schema.sql`; примените их через любой мигратор (psql, Prisma, TypeORM) перед запуском прод-окружения. Для Prisma сгенерирован эквивалентный `services/api/prisma/schema.prisma`, готовый к запуску `npx prisma migrate dev --name init`.
- CRM/SLA API точки: `/crm/orders` (листинг заказов + SLO p95/p99), `/crm/sla` (SLO/SLA цели), `/crm/support/cases` (создание и получение тикетов поддержки с дедлайнами первого ответа/резолва), плюс `/orders/:id/documents` для счетов/актов.

### Автозапуск фронтенда и бэкенда при старте машины
- Контейнеры API (`api`) и фронтенда (`web`) в compose-файле уже имеют `restart: unless-stopped`, поэтому после первого запуска они автоматически поднимутся при перезагрузке Docker.
- Чтобы запуск `docker compose up -d` выполнялся при загрузке ОС, добавлен systemd unit: `ops/systemd/ticketing-compose.service`.
- Установить и включить автозапуск (требуются `docker` и `sudo`):
  1. Выполните `./ops/systemd/install-autostart.sh` из корня репозитория.
  2. Скрипт сгенерирует unit с рабочей директорией проекта, положит его в `/etc/systemd/system`, выполнит `daemon-reload`, `enable` и сразу стартанёт сервис.
  3. После этого весь стек (PostgreSQL, Redis, RabbitMQ, API и фронтенд) будет автоматически подниматься при каждой перезагрузке, без ручных команд.

### Быстрый запуск проекта вручную
**Без Docker (только Node.js):**
1. `npm install --workspaces --include-workspace-root=false` — поставить зависимости монорепозитория и сгенерировать свежий `package-lock.json`.
2. В одном терминале: `npm run start:api` — команда сама соберёт TypeScript в `dist/` и запустит API на `http://localhost:4000`.
3. В другом терминале: `npm run start:web` — перед стартом автоматически выполнит `next build` и поднимет фронтенд на `http://localhost:3000`.

**Через Docker Compose (весь стек + автозапуск):**
1. Убедитесь, что установлены `docker` и `docker compose`.
2. Запустите `docker compose up --build -d` — поднимет PostgreSQL, Redis, RabbitMQ, API и фронтенд (compose-файл совместим с v2+).
3. Проверьте работу:
   - API: `curl http://localhost:4000/health`
   - Фронтенд: откройте `http://localhost:3000`
4. Чтобы включить автозапуск после перезагрузки ОС: выполните `./ops/systemd/install-autostart.sh`.

### Работа из VS Code Dev Containers
- Добавлен devcontainer (Node 20) с единым `postCreateCommand`, который устанавливает все зависимости монорепозитория через `npm install --workspaces --include-workspace-root=false` (создаст новый `package-lock.json`, если его ещё нет). В стандартном окне «Reopen in Container» прогресс этого шага отображается как «Running npm install…»; чтобы убедиться, что установка идёт, откройте **View Creation Log** (Cmd/Ctrl + Shift + P → «View Creation Log»).
- Если процесс кажется зависшим, отмените его (Ctrl+C) и повторите команду «Dev Containers: Rebuild Without Cache» — установка зависимостей воспроизводимая и завершится после скачивания npm-пакетов.
- Если при открытии контейнера в VS Code виден пустой экран/нет файлов, выполните:
  1. Убедитесь, что контейнер поднялся (статус в левом нижнем углу «Dev Container: ticketing-monorepo»). Нажмите «View Creation Log», чтобы проверить отсутствие ошибок монтирования.
  2. Откройте командную палитру и выберите «Dev Containers: Open Folder in Container…», после чего укажите путь `/workspaces/100` (он проброшен внутрь контейнера и совпадает с рабочей директорией, заданной в devcontainer).
  3. В терминале контейнера выполните `ls` — если код на месте, установите зависимости вручную командой `npm install --workspaces --include-workspace-root=false` и продолжайте работу. Если нужен lock-файл, эта же команда сгенерирует новый.
