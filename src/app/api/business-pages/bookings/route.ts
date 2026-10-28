import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/gdrive/offload';
import { decrypt } from '@/lib/whatsapp/encryption';
import { sendTemplateMessage, sendTextMessage } from '@/lib/whatsapp/meta-api';
import { evolution } from '@/lib/evolution/client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: bookings, error } = await admin
      .from('business_page_bookings')
      .select('*')
      .eq('account_id', accountId)
      .order('booking_date', { ascending: true })
      .order('time_slot', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookings: bookings || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, accountId, status, notifyCustomer } = body;

    if (!bookingId || !accountId || !status) {
      return NextResponse.json(
        { error: 'bookingId, accountId, and status are required' },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    // 1. Fetch current booking record
    const { data: booking, error: fetchErr } = await admin
      .from('business_page_bookings')
      .select('*, page:business_pages(title, whatsapp_number)')
      .eq('id', bookingId)
      .eq('account_id', accountId)
      .single();

    if (fetchErr || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // 2. Update status
    const { data: updatedBooking, error: updateErr } = await admin
      .from('business_page_bookings')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // 3. Optionally notify customer on WhatsApp about status update (confirmed, completed, cancelled)
    if (notifyCustomer) {
      const businessTitle = booking.page?.title || 'Our Team';
      const cleanPhone = booking.phone.replace(/[^0-9+]/g, '');

      let alertText = '';
      if (status === 'confirmed') {
        alertText = `Hi ${booking.name}! Your appointment with ${businessTitle} on ${booking.booking_date} at ${booking.time_slot} has been confirmed. See you soon!`;
      } else if (status === 'cancelled') {
        alertText = `Hi ${booking.name}, your appointment with ${businessTitle} on ${booking.booking_date} at ${booking.time_slot} has been cancelled. Please let us know if you would like to reschedule.`;
      } else if (status === 'completed') {
        alertText = `Hi ${booking.name}, thank you for attending your appointment with ${businessTitle}! We appreciate your time. Let us know if you need anything else.`;
      }

      if (alertText) {
        try {
          // Check for Meta Cloud API config first
          const { data: metaConfig } = await admin
            .from('whatsapp_config')
            .select('*')
            .eq('account_id', accountId)
            .maybeSingle();

          let sent = false;
          if (metaConfig?.access_token && metaConfig?.phone_number_id) {
            const token = decrypt(metaConfig.access_token);
            const recipientPhone = cleanPhone.replace(/^\+/, '');
            // For custom status notices, send text (or template if within window)
            const metaRes = await sendTextMessage({
              phoneNumberId: metaConfig.phone_number_id,
              accessToken: token,
              to: recipientPhone,
              text: alertText,
            });
            if (metaRes?.messageId) sent = true;
          }

          // Fallback to Evolution Phone QR gateway
          if (!sent) {
            const evoInstance = `acc_${accountId.slice(0, 8)}`;
            const state = await evolution.getConnectionState(evoInstance).catch(() => null);
            if (state?.instance?.state === 'open') {
              await evolution.sendText(
                evoInstance,
                cleanPhone.replace(/[^0-9]/g, ''),
                alertText
              );
            }
          }
        } catch (dispatchErr) {
          console.warn('[business-pages/bookings] Notification dispatch error:', dispatchErr);
        }
      }
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
