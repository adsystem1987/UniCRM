-- ============================================================
-- 047_call_logs.sql — WhatsApp Voice Calling & IVR with Whatomate
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_direction') THEN
    CREATE TYPE call_direction AS ENUM ('inbound', 'outbound');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'call_status') THEN
    CREATE TYPE call_status AS ENUM (
      'initiated',
      'ringing',
      'in_progress',
      'completed',
      'missed',
      'busy',
      'failed'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  whatomate_call_id text,
  direction call_direction NOT NULL,
  status call_status NOT NULL DEFAULT 'initiated',
  from_number text NOT NULL,
  to_number text NOT NULL,
  duration_seconds integer DEFAULT 0,
  recording_url text,
  ivr_path jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_logs_account_id ON call_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_contact_id ON call_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_conversation_id ON call_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_whatomate_call_id ON call_logs(whatomate_call_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_created_at ON call_logs(created_at DESC);

-- Enable RLS
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to allow re-running cleanly
DROP POLICY IF EXISTS call_logs_select ON call_logs;
DROP POLICY IF EXISTS call_logs_insert ON call_logs;
DROP POLICY IF EXISTS call_logs_update ON call_logs;
DROP POLICY IF EXISTS call_logs_delete ON call_logs;

-- RLS Policies using UniCRM's standard is_account_member() helper
CREATE POLICY call_logs_select ON call_logs
  FOR SELECT USING (is_account_member(account_id));

CREATE POLICY call_logs_insert ON call_logs
  FOR INSERT WITH CHECK (is_account_member(account_id, 'agent'));

CREATE POLICY call_logs_update ON call_logs
  FOR UPDATE USING (is_account_member(account_id, 'agent'));

CREATE POLICY call_logs_delete ON call_logs
  FOR DELETE USING (is_account_member(account_id, 'admin'));
