-- Water excursions + interactive seatmap schema (PostgreSQL)

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

-- Services/events catalog
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

-- Pricing and ticket metadata
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

-- Live seat locks (wraps Astra bookingSeat)
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

-- Orders & payments
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

-- Supplier cache
CREATE TABLE water_astra_cache (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ
);
