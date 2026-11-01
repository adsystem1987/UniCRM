-- 072_customer_portal_and_lead_pipelines.sql
-- 1. Support customer role distinction (skips agency BYOD setup)
-- 2. Ensure default Lending Desk pipeline exists for auto-qualified leads

-- Add user_type to profiles: 'business' (default CRM user) or 'customer' (borrower / retail buyer)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL DEFAULT 'business';

CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);

-- Function to safely ensure default "Lending Desk" pipeline & stages exist for an account
CREATE OR REPLACE FUNCTION public.ensure_lending_pipeline(p_account_id UUID, p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pipeline_id UUID;
  v_stage_id UUID;
BEGIN
  -- Check if pipeline already exists
  SELECT id INTO v_pipeline_id
  FROM public.pipelines
  WHERE account_id = p_account_id
    AND name = 'Lending & Capital Desk'
  LIMIT 1;

  -- If not found, create it
  IF v_pipeline_id IS NULL THEN
    INSERT INTO public.pipelines (account_id, user_id, name)
    VALUES (p_account_id, p_user_id, 'Lending & Capital Desk')
    RETURNING id INTO v_pipeline_id;

    -- Create stages for Lending Desk
    INSERT INTO public.pipeline_stages (pipeline_id, name, position, color)
    VALUES
      (v_pipeline_id, '1. New Qualified Leads', 0, '#10b981'),
      (v_pipeline_id, '2. Assigned to DSA', 1, '#3b82f6'),
      (v_pipeline_id, '3. Paperwork & Review', 2, '#f59e0b'),
      (v_pipeline_id, '4. Sanctioned & Disbursed', 3, '#059669'),
      (v_pipeline_id, '5. Closed / Lost', 4, '#64748b');
  END IF;

  RETURN v_pipeline_id;
END;
$$;
