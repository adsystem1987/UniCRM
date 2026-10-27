import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/gdrive/offload';
import { decrypt } from '@/lib/whatsapp/encryption';
import { sendTemplateMessage, sendTextMessage } from '@/lib/whatsapp/meta-api';
import { evolution } from '@/lib/evolution/client';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      pageId,
      accountId,
      name,
      phone,
      bookingDate,
      timeSlot,
      itemId,
      itemTitle,
      notes,
    } = body;

    if (!pageId || !accountId || !name?.trim() || !phone?.trim() || !bookingDate || !timeSlot) {
      return NextResponse.json(
        { error: 'Name, phone number, booking date, and time slot are required.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const admin = getAdminClient();

    // 1. Fetch business page details for business title & fallback whatsapp number
    const { data: page } = await admin
      .from('business_pages')
      .select('id, title, whatsapp_number, lead_count')
      .eq('id', pageId)
      .single();

    const businessTitle = page?.title || 'Our Team';

    // 2. Find or create Contact in CRM with #BookedClient tag
    let contactId: string | null = null;
    try {
      const { data: existingContact } = await admin
        .from('contacts')
        .select('id, tags')
        .eq('account_id', accountId)
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (existingContact) {
        contactId = existingContact.id;
        const currentTags: string[] = existingContact.tags || [];
        if (!currentTags.includes('BookedClient')) {
          await admin
            .from('contacts')
            .update({ tags: [...currentTags, 'BookedClient', 'WebPageLead'] })
            .eq('id', existingContact.id);
        }
      } else {
        const { data: newContact } = await admin
          .from('contacts')
          .insert({
            account_id: accountId,
            name: name.trim(),
            phone: cleanPhone,
            tags: ['BookedClient', 'WebPageLead'],
          })
          .select('id')
          .single();

        if (newContact) contactId = newContact.id;
      }
    } catch (contactErr) {
      console.warn('[business-pages/book] Failed to upsert contact:', contactErr);
    }

    // 3. Create booking record in business_page_bookings
    const { data: booking, error: bookingErr } = await admin
      .from('business_page_bookings')
      .insert({
        page_id: pageId,
        account_id: accountId,
        contact_id: contactId,
        name: name.trim(),
        phone: cleanPhone,
        booking_date: bookingDate,
        time_slot: timeSlot,
        item_id: itemId || null,
        item_title: itemTitle || null,
        notes: notes?.trim() || null,
        status: 'confirmed',
        whatsapp_notification_status: 'pending',
      })
      .select()
      .single();

    if (bookingErr) {
      console.error('[business-pages/book] Error saving booking:', bookingErr);
      return NextResponse.json({ error: 'Could not record booking.' }, { status: 500 });
    }

    // 4. Increment lead count on the business page
    if (page) {
      void admin
        .from('business_pages')
        .update({ lead_count: (page.lead_count || 0) + 1 })
        .eq('id', pageId);
    }

    // 5. Send dual-mode WhatsApp confirmation / reminder to customer
    // Format variables for template:
    // Hi {{1}}, this is a friendly reminder of your upcoming appointment with {{2}} scheduled on {{3}} at {{4}}. Please let us know if you need to reschedule.
    let notificationSent = false;
    let whatsappMessageId: string | null = null;

    try {
      // Check if client has Official Meta Cloud API configured
      const { data: metaConfig } = await admin
        .from('whatsapp_config')
        .select('*')
        .eq('account_id', accountId)
        .maybeSingle();

      if (metaConfig?.access_token && metaConfig?.phone_number_id) {
        const token = decrypt(metaConfig.access_token);
        const recipientPhone = cleanPhone.replace(/^\+/, '');

        // Dispatch official Meta template appointment_reminder_notice
        const metaRes = await sendTemplateMessage({
          phoneNumberId: metaConfig.phone_number_id,
          accessToken: token,
          to: recipientPhone,
          templateName: 'appointment_reminder_notice',
          language: 'en_US',
          params: [name.trim(), businessTitle, bookingDate, timeSlot],
        });

        if (metaRes?.messageId) {
          notificationSent = true;
          whatsappMessageId = metaRes.messageId;
        }
      }
    } catch (metaErr) {
      console.warn('[business-pages/book] Meta API dispatch error:', metaErr);
    }

    // If Meta was not configured or failed, check for Instant Phone QR (Evolution Gateway)
    if (!notificationSent) {
      try {
        const evoInstance = `acc_${accountId.slice(0, 8)}`;
        const state = await evolution.getConnectionState(evoInstance).catch(() => null);

        if (state?.instance?.state === 'open') {
          const reminderText = `Hi ${name.trim()}! Your appointment with ${businessTitle} has been confirmed for ${bookingDate} at ${timeSlot}.${
            itemTitle ? `\nService: ${itemTitle}` : ''
          }\n\nPlease let us know if you have any questions or need to reschedule.`;

          const evoRes = await evolution.sendText(
            evoInstance,
            cleanPhone.replace(/[^0-9]/g, ''),
            reminderText
          );

          if (evoRes?.key?.id) {
            notificationSent = true;
            whatsappMessageId = evoRes.key.id;
          }
        }
      } catch (evoErr) {
        console.warn('[business-pages/book] Evolution QR dispatch error:', evoErr);
      }
    }

    // Update notification status on booking row
    if (notificationSent) {
      await admin
        .from('business_page_bookings')
        .update({
          whatsapp_notification_status: 'sent',
          whatsapp_message_id: whatsappMessageId,
        })
        .eq('id', booking.id);
    }

    // Build fallback deep-link if client has neither gateway active
    const cleanBusinessWa = (page?.whatsapp_number || '').replace(/[^0-9]/g, '');
    const clientWaDeepLink = cleanBusinessWa
      ? `https://wa.me/${cleanBusinessWa}?text=${encodeURIComponent(
          `Hi ${businessTitle}, I just booked an appointment for ${name.trim()} on ${bookingDate} at ${timeSlot}.`
        )}`
      : null;

    return NextResponse.json({
      success: true,
      booking,
      notificationSent,
      clientWaDeepLink,
    });
  } catch (err: any) {
    console.error('[business-pages/book] Server error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
