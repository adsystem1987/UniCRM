-- ============================================================
-- Migration 055: Master Admin & Account Lifecycle Status
-- Adds account status management (active, suspended, phased_out)
-- and support for platform-level master admin oversight.
-- ============================================================

-- 1. Add status column to accounts table if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'status'
  ) THEN
    ALTER TABLE accounts ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'suspended', 'phased_out'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'suspension_reason'
  ) THEN
    ALTER TABLE accounts ADD COLUMN suspension_reason TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts' AND column_name = 'suspended_at'
  ) THEN
    ALTER TABLE accounts ADD COLUMN suspended_at TIMESTAMPTZ;
  END IF;
END $$;

-- 2. Fast lookup index on accounts(status)
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
