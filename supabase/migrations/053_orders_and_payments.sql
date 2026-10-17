-- ============================================================
-- 053_orders_and_payments.sql — Zero-Gateway Direct UPI & Order Tracking
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id          uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number        text NOT NULL UNIQUE,
  order_type          text NOT NULL DEFAULT 'lead_pack', -- 'lead_pack', 'subscription', 'custom_service'
  item_name           text NOT NULL,                      -- e.g. '1,000 Verified Leads Pack'
  amount              numeric(12,2) NOT NULL,             -- e.g. 999.00
  currency            text NOT NULL DEFAULT 'INR',
  payment_method      text NOT NULL DEFAULT 'upi_qr',     -- 'upi_qr', 'upi_intent', 'bank_transfer'
  utr_number          text,                               -- 12-digit UPI reference number
  whatsapp_phone      text NOT NULL,                      -- delivery phone
  parameters          jsonb NOT NULL DEFAULT '{}'::jsonb, -- { niche: 'Real Estate', city: 'Mumbai', leads_count: 1000 }
  status              text NOT NULL DEFAULT 'pending_verification', -- 'pending_verification', 'paid', 'fulfilled', 'cancelled'
  admin_notes         text,                               -- private note or rejection reason
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Indexing for speed
CREATE INDEX IF NOT EXISTS idx_orders_account_id ON orders(account_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- SELECT Policy:
-- Members of the account can see orders associated with their account.
DROP POLICY IF EXISTS orders_select ON orders;
CREATE POLICY orders_select ON orders FOR SELECT
  USING (is_account_member(account_id));

-- INSERT Policy:
-- Any member of the account can place an order for their account.
DROP POLICY IF EXISTS orders_insert ON orders;
CREATE POLICY orders_insert ON orders FOR INSERT
  WITH CHECK (is_account_member(account_id));

-- UPDATE Policy:
-- Only Admin or Owner can update order status (approve, fulfill, reject).
DROP POLICY IF EXISTS orders_update ON orders;
CREATE POLICY orders_update ON orders FOR UPDATE
  USING (is_account_member(account_id, 'admin'));

-- DELETE Policy:
-- Only Owner can delete order records.
DROP POLICY IF EXISTS orders_delete ON orders;
CREATE POLICY orders_delete ON orders FOR DELETE
  USING (is_account_member(account_id, 'owner'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_orders_updated_at();
