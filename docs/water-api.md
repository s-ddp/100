# Water excursions API surface

This stubbed interface mirrors the minimal endpoints needed to power seat-map based ticketing for water events and excursions. All data is in-memory and designed for UI scaffolding and provider-integration exploration.

## Available routes

### Service health
- `GET /status` – lightweight status for browser pings.
- `GET /health` – health with uptime.
- `GET /readiness` – readiness probe.

### Events and trips
- `GET /events` – list excursions with next departure metadata.
- `GET /events/:id` – event detail, vessel info, seat map stub, and trips.
- `GET /events/:id/trips` – departures for the event.
- `GET /trips/:id/seatmap` – seat map with live reservation/sold flags.

### Seat selection and pricing
- `GET /events/:id/categories` – seat-map areas with seat counts and starting prices.
- `GET /events/:id/seats` – flattened seat inventory with statuses (supports `?tripId=`).
- `GET /events/:id/ticket-types` – passenger/ticket type catalog.
- `GET /events/:id/prices` – seat category pricing per ticket type.

### Reservation and order flow
- `POST /events/:id/book` – hold a seat for a `sessionID` and optional `tripId`.
- `POST /events/:id/unbook` – release a hold for the same `sessionID`.
- `POST /orders` – create a seat order (`eventId`, `tripId`, `seats`, `ticketTypeId`, `customer`). Seats become `sold`.
- `POST /orders/:id` – confirm payment metadata and mark the order `confirmed`.
- `GET /orders/:id` – order detail, including seats and totals.

### Legacy stubs (unchanged)
Previous `/catalog`, `/checkout`, `/orders/:id/documents`, and CRM/support endpoints remain available for smoke testing and Prometheus counters.

## Sample domain data
The stub includes three sample products:
- **Экскурсия по Москве-реке** (теплоход, seat map on two decks)
- **Рассвет на Неве** (скоростной катер, seat map по зонам)
- **Аренда яхты** (без фиксированных мест)

Seat maps are SVG/PNG-friendly: each area contains seats with `x`/`y` coordinates and status (`available`, `reserved`, `sold`). Prices are attached per event, seat category, and ticket type.

## Frontend assumptions
- `NEXT_PUBLIC_API_URL` should point at the API container (default `http://api:4000`).
- `/events` responses include `events` plus metadata so the Next.js pages can render lists and details without direct supplier calls.
