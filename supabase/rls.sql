-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Run this in: Supabase Dashboard → SQL Editor
-- After running schema.sql and functions.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products        ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger           ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns          ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLICY: Only authenticated users can read/write all data
-- In v1, all authenticated users have full access.
-- Admin vs staff distinction is enforced in the UI layer.
-- ============================================================

DO $$ 
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'categories', 'products', 'product_variants', 'inventory_logs',
    'customers', 'sales', 'sale_items', 'payments', 'ledger',
    'returns', 'return_items'
  ]
  LOOP
    EXECUTE format('
      CREATE POLICY "auth_full_access" ON %I
      FOR ALL TO authenticated
      USING (true) WITH CHECK (true);
    ', t);
  END LOOP;
END $$;

-- Users table: users can only see their own row
CREATE POLICY "users_own_row" ON users
  FOR ALL TO authenticated
  USING (auth.uid() = id);

-- ============================================================
-- LEDGER PROTECTION: Prevent direct insert/update/delete
-- on ledger table from the client. All ledger writes must
-- go through the RPC functions (which run as SECURITY DEFINER)
-- ============================================================

-- Drop the generic policy on ledger
DROP POLICY IF EXISTS "auth_full_access" ON ledger;

-- Read-only for authenticated users
CREATE POLICY "ledger_read_only" ON ledger
  FOR SELECT TO authenticated
  USING (true);

-- No direct insert/update/delete — only via RPC
-- (The RPC functions use SECURITY DEFINER and bypass RLS)

-- ============================================================
-- SAME PROTECTION FOR PAYMENTS
-- ============================================================
DROP POLICY IF EXISTS "auth_full_access" ON payments;

CREATE POLICY "payments_read_only" ON payments
  FOR SELECT TO authenticated
  USING (true);

-- ============================================================
-- SAME PROTECTION FOR SALES (read + insert via RPC, no delete)
-- ============================================================
DROP POLICY IF EXISTS "auth_full_access" ON sales;

CREATE POLICY "sales_read" ON sales
  FOR SELECT TO authenticated
  USING (true);

-- ============================================================
-- Allow RPC functions to write by granting schema usage
-- ============================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION create_sale TO authenticated;
GRANT EXECUTE ON FUNCTION record_payment TO authenticated;
GRANT EXECUTE ON FUNCTION search_variants TO authenticated;
