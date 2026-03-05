-- ============================================================
-- Women's Boutique POS — PostgreSQL Schema
-- Stack: Supabase (PostgreSQL) + Node.js/Express + Railway
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS (Auth / Roles)
-- ============================================================
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'staff'
                  CHECK (role IN ('admin', 'staff')),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL,
    parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE products (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(200) NOT NULL,
    category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand         VARCHAR(100),
    season        VARCHAR(100),
    description   TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. PRODUCT VARIANTS
-- Each variant = 1 SKU with its own stock & price
-- ============================================================
CREATE TABLE product_variants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    sku             VARCHAR(100) UNIQUE NOT NULL,
    size            VARCHAR(50),
    color           VARCHAR(50),
    fabric          VARCHAR(50),
    purchase_price  NUMERIC(12,2) NOT NULL DEFAULT 0,
    selling_price   NUMERIC(12,2) NOT NULL,
    stock_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. INVENTORY LOGS
-- Every stock change must be logged here (audit trail)
-- ============================================================
CREATE TABLE inventory_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id      UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    change_type     VARCHAR(30) NOT NULL
                    CHECK (change_type IN (
                        'purchase',     -- stock added via new purchase
                        'sale',         -- stock deducted via sale
                        'return',       -- stock added via customer return
                        'adjustment'    -- manual admin adjustment
                    )),
    quantity_change INTEGER NOT NULL,   -- positive = added, negative = deducted
    reference_id    UUID,               -- sale_id, return_id, or adjustment note
    note            TEXT,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. CUSTOMERS
-- Balance is NEVER stored here — always calculated from ledger
-- ============================================================
CREATE TABLE customers (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(150) NOT NULL,
    phone       VARCHAR(20) UNIQUE NOT NULL,
    address     TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. SALES
-- ============================================================
CREATE TABLE sales (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    total_amount    NUMERIC(12,2) NOT NULL,
    amount_paid     NUMERIC(12,2) NOT NULL DEFAULT 0,
    -- due = total_amount - amount_paid (derived, not stored)
    sale_date       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    note            TEXT,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL
    -- NO deleted_at — sales are immutable
);

-- ============================================================
-- 8. SALE ITEMS
-- Line items for each sale
-- ============================================================
CREATE TABLE sale_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id         UUID NOT NULL REFERENCES sales(id) ON DELETE RESTRICT,
    variant_id      UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(12,2) NOT NULL,   -- price at time of sale (snapshot)
    subtotal        NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- ============================================================
-- 9. PAYMENTS / INSTALLMENTS
-- Each payment = one row; links to customer
-- ============================================================
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    sale_id         UUID REFERENCES sales(id) ON DELETE RESTRICT, -- optional link
    amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    note            TEXT,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL
    -- NO deleted_at — payments are immutable
);

-- ============================================================
-- 10. LEDGER  ← CRITICAL TABLE
-- Every financial event creates a row here.
-- NEVER update or delete rows in this table.
-- ============================================================
CREATE TABLE ledger (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    entry_type      VARCHAR(10) NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    reference_type  VARCHAR(20) NOT NULL
                    CHECK (reference_type IN ('sale', 'payment', 'return')),
    reference_id    UUID NOT NULL,   -- sale_id, payment_id, or return_id
    note            TEXT,
    entry_date      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- NO created_by edit, NO soft delete — fully immutable
);

-- ============================================================
-- 11. RETURNS
-- Returns create a reverse DEBIT + stock restoration
-- Original sale is NEVER touched
-- ============================================================
CREATE TABLE returns (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id         UUID NOT NULL REFERENCES sales(id) ON DELETE RESTRICT,
    customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    return_date     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_refund    NUMERIC(12,2) NOT NULL,
    note            TEXT,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE return_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id       UUID NOT NULL REFERENCES returns(id) ON DELETE RESTRICT,
    variant_id      UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(12,2) NOT NULL,
    subtotal        NUMERIC(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- ============================================================
-- VIEWS
-- ============================================================

-- Customer Balance View (derived from ledger, never stored)
CREATE VIEW customer_balances AS
SELECT
    c.id            AS customer_id,
    c.name,
    c.phone,
    COALESCE(SUM(CASE WHEN l.entry_type = 'DEBIT'  THEN l.amount ELSE 0 END), 0) AS total_debit,
    COALESCE(SUM(CASE WHEN l.entry_type = 'CREDIT' THEN l.amount ELSE 0 END), 0) AS total_credit,
    COALESCE(SUM(CASE WHEN l.entry_type = 'DEBIT'  THEN l.amount ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN l.entry_type = 'CREDIT' THEN l.amount ELSE 0 END), 0) AS balance_due
FROM customers c
LEFT JOIN ledger l ON l.customer_id = c.id
GROUP BY c.id, c.name, c.phone;

-- Low Stock View (variants with stock <= 5)
CREATE VIEW low_stock_variants AS
SELECT
    p.name          AS product_name,
    pv.sku,
    pv.size,
    pv.color,
    pv.fabric,
    pv.stock_quantity,
    pv.selling_price
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.stock_quantity <= 5
  AND pv.is_active = TRUE;

-- Dead Stock View (variants with 0 stock)
CREATE VIEW dead_stock_variants AS
SELECT
    p.name          AS product_name,
    pv.sku,
    pv.size,
    pv.color,
    pv.stock_quantity
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.stock_quantity = 0
  AND pv.is_active = TRUE;

-- ============================================================
-- INDEXES (performance)
-- ============================================================
CREATE INDEX idx_ledger_customer     ON ledger(customer_id);
CREATE INDEX idx_ledger_entry_date   ON ledger(entry_date);
CREATE INDEX idx_sales_customer      ON sales(customer_id);
CREATE INDEX idx_sales_date          ON sales(sale_date);
CREATE INDEX idx_payments_customer   ON payments(customer_id);
CREATE INDEX idx_variants_product    ON product_variants(product_id);
CREATE INDEX idx_inventory_variant   ON inventory_logs(variant_id);
CREATE INDEX idx_customers_phone     ON customers(phone);

-- ============================================================
-- CONSTRAINTS / RULES (enforced at DB level)
-- ============================================================

-- Prevent stock from going below zero (belt-and-suspenders)
ALTER TABLE product_variants
    ADD CONSTRAINT chk_stock_non_negative
    CHECK (stock_quantity >= 0);

-- ============================================================
-- SAMPLE SEED DATA (optional — remove in production)
-- ============================================================

INSERT INTO categories (id, name) VALUES
    (uuid_generate_v4(), 'Women'),
    (uuid_generate_v4(), 'Saree'),
    (uuid_generate_v4(), 'Kurti'),
    (uuid_generate_v4(), 'Abaya'),
    (uuid_generate_v4(), 'Hijab');

INSERT INTO users (name, email, password_hash, role) VALUES
    ('Shop Owner', 'owner@boutique.com', 'CHANGE_THIS_HASH', 'admin');

-- ============================================================
-- END OF SCHEMA
-- ============================================================
