import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/gdrive/offload';
import { decrypt } from '@/lib/whatsapp/encryption';
import { sendTemplateMessage, sendTextMessage } from '@/lib/whatsapp/meta-api';
import { evolution } from '@/lib/evolution/client';
import { createGoogleCalendarEvent, generateGoogleCalendarWebLink } from '@/lib/gdrive/calendar';

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
      bookingType = 'appointment', // 'appointment' | 'stay' | 'event'
      checkInDate,
      checkOutDate,
      guestsCount,
      totalNights,
      ticketsCount,
      totalPrice,
    } = body;

    if (!pageId || !accountId || !name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: 'Name and phone number are required.' },
        { status: 400 }
      );
    }

    // Validation per booking type
    if (bookingType === 'stay' && (!checkInDate || !checkOutDate)) {
      return NextResponse.json(
        { error: 'Check-in and check-out dates are required for stays.' },
        { status: 400 }
      );
    }

    if (bookingType === 'appointment' && (!bookingDate || !timeSlot)) {
      return NextResponse.json(
        { error: 'Booking date and time slot are required for appointments.' },
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
    // Generate ticket reference code if event booking
    let ticketReferenceCode: string | null = null;
    if (bookingType === 'event') {
      ticketReferenceCode = `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    const effectiveBookingDate = bookingType === 'stay' ? (checkInDate || bookingDate) : bookingDate;
    const effectiveTimeSlot = bookingType === 'stay' ? '12:00 PM (Check-in)' : (timeSlot || 'All Day');

    const { data: booking, error: bookingErr } = await admin
      .from('business_page_bookings')
      .insert({
        page_id: pageId,
        account_id: accountId,
        contact_id: contactId,
        name: name.trim(),
        phone: cleanPhone,
        booking_date: effectiveBookingDate,
        time_slot: effectiveTimeSlot,
        item_id: itemId || null,
        item_title: itemTitle || null,
        notes: notes?.trim() || null,
        status: 'confirmed',
        whatsapp_notification_status: 'pending',
        booking_type: bookingType,
        check_in_date: checkInDate || null,
        check_out_date: checkOutDate || null,
        guests_count: guestsCount || 1,
        total_nights: totalNights || null,
        tickets_count: ticketsCount || 1,
        ticket_reference_code: ticketReferenceCode,
        total_price: totalPrice || null,
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

    // 5. Try syncing event to business owner's Google Calendar if connected
    let calendarHtmlLink: string | null = null;
    let calendarEventId: string | null = null;

    try {
      let calSummary = `Appointment: ${name.trim()} (${businessTitle})`;
      let calDesc = `Client: ${name.trim()}\nPhone: ${cleanPhone}${itemTitle ? `\nService: ${itemTitle}` : ''}${notes ? `\nNotes: ${notes}` : ''}`;
      let startIso: string;
      let endIso: string;

      if (bookingType === 'stay' && checkInDate && checkOutDate) {
        calSummary = `Stay: ${name.trim()} (${businessTitle})`;
        calDesc = `Guest: ${name.trim()}\nPhone: ${cleanPhone}\nProperty/Room: ${itemTitle || 'Room'}\nCheck-in: ${checkInDate}\nCheck-out: ${checkOutDate}\nGuests: ${guestsCount || 1}\nNights: ${totalNights || 1}${totalPrice ? `\nTotal: ${totalPrice}` : ''}${notes ? `\nNotes: ${notes}` : ''}`;
        startIso = new Date(`${checkInDate}T12:00:00+05:30`).toISOString();
        endIso = new Date(`${checkOutDate}T11:00:00+05:30`).toISOString();
      } else {
        const [timePart, modifier] = (effectiveTimeSlot || '10:00 AM').split(' ');
        let [hours, minutes] = (timePart || '10:00').split(':').map(Number);
        if (modifier?.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (modifier?.toUpperCase() === 'AM' && hours === 12) hours = 0;

        const startDateObj = new Date(effectiveBookingDate);
        startDateObj.setHours(hours || 10, minutes || 0, 0, 0);
        const endDateObj = new Date(startDateObj.getTime() + 60 * 60 * 1000);
        startIso = startDateObj.toISOString();
        endIso = endDateObj.toISOString();

        if (bookingType === 'event') {
          calSummary = `Event RSVP: ${name.trim()} (${businessTitle})`;
          calDesc = `Attendee: ${name.trim()}\nPhone: ${cleanPhone}\nEvent: ${itemTitle || 'Event'}\nPass Code: ${ticketReferenceCode}\nTickets: ${ticketsCount || 1}${notes ? `\nNotes: ${notes}` : ''}`;
        }
      }

      const calRes = await createGoogleCalendarEvent({
        supabase: admin,
        accountId,
        event: {
          summary: calSummary,
          description: calDesc,
          startDateTime: startIso,
          endDateTime: endIso,
          timeZone: 'Asia/Kolkata',
        },
      });

      if (calRes?.htmlLink) {
        calendarHtmlLink = calRes.htmlLink;
        calendarEventId = calRes.eventId || null;
      }
    } catch (calErr) {
      console.warn('[business-pages/book] Google Calendar sync error:', calErr);
    }

    // Generate instant client-side Add to Google Calendar web link
    const clientCalendarLink = generateGoogleCalendarWebLink({
      title: bookingType === 'stay' ? `Stay at ${businessTitle}` : (bookingType === 'event' ? `Event: ${itemTitle || businessTitle}` : `Appointment with ${businessTitle}`),
      description: bookingType === 'stay' 
        ? `Stay from ${checkInDate} to ${checkOutDate} (${totalNights || 1} nights, ${guestsCount || 1} guests) - ${itemTitle || ''}`
        : (bookingType === 'event' ? `Tickets: ${ticketsCount || 1} | Pass: ${ticketReferenceCode}` : `Appointment for ${name.trim()}${itemTitle ? ` - ${itemTitle}` : ''}`),
      startDate: effectiveBookingDate,
      timeSlot: effectiveTimeSlot,
    });

    // 6. Send dual-mode WhatsApp confirmation / reminder to customer
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

        // If appointment, send template appointment_reminder_notice
        if (bookingType === 'appointment') {
          const metaRes = await sendTemplateMessage({
            phoneNumberId: metaConfig.phone_number_id,
            accessToken: token,
            to: recipientPhone,
            templateName: 'appointment_reminder_notice',
            language: 'en_US',
            params: [name.trim(), businessTitle, effectiveBookingDate, effectiveTimeSlot],
          });

          if (metaRes?.messageId) {
            notificationSent = true;
            whatsappMessageId = metaRes.messageId;
          }
        } else {
          // Custom stay or event direct WhatsApp text
          let customText = '';
          if (bookingType === 'stay') {
            customText = `✨ Hi ${name.trim()}! Your stay at *${businessTitle}* is confirmed.\n\n🏡 *Property*: ${itemTitle || 'Room / Villa'}\n📅 *Check-in*: ${checkInDate}\n🛫 *Check-out*: ${checkOutDate}\n🌙 *Nights*: ${totalNights || 1} | 👥 *Guests*: ${guestsCount || 1}${totalPrice ? `\n💳 *Total*: ${totalPrice}` : ''}\n\nWe look forward to hosting you! Reply here anytime for assistance.`;
          } else if (bookingType === 'event') {
            customText = `🎟️ Hi ${name.trim()}! Your tickets for *${itemTitle || businessTitle}* have been confirmed!\n\n🎫 *Pass Code*: ${ticketReferenceCode}\n📅 *Date*: ${effectiveBookingDate}\n⏰ *Time*: ${effectiveTimeSlot}\n👥 *Tickets*: ${ticketsCount || 1}\n\nPlease show this digital pass code upon arrival. See you there!`;
          }

          const metaRes = await sendTextMessage({
            phoneNumberId: metaConfig.phone_number_id,
            accessToken: token,
            to: recipientPhone,
            text: customText,
          });

          if (metaRes?.messageId) {
            notificationSent = true;
            whatsappMessageId = metaRes.messageId;
          }
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
          let reminderText = '';
          if (bookingType === 'stay') {
            reminderText = `✨ Hi ${name.trim()}! Your stay at *${businessTitle}* is confirmed.\n\n🏡 *Property*: ${itemTitle || 'Room / Villa'}\n📅 *Check-in*: ${checkInDate}\n🛫 *Check-out*: ${checkOutDate}\n🌙 *Nights*: ${totalNights || 1} | 👥 *Guests*: ${guestsCount || 1}${totalPrice ? `\n💳 *Total*: ${totalPrice}` : ''}\n\nWe look forward to hosting you!`;
          } else if (bookingType === 'event') {
            reminderText = `🎟️ Hi ${name.trim()}! Your tickets for *${itemTitle || businessTitle}* have been confirmed!\n\n🎫 *Pass Code*: ${ticketReferenceCode}\n📅 *Date*: ${effectiveBookingDate}\n⏰ *Time*: ${effectiveTimeSlot}\n👥 *Tickets*: ${ticketsCount || 1}\n\nPlease show this pass upon arrival!`;
          } else {
            reminderText = `Hi ${name.trim()}! Your appointment with ${businessTitle} has been confirmed for ${bookingDate} at ${timeSlot}.${
              itemTitle ? `\nService: ${itemTitle}` : ''
            }\n\nPlease let us know if you have any questions or need to reschedule.`;
          }

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

    // Update notification status & calendar links on booking row
    const updateFields: Record<string, unknown> = {};
    if (notificationSent) {
      updateFields.whatsapp_notification_status = 'sent';
      updateFields.whatsapp_message_id = whatsappMessageId;
    }
    if (calendarHtmlLink) {
      updateFields.google_calendar_html_link = calendarHtmlLink;
      updateFields.google_calendar_event_id = calendarEventId;
    }

    if (Object.keys(updateFields).length > 0) {
      await admin
        .from('business_page_bookings')
        .update(updateFields)
        .eq('id', booking.id);
    }

    // Build fallback deep-link if client has neither gateway active
    const cleanBusinessWa = (page?.whatsapp_number || '').replace(/[^0-9]/g, '');
    let deepLinkText = `Hi ${businessTitle}, I just booked an appointment for ${name.trim()} on ${effectiveBookingDate} at ${effectiveTimeSlot}.`;
    if (bookingType === 'stay') {
      deepLinkText = `Hi ${businessTitle}, I just reserved a stay for ${name.trim()} from ${checkInDate} to ${checkOutDate} (${totalNights || 1} nights, ${guestsCount || 1} guests) for ${itemTitle || 'Room'}.`;
    } else if (bookingType === 'event') {
      deepLinkText = `Hi ${businessTitle}, I just reserved ${ticketsCount || 1} ticket(s) for ${itemTitle || 'the event'}. Pass: ${ticketReferenceCode}.`;
    }

    const clientWaDeepLink = cleanBusinessWa
      ? `https://wa.me/${cleanBusinessWa}?text=${encodeURIComponent(deepLinkText)}`
      : null;

    return NextResponse.json({
      success: true,
      booking,
      notificationSent,
      clientWaDeepLink,
      clientCalendarLink,
      calendarHtmlLink,
    });
  } catch (err: any) {
    console.error('[business-pages/book] Server error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
