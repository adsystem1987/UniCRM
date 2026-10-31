-- 065_airbnb_stays_and_eventbrite_tickets.sql
-- Multi-day stays (Airbnb pattern) & Event Ticketing/RSVP (Eventbrite pattern) for Business Micro-Pages

DO $$
BEGIN
  -- 1. Add stay & event fields to business_page_bookings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_page_bookings' AND column_name = 'booking_type'
  ) THEN
    -- 'appointment' (default slot), 'stay' (Airbnb multi-day), 'event' (Eventbrite ticket/RSVP)
    ALTER TABLE public.business_page_bookings ADD COLUMN booking_type TEXT NOT NULL DEFAULT 'appointment';
  END IF;

  -- Airbnb multi-day stay fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_page_bookings' AND column_name = 'check_in_date'
  ) THEN
    ALTER TABLE public.business_page_bookings ADD COLUMN check_in_date DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_page_bookings' AND column_name = 'check_out_date'
  ) THEN
    ALTER TABLE public.business_page_bookings ADD COLUMN check_out_date DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_page_bookings' AND column_name = 'guests_count'
  ) THEN
    ALTER TABLE public.business_page_bookings ADD COLUMN guests_count INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_page_bookings' AND column_name = 'total_nights'
  ) THEN
    ALTER TABLE public.business_page_bookings ADD COLUMN total_nights INTEGER;
  END IF;

  -- Eventbrite ticketing / RSVP fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_page_bookings' AND column_name = 'tickets_count'
  ) THEN
    ALTER TABLE public.business_page_bookings ADD COLUMN tickets_count INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_page_bookings' AND column_name = 'ticket_reference_code'
  ) THEN
    ALTER TABLE public.business_page_bookings ADD COLUMN ticket_reference_code TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_page_bookings' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE public.business_page_bookings ADD COLUMN total_price TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_page_bookings_type ON public.business_page_bookings(booking_type);
CREATE INDEX IF NOT EXISTS idx_page_bookings_checkin ON public.business_page_bookings(check_in_date);
