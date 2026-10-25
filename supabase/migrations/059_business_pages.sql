-- 059_business_pages.sql
-- Dynamic Business Micro-Page & Catalog (Social Post Style) for UniCRM Accounts

CREATE TABLE IF NOT EXISTS public.business_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  tagline TEXT,
  about TEXT,
  whatsapp_number TEXT NOT NULL,
  calling_number TEXT,
  address TEXT,
  google_maps_url TEXT,
  logo_url TEXT,
  cover_url TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  lead_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_account_business_page UNIQUE (account_id)
);

CREATE INDEX IF NOT EXISTS idx_business_pages_slug ON public.business_pages(slug);
CREATE INDEX IF NOT EXISTS idx_business_pages_account ON public.business_pages(account_id);

ALTER TABLE public.business_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their business page" ON public.business_pages;
CREATE POLICY "Members can view their business page"
  ON public.business_pages FOR SELECT
  USING (
    is_account_member(account_id)
    OR is_published = true
  );

DROP POLICY IF EXISTS "Members can insert their business page" ON public.business_pages;
CREATE POLICY "Members can insert their business page"
  ON public.business_pages FOR INSERT
  WITH CHECK (
    is_account_member(account_id, 'admin')
  );

DROP POLICY IF EXISTS "Members can update their business page" ON public.business_pages;
CREATE POLICY "Members can update their business page"
  ON public.business_pages FOR UPDATE
  USING (
    is_account_member(account_id, 'admin')
  )
  WITH CHECK (
    is_account_member(account_id, 'admin')
  );

DROP POLICY IF EXISTS "Members can delete their business page" ON public.business_pages;
CREATE POLICY "Members can delete their business page"
  ON public.business_pages FOR DELETE
  USING (
    is_account_member(account_id, 'owner')
  );

CREATE TABLE IF NOT EXISTS public.business_page_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.business_pages(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  item_id TEXT,
  item_title TEXT,
  notes TEXT,
  source TEXT DEFAULT 'web_page',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_inquiries_account ON public.business_page_inquiries(account_id);
CREATE INDEX IF NOT EXISTS idx_page_inquiries_page ON public.business_page_inquiries(page_id);

ALTER TABLE public.business_page_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit inquiries" ON public.business_page_inquiries;
CREATE POLICY "Public can submit inquiries"
  ON public.business_page_inquiries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Members can view their page inquiries" ON public.business_page_inquiries;
CREATE POLICY "Members can view their page inquiries"
  ON public.business_page_inquiries FOR SELECT
  USING (
    is_account_member(account_id)
  );
