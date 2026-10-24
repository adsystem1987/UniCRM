-- ============================================================
-- Migration 054: User Onboarding Sequence Queue
-- Tracks and schedules automated follow-up emails (Touchpoints 2 & 3)
-- with smart state checks (e.g. skip if WhatsApp already connected).
-- ============================================================

CREATE TABLE IF NOT EXISTS user_onboarding_sequence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  step TEXT NOT NULL CHECK (step IN ('whatsapp_followup', 'dfy_pitch')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'delivered', 'skipped', 'failed')),
  run_at TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, step)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_sequence_due
  ON user_onboarding_sequence(run_at) WHERE status = 'pending';

ALTER TABLE user_onboarding_sequence ENABLE ROW LEVEL SECURITY;

-- Server-side / Service-role access only for execution
DROP POLICY IF EXISTS "Service role manages onboarding sequence" ON user_onboarding_sequence;
CREATE POLICY "Service role manages onboarding sequence"
  ON user_onboarding_sequence
  FOR ALL
  USING (true)
  WITH CHECK (true);
