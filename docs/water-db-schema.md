# Water Excursions Database Schema (PostgreSQL)

This schema models interactive seat maps for water excursions (теплоходы/катера/яхты) with live seat status, bookings, and order flows. Tables are normalized for PostgreSQL and align with AstraMarine integration (events, seat categories, prices, booking, and orders).

## Entities

### Vessels and Layout
- **vessels** (existing) — base vessel registry (id, supplier, name, metadata).
- **water_decks** — per-vessel decks with optional background SVG for rendering.
- **water_deck_areas** — logical zones on a deck (VIP, Standard, порт/левый борт) with display color and category tag.
- **water_deck_seats** — physical seats/tables tied to Astra seat codes plus geometry for the seat-map UI.

### Events and Services
- **water_services** — external service definitions (from `getServices`), capturing seating flags (no seats/free seating) and service type.
- **water_events** — individual sailings/merchandise items (maps to `getEvents` response). Links a service to a vessel and stores pier info and seat availability.

### Pricing
- **water_seat_categories** — seat categories from Astra (`getSeatCategories`).
- **water_ticket_types** — ticket types (`getTicketType`).
- **water_event_prices** — cached price matrix (`getSeatPrices`) per event/category/ticket type with optional menu payload.

### Live Seat State
- **water_seat_locks** — transient locks per seat/event/session (wraps Astra `bookingSeat`/`cancelBookSeat`).

### Orders and Payments
- **water_orders** — local order record mapped to Astra `registerOrder`/`confirmPayment` response plus email/session linkage.
- **water_order_items** — seat-level order lines with ticket/price metadata.
- **water_payments** — payment provider linkage (e.g., YooKassa) for reconciliation.

### Supplier Cache
- **water_astra_cache** — keyed cache of upstream payloads (e.g., seats, prices) to reduce external calls.

## DDL (migration 002)

```sql
-- Vessel layout
CREATE TABLE water_decks (
    id SERIAL PRIMARY KEY,
    vessel_id TEXT REFERENCES vessels(id),
    deck_number INT NOT NULL,
    name TEXT,
    background_svg TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE water_deck_areas (
    id SERIAL PRIMARY KEY,
    deck_id INT REFERENCES water_decks(id),
    name TEXT NOT NULL,
    category TEXT,
    color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE water_deck_seats (
    id SERIAL PRIMARY KEY,
    area_id INT REFERENCES water_deck_areas(id),
    seat_code TEXT NOT NULL,
    alias TEXT,
    x INT,
    y INT,
    polygon TEXT,
    rotation INT,
    tickets_per_seat INT DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services/events
CREATE TABLE water_services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    no_seats BOOLEAN,
    free_seating BOOLEAN,
    service_type TEXT,
    duration_minutes INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE water_events (
    id TEXT PRIMARY KEY,
    service_id TEXT REFERENCES water_services(id),
    vessel_id TEXT REFERENCES vessels(id),
    name TEXT,
    datetime TIMESTAMPTZ,
    duration_minutes INT,
    pier_start TEXT,
    pier_end TEXT,
    no_seats BOOLEAN,
    free_seating BOOLEAN,
    available_seats INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pricing
CREATE TABLE water_seat_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE water_ticket_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE water_event_prices (
    id SERIAL PRIMARY KEY,
    event_id TEXT REFERENCES water_events(id),
    seat_category_id TEXT REFERENCES water_seat_categories(id),
    ticket_type_id TEXT REFERENCES water_ticket_types(id),
    price_type_id TEXT,
    price_type_name TEXT,
    price_value INT,
    has_menu BOOLEAN,
    menu JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Live locks
CREATE TABLE water_seat_locks (
    id SERIAL PRIMARY KEY,
    event_id TEXT REFERENCES water_events(id),
    seat_code TEXT,
    session_id TEXT,
    locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ
);
CREATE INDEX idx_water_seat_locks_event_seat ON water_seat_locks(event_id, seat_code);
CREATE INDEX idx_water_seat_locks_expiry ON water_seat_locks(expires_at);

-- Orders/payments
CREATE TABLE water_orders (
    id SERIAL PRIMARY KEY,
    external_order_id TEXT,
    event_id TEXT REFERENCES water_events(id),
    session_id TEXT,
    email TEXT,
    status TEXT,
    amount INT,
    astra_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE water_order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES water_orders(id),
    seat_code TEXT,
    ticket_type_id TEXT,
    price_type_id TEXT,
    seat_category_id TEXT,
    quantity INT,
    price INT
);

CREATE TABLE water_payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES water_orders(id),
    yookassa_payment_id TEXT,
    status TEXT,
    amount INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ
);

-- External cache
CREATE TABLE water_astra_cache (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ
);
```

## Usage Notes
- All `*_id` fields for services/events/categories/ticket types mirror AstraMarine identifiers so upstream data can be cached and reconciled.
- Seat geometry (`x`, `y`, `polygon`, `rotation`) is frontend-agnostic; store SVG coordinates or normalized canvas pixels.
- `water_seat_locks` should be expired by a scheduled job (e.g., Redis/cron) to avoid stale holds and prevent overselling.
- Payments are provider-agnostic; store provider IDs and statuses to reconcile Astra orders with YooKassa callbacks.
- `water_astra_cache` can hold recent `getSeatsOnEvent`, `getSeatPrices`, or `getTicketType` payloads to minimize supplier calls.
