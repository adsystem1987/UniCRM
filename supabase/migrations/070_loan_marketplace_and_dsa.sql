-- 070_loan_marketplace_and_dsa.sql
-- Embedded lending platform & DSA Lead Assignment with privacy masking

CREATE TYPE public.loan_application_status AS ENUM (
  'submitted',     -- Submitted by UniCRM business user
  'assigned',      -- Platform owner assigned to a DSA partner
  'accepted',      -- DSA partner accepted lead (unmasks email & phone)
  'rejected',      -- DSA partner declined lead
  'in_review',     -- Bank / NBFC underwriting
  'sanctioned',    -- Loan sanctioned by lender
  'disbursed',     -- Funds credited to borrower
  'closed'         -- Completed or cancelled
);

CREATE TABLE IF NOT EXISTS public.loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Applicant Contact & Business Info
  business_name TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,

  -- Loan Specifications
  loan_category TEXT NOT NULL, -- business, home, personal, msme_machinery, lap, private_funding
  amount_requested NUMERIC(15, 2) NOT NULL,
  monthly_turnover TEXT,
  business_vintage TEXT, -- e.g. "2-5 years"
  gst_number TEXT,
  pan_number TEXT,
  additional_notes TEXT,

  -- DSA Assignment & Privacy Masking State
  status public.loan_application_status NOT NULL DEFAULT 'submitted',
  assigned_to_dsa_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Payout Tracking (Platform commission)
  disbursed_amount NUMERIC(15, 2),
  commission_percentage NUMERIC(5, 2) DEFAULT 1.00,
  commission_earned NUMERIC(15, 2),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_apps_account ON public.loan_applications(account_id);
CREATE INDEX IF NOT EXISTS idx_loan_apps_status ON public.loan_applications(status);
CREATE INDEX IF NOT EXISTS idx_loan_apps_dsa ON public.loan_applications(assigned_to_dsa_id);

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

-- 1. Applicants can view their own loan applications
CREATE POLICY "Users can view own loan applications"
  ON public.loan_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Platform Owners / Admins have full access
CREATE POLICY "Platform owners have full access to loans"
  ON public.loan_applications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'platform_owner'
    )
  );

-- 3. Assigned DSA agents can view their assigned leads
CREATE POLICY "DSA agents can view assigned leads"
  ON public.loan_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = assigned_to_dsa_id);

-- 4. DSA agents can update status to accepted / rejected
CREATE POLICY "DSA agents can update status of assigned leads"
  ON public.loan_applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = assigned_to_dsa_id)
  WITH CHECK (auth.uid() = assigned_to_dsa_id);
