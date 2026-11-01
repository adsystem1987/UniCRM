-- 071_loan_document_tracker.sql
-- 1-Click Document Requests & Checklist Tracker between DSA and Borrower

CREATE TYPE public.loan_doc_status AS ENUM (
  'requested',   -- DSA requested document from customer
  'uploaded',    -- Customer submitted document/file
  'verified',    -- DSA approved document
  'rejected'     -- DSA asked for re-upload with note
);

CREATE TABLE IF NOT EXISTS public.loan_document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_application_id UUID NOT NULL REFERENCES public.loan_applications(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  
  -- Who is requesting and who is fulfilling
  requested_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- DSA agent or admin
  borrower_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,     -- Customer / Borrower
  
  -- Document Details
  doc_type TEXT NOT NULL, -- e.g. "itr_3_years", "bank_statement_6m", "gst_returns_12m", "property_deed", "pan_aadhaar", "custom"
  title TEXT NOT NULL,    -- Human readable, e.g. "3 Years ITR with Computation Sheets"
  description TEXT,       -- Instructions, e.g. "Must be digitally verified or signed"
  status public.loan_doc_status NOT NULL DEFAULT 'requested',
  
  -- Upload fulfillment
  file_url TEXT,
  file_name TEXT,
  file_size INT,
  uploaded_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  rejection_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loan_doc_loan_app ON public.loan_document_requests(loan_application_id);
CREATE INDEX IF NOT EXISTS idx_loan_doc_status ON public.loan_document_requests(status);

ALTER TABLE public.loan_document_requests ENABLE ROW LEVEL SECURITY;

-- 1. Borrowers can view and upload their own requested documents
CREATE POLICY "Borrowers can view own document requests"
  ON public.loan_document_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = borrower_user_id);

CREATE POLICY "Borrowers can upload own document requests"
  ON public.loan_document_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = borrower_user_id)
  WITH CHECK (auth.uid() = borrower_user_id);

-- 2. Platform owners can view and manage all document requests
CREATE POLICY "Platform owners manage all loan docs"
  ON public.loan_document_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'platform_owner'
    )
  );

-- 3. Assigned DSA agents can manage document requests for their assigned loans
CREATE POLICY "DSA agents manage docs for assigned loans"
  ON public.loan_document_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.loan_applications
      WHERE loan_applications.id = loan_document_requests.loan_application_id
      AND loan_applications.assigned_to_dsa_id = auth.uid()
    )
  );
