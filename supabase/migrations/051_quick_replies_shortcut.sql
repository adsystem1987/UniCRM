-- Migration 051: Add shortcut column to quick_replies for /slash command autocomplete
-- ============================================================

ALTER TABLE quick_replies
  ADD COLUMN IF NOT EXISTS shortcut TEXT;

CREATE INDEX IF NOT EXISTS idx_quick_replies_shortcut
  ON quick_replies(account_id, shortcut);
