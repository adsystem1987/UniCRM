-- 063_business_working_hours_and_calendar.sql
-- Working hours, slot intervals, and Google Calendar sync for Business Micro-Pages

DO $$
BEGIN
  -- Add working hours & slot duration to business_pages
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_pages' AND column_name = 'working_hours'
  ) THEN
    ALTER TABLE public.business_pages ADD COLUMN working_hours JSONB DEFAULT '{
      "days": [1, 2, 3, 4, 5, 6],
      "start_time": "10:00",
      "end_time": "19:00",
      "slot_duration": 30,
      "buffer_minutes": 10
    }'::jsonb;
  END IF;

  -- Add calendar event link to business_page_bookings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_page_bookings' AND column_name = 'google_calendar_event_id'
  ) THEN
    ALTER TABLE public.business_page_bookings ADD COLUMN google_calendar_event_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'business_page_bookings' AND column_name = 'google_calendar_html_link'
  ) THEN
    ALTER TABLE public.business_page_bookings ADD COLUMN google_calendar_html_link TEXT;
  END IF;
END $$;
