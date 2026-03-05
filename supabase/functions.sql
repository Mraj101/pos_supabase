-- ============================================================
-- SUPABASE RPC FUNCTIONS
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. SEARCH VARIANTS
-- Used by NewSale page to search products by name or SKU
-- ============================================================
CREATE OR REPLACE FUNCTION search_variants(search_term TEXT)
RETURNS TABLE (
  id              UUID,
  sku             TEXT,
  size            TEXT,
  color           TEXT,
  fabric          TEXT,
  selling_price   NUMERIC,
  stock_quantity  INTEGER,
  product_name    TEXT
) SECURITY DEFINER AS $$
  SELECT
    pv.id,
    pv.sku,
    pv.size,
    pv.color,
    pv.fabric,
    pv.selling_price,
    pv.stock_quantity,
    p.name AS product_name
  FROM product_variants pv
  JOIN products p ON p.id = pv.product_id
  WHERE
    (pv.sku ILIKE '%' || search_term || '%' OR p.name ILIKE '%' || search_term || '%')
    AND pv.is_active = TRUE
    AND p.is_active  = TRUE
    AND pv.stock_quantity > 0
  ORDER BY p.name, pv.sku
  LIMIT 20;
$$ LANGUAGE sql;


-- ============================================================
-- 2. CREATE SALE (ATOMIC)
-- Creates sale + sale_items + stock deduction + ledger entries
-- All in one transaction — never partially completes
-- ============================================================
CREATE OR REPLACE FUNCTION create_sale(
  p_customer_id   UUID,
  p_items         JSONB,    -- [{variant_id, quantity, unit_price}]
  p_total_amount  NUMERIC,
  p_amount_paid   NUMERIC,
  p_note          TEXT DEFAULT NULL
) RETURNS UUID SECURITY DEFINER AS $$
DECLARE
  v_sale_id       UUID;
  v_payment_id    UUID;
  v_item          JSONB;
  v_variant_id    UUID;
  v_qty           INTEGER;
  v_price         NUMERIC;
  v_curr_stock    INTEGER;
BEGIN
  -- Validate customer
  IF NOT EXISTS (SELECT 1 FROM customers WHERE id = p_customer_id AND is_active = TRUE) THEN
    RAISE EXCEPTION 'Customer not found or inactive';
  END IF;

  -- Validate payment
  IF p_amount_paid < 0 THEN
    RAISE EXCEPTION 'Payment amount cannot be negative';
  END IF;
  IF p_amount_paid > p_total_amount THEN
    RAISE EXCEPTION 'Payment cannot exceed total amount';
  END IF;

  -- Create sale record
  INSERT INTO sales (customer_id, total_amount, amount_paid, note)
  VALUES (p_customer_id, p_total_amount, p_amount_paid, p_note)
  RETURNING id INTO v_sale_id;

  -- Process each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_variant_id := (v_item->>'variant_id')::UUID;
    v_qty        := (v_item->>'quantity')::INTEGER;
    v_price      := (v_item->>'unit_price')::NUMERIC;

    -- Check & lock stock
    SELECT stock_quantity INTO v_curr_stock
    FROM product_variants
    WHERE id = v_variant_id AND is_active = TRUE
    FOR UPDATE;

    IF v_curr_stock IS NULL THEN
      RAISE EXCEPTION 'Variant % not found or inactive', v_variant_id;
    END IF;

    IF v_curr_stock < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', v_curr_stock, v_qty;
    END IF;

    -- Insert sale item
    INSERT INTO sale_items (sale_id, variant_id, quantity, unit_price)
    VALUES (v_sale_id, v_variant_id, v_qty, v_price);

    -- Deduct stock
    UPDATE product_variants
    SET stock_quantity = stock_quantity - v_qty
    WHERE id = v_variant_id;

    -- Log inventory change
    INSERT INTO inventory_logs (variant_id, change_type, quantity_change, reference_id, note)
    VALUES (v_variant_id, 'sale', -v_qty, v_sale_id, 'Auto-deducted on sale');
  END LOOP;

  -- Ledger DEBIT entry (customer owes this amount)
  INSERT INTO ledger (customer_id, entry_type, amount, reference_type, reference_id, note)
  VALUES (p_customer_id, 'DEBIT', p_total_amount, 'sale', v_sale_id, p_note);

  -- If payment provided, create payment + CREDIT entry
  IF p_amount_paid > 0 THEN
    INSERT INTO payments (customer_id, sale_id, amount, note)
    VALUES (p_customer_id, v_sale_id, p_amount_paid, p_note)
    RETURNING id INTO v_payment_id;

    INSERT INTO ledger (customer_id, entry_type, amount, reference_type, reference_id, note)
    VALUES (p_customer_id, 'CREDIT', p_amount_paid, 'payment', v_payment_id, 'Paid at sale');
  END IF;

  RETURN v_sale_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE; -- re-raise to trigger rollback
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 3. RECORD PAYMENT (ATOMIC)
-- Records installment payment + ledger CREDIT entry
-- ============================================================
CREATE OR REPLACE FUNCTION record_payment(
  p_customer_id UUID,
  p_amount      NUMERIC,
  p_sale_id     UUID    DEFAULT NULL,
  p_note        TEXT    DEFAULT NULL
) RETURNS UUID SECURITY DEFINER AS $$
DECLARE
  v_payment_id  UUID;
  v_balance_due NUMERIC;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be positive';
  END IF;

  -- Check current balance
  SELECT balance_due INTO v_balance_due
  FROM customer_balances
  WHERE customer_id = p_customer_id;

  IF v_balance_due IS NULL THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;

  IF p_amount > v_balance_due THEN
    RAISE EXCEPTION 'Payment (%) exceeds balance due (%)', p_amount, v_balance_due;
  END IF;

  -- Create payment record
  INSERT INTO payments (customer_id, sale_id, amount, note)
  VALUES (p_customer_id, p_sale_id, p_amount, p_note)
  RETURNING id INTO v_payment_id;

  -- Ledger CREDIT entry
  INSERT INTO ledger (customer_id, entry_type, amount, reference_type, reference_id, note)
  VALUES (p_customer_id, 'CREDIT', p_amount, 'payment', v_payment_id, p_note);

  RETURN v_payment_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql;
