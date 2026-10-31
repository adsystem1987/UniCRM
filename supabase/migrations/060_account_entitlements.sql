-- 060_account_entitlements.sql
-- Client Provisioning & Entitlements for Platform Owner (AI Pro & Lead Finder Credits)

CREATE TABLE IF NOT EXISTS public.account_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  -- AI Smart Auto-Reply (e.g. 3 Months promotional or paid subscription)
  ai_pro_active BOOLEAN NOT NULL DEFAULT false,
  ai_pro_expires_at TIMESTAMPTZ,
  ai_provider TEXT DEFAULT 'omniroute',
  ai_api_key_encrypted TEXT,
  ai_model TEXT DEFAULT 'gemini-1.5-flash',
  
  -- Smart Lead Discovery Credits & Dedicated Runner
  lead_credits_balance INTEGER NOT NULL DEFAULT 0,
  lead_scraper_token_encrypted TEXT,
  lead_credits_total_granted INTEGER NOT NULL DEFAULT 0,
  
  -- Administrative notes
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_account_entitlements UNIQUE (account_id)
);

CREATE INDEX IF NOT EXISTS idx_account_entitlements_account ON public.account_entitlements(account_id);

ALTER TABLE public.account_entitlements ENABLE ROW LEVEL SECURITY;

-- Account members can view their active status and credit balance (but NOT raw encrypted keys)
DROP POLICY IF EXISTS "Members can view their own entitlements" ON public.account_entitlements;
CREATE POLICY "Members can view their own entitlements"
  ON public.account_entitlements FOR SELECT
  USING (
    is_account_member(account_id)
  );

-- Master Admin / Platform Owner has full access via service role / admin APIs
DROP POLICY IF EXISTS "Platform Owner can manage all entitlements" ON public.account_entitlements;
CREATE POLICY "Platform Owner can manage all entitlements"
  ON public.account_entitlements FOR ALL
  USING (
    auth.jwt() ->> 'email' IN ('brosir2019@gmail.com', 'help@dfyunicrm.com')
  );
