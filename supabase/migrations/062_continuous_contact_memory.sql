-- 062_continuous_contact_memory.sql
-- Autonomous Continuous Learning Memory Engine for UniCRM Contacts (inspired by agentdb/vector memory patterns)

DO $$
BEGIN
  -- Add structured intelligence memory fields to contacts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'ai_memory'
  ) THEN
    ALTER TABLE public.contacts ADD COLUMN ai_memory JSONB DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contacts' AND column_name = 'ai_memory_updated_at'
  ) THEN
    ALTER TABLE public.contacts ADD COLUMN ai_memory_updated_at TIMESTAMPTZ;
  END IF;
END $$;

-- Contact memory interactions log for tracking continuous updates
CREATE TABLE IF NOT EXISTS public.contact_memory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  extracted_key TEXT NOT NULL, -- e.g. 'budget', 'buying_intent', 'objections', 'preferred_channel'
  extracted_value TEXT NOT NULL,
  confidence NUMERIC(3,2) DEFAULT 0.90,
  source_message_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_memory_logs_contact ON public.contact_memory_logs(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_memory_logs_account ON public.contact_memory_logs(account_id);

ALTER TABLE public.contact_memory_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view contact memory logs" ON public.contact_memory_logs;
CREATE POLICY "Members can view contact memory logs"
  ON public.contact_memory_logs FOR SELECT
  USING (
    is_account_member(account_id)
  );
