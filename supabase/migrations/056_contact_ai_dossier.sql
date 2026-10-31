-- ============================================================
-- Migration 056: Contact AI Memory Dossier (Garry Tan / gbrain)
-- Adds AI intelligence dossier fields to contacts table and
-- extends ai_usage_log mode to support 'dossier'.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'ai_dossier'
  ) THEN
    ALTER TABLE contacts ADD COLUMN ai_dossier TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'ai_dossier_updated_at'
  ) THEN
    ALTER TABLE contacts ADD COLUMN ai_dossier_updated_at TIMESTAMPTZ;
  END IF;
END $$;

-- Allow 'dossier' in ai_usage_log mode check constraint
ALTER TABLE ai_usage_log
  DROP CONSTRAINT IF EXISTS ai_usage_log_mode_check;

ALTER TABLE ai_usage_log
  ADD CONSTRAINT ai_usage_log_mode_check
  CHECK (mode IN ('auto_reply', 'draft', 'dossier'));

