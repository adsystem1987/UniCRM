import { NextResponse } from 'next/server';
import { requireRole, toErrorResponse } from '@/lib/auth/account';
import { sendTextMessage } from '@/lib/whatsapp/meta-api';
import { decrypt } from '@/lib/whatsapp/encryption';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/whatsapp/test-message
 * Allows a user in Settings > WhatsApp to send an instant ping/test message
 * to their personal phone number to verify their Meta Cloud API credentials.
 */
export async function POST(request: Request) {
  try {
    const { supabase, accountId, userId } = await requireRole('agent');

    const limit = checkRateLimit(`wa_test:${userId}`, RATE_LIMITS.send);
    if (!limit.success) {
      return rateLimitResponse(limit);
    }

    const body = await request.json().catch(() => ({}));
    const recipientPhone = String(body.recipientPhone || '').trim().replace(/[^0-9]/g, '');

    if (!recipientPhone || recipientPhone.length < 10) {
      return NextResponse.json(
        { error: 'Please provide a valid recipient phone number with country code (e.g. 919876543210).' },
        { status: 400 }
      );
    }

    // Retrieve active whatsapp_config for this account
    const { data: config, error: configError } = await supabase
      .from('whatsapp_config')
      .select('phone_number_id, access_token, status')
      .eq('account_id', accountId)
      .maybeSingle();

    if (configError || !config) {
      return NextResponse.json(
        { error: 'No WhatsApp configuration found. Please save your Meta credentials first.' },
        { status: 404 }
      );
    }

    let accessToken = '';
    try {
      accessToken = decrypt(config.access_token);
    } catch {
      return NextResponse.json(
        { error: 'WhatsApp Access Token is corrupted or unreadable. Please re-enter your token in Settings.' },
        { status: 400 }
      );
    }

    const testMessageText =
      'Hello from UniCRM! Your Meta WhatsApp Cloud API connection is active and sending successfully.';

    try {
      const metaRes = await sendTextMessage({
        phoneNumberId: config.phone_number_id,
        accessToken,
        to: recipientPhone,
        text: testMessageText,
      });

      return NextResponse.json({
        success: true,
        message: 'Test message sent successfully to your WhatsApp!',
        whatsapp_message_id: metaRes.messages?.[0]?.id,
        sent_to: recipientPhone,
      });
    } catch (metaErr: any) {
      console.error('[WhatsApp/TestMessage] Meta API call failed:', metaErr);
      const metaMsg =
        metaErr?.response?.data?.error?.message ||
        metaErr?.message ||
        'Meta API error occurred while sending test message.';
      return NextResponse.json({ error: metaMsg }, { status: 400 });
    }
  } catch (err: any) {
    console.error('[WhatsApp/TestMessage] Exception:', err);
    return toErrorResponse(err);
  }
}
