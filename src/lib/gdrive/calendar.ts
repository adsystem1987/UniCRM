import { getOrRefreshDriveToken } from '@/lib/gdrive/client';
import { SupabaseClient } from '@supabase/supabase-js';

const GOOGLE_CALENDAR_EVENTS_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

export interface CalendarEventPayload {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string; // ISO string e.g. 2026-10-28T10:00:00+05:30
  endDateTime: string;   // ISO string e.g. 2026-10-28T10:30:00+05:30
  timeZone?: string;
  attendeeEmail?: string;
}

/**
 * Creates an event in the workspace owner's primary Google Calendar
 * using their existing connected Google Drive/Workspace token.
 */
export async function createGoogleCalendarEvent({
  supabase,
  accountId,
  event,
}: {
  supabase: SupabaseClient;
  accountId: string;
  event: CalendarEventPayload;
}): Promise<{ eventId?: string; htmlLink?: string } | null> {
  try {
    const { data: config } = await supabase
      .from('gdrive_configs')
      .select('refresh_token')
      .eq('account_id', accountId)
      .maybeSingle();

    if (!config?.refresh_token) {
      return null;
    }

    const accessToken = await getOrRefreshDriveToken(accountId, config.refresh_token);
    if (!accessToken) return null;

    const body: Record<string, unknown> = {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.startDateTime,
        timeZone: event.timeZone || 'Asia/Kolkata',
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: event.timeZone || 'Asia/Kolkata',
      },
    };

    if (event.attendeeEmail) {
      body.attendees = [{ email: event.attendeeEmail }];
    }

    const res = await fetch(GOOGLE_CALENDAR_EVENTS_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('[calendar] Google Calendar event creation skipped or failed:', err);
      return null;
    }

    const data = await res.json();
    return {
      eventId: data.id,
      htmlLink: data.htmlLink,
    };
  } catch (err) {
    console.warn('[calendar] Error syncing to Google Calendar:', err);
    return null;
  }
}

/**
 * Generates an instant, zero-permission Web "Add to Google Calendar" link
 * that works immediately for any client on mobile or desktop.
 */
export function generateGoogleCalendarWebLink({
  title,
  description,
  location,
  startDate, // YYYY-MM-DD
  timeSlot,  // e.g. "10:00 AM", "02:30 PM", "10:00"
}: {
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  timeSlot: string;
}): string {
  try {
    // Parse start time
    const [timePart, modifier] = timeSlot.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;

    const start = new Date(startDate);
    start.setHours(hours, minutes || 0, 0, 0);

    // Default 30-min duration
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const formatGDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      details: description || 'Appointment booked via UniCRM',
      location: location || '',
      dates: `${formatGDate(start)}/${formatGDate(end)}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch {
    return 'https://calendar.google.com';
  }
}
