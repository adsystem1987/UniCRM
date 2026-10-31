-- 067_workspace_claim_tokens.sql
-- Table to manage pre-provisioned workspace claims & anti-spam suppression

CREATE TABLE IF NOT EXISTS public.email_suppression_list (
  email TEXT PRIMARY KEY,
  reason TEXT NOT NULL DEFAULT 'opt_out', -- 'opt_out', 'bounce', 'complaint'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_suppression_list ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.workspace_claim_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  category TEXT DEFAULT 'general',
  city TEXT,
  page_slug TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'claimed', 'opted_out', 'expired'
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  opted_out_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_claim_tokens_token ON public.workspace_claim_tokens(token);
CREATE INDEX IF NOT EXISTS idx_claim_tokens_email ON public.workspace_claim_tokens(email);
CREATE INDEX IF NOT EXISTS idx_claim_tokens_status ON public.workspace_claim_tokens(status);

ALTER TABLE public.workspace_claim_tokens ENABLE ROW LEVEL SECURITY;

-- Allow public claim validation via RPC or service-role, restrict table read
DROP POLICY IF EXISTS "Public can view valid claim tokens" ON public.workspace_claim_tokens;
CREATE POLICY "Public can view valid claim tokens"
  ON public.workspace_claim_tokens FOR SELECT
  USING (status = 'pending' AND expires_at > now());
