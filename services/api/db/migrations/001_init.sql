-- Schema for high-load ticketing + CRM
CREATE TABLE suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_base_url TEXT,
  contact_email TEXT,
  metadata JSONB
);

CREATE TABLE vessels (
  id TEXT PRIMARY KEY,
  supplier_id TEXT REFERENCES suppliers(id),
  name TEXT NOT NULL,
  capacity INTEGER,
  seating_plan JSONB,
  metadata JSONB
);

CREATE TABLE catalog_items (
  id TEXT PRIMARY KEY,
  supplier_id TEXT REFERENCES suppliers(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  departure_port TEXT,
  departure_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  language TEXT[],
  currency TEXT NOT NULL DEFAULT 'RUB',
  vat_mode TEXT NOT NULL DEFAULT 'included',
  vat_rate NUMERIC(5,4) NOT NULL DEFAULT 0.2000,
  seating_required BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

CREATE TABLE fares (
  id SERIAL PRIMARY KEY,
  catalog_item_id TEXT REFERENCES catalog_items(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RUB',
  vat_mode TEXT NOT NULL DEFAULT 'included',
  vat_rate NUMERIC(5,4) NOT NULL DEFAULT 0.2000,
  UNIQUE(catalog_item_id, code)
);

CREATE TABLE sailings (
  id TEXT PRIMARY KEY,
  catalog_item_id TEXT REFERENCES catalog_items(id) ON DELETE CASCADE,
  vessel_id TEXT REFERENCES vessels(id),
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ,
  capacity INTEGER,
  seating_plan JSONB,
  status TEXT NOT NULL DEFAULT 'scheduled'
);

CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  sailing_id TEXT REFERENCES sailings(id) ON DELETE CASCADE,
  seat_no TEXT,
  zone TEXT,
  status TEXT NOT NULL DEFAULT 'available'
);

CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  locale TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id),
  catalog_item_id TEXT REFERENCES catalog_items(id),
  fare_code TEXT,
  quantity INTEGER NOT NULL,
  gross NUMERIC(10,2) NOT NULL,
  net NUMERIC(10,2) NOT NULL,
  vat_amount NUMERIC(10,2) NOT NULL,
  vat_rate NUMERIC(5,4) NOT NULL,
  vat_mode TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RUB',
  status TEXT NOT NULL DEFAULT 'confirmed',
  refundable_until TIMESTAMPTZ,
  seating JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RUB',
  status TEXT NOT NULL,
  paid_at TIMESTAMPTZ,
  raw JSONB
);

CREATE TABLE refunds (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'RUB',
  status TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  number TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL
);

CREATE INDEX idx_orders_catalog_time ON orders(catalog_item_id, created_at);
CREATE INDEX idx_sailings_departure ON sailings(departure_time);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_refunds_status ON refunds(status);
