-- 061_business_page_bookings.sql
-- Appointment bookings and scheduling for Business Micro-Pages (/p/[slug])

CREATE TABLE IF NOT EXISTS public.business_page_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.business_pages(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  booking_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  item_id TEXT,
  item_title TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed, completed, cancelled, no_show
  whatsapp_notification_status TEXT DEFAULT 'pending', -- sent, failed, pending
  whatsapp_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_bookings_account ON public.business_page_bookings(account_id);
CREATE INDEX IF NOT EXISTS idx_page_bookings_page ON public.business_page_bookings(page_id);
CREATE INDEX IF NOT EXISTS idx_page_bookings_date ON public.business_page_bookings(booking_date);

ALTER TABLE public.business_page_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert bookings" ON public.business_page_bookings;
CREATE POLICY "Public can insert bookings"
  ON public.business_page_bookings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Members can view their page bookings" ON public.business_page_bookings;
CREATE POLICY "Members can view their page bookings"
  ON public.business_page_bookings FOR SELECT
  USING (
    is_account_member(account_id)
  );

DROP POLICY IF EXISTS "Members can update their page bookings" ON public.business_page_bookings;
CREATE POLICY "Members can update their page bookings"
  ON public.business_page_bookings FOR UPDATE
  USING (
    is_account_member(account_id, 'agent')
  )
  WITH CHECK (
    is_account_member(account_id, 'agent')
  );
