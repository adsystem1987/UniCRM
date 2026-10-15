import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Webhook handler for Whatomate Voice & IVR events
 * Expects events such as:
 * - call.ringing
 * - call.answered
 * - call.ended
 * - call.recording_ready
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-whatomate-signature');
    const secret = process.env.WHATOMATE_WEBHOOK_SECRET;

    if (secret && signature !== secret) {
      return NextResponse.json({ error: 'Unauthorized webhook signature' }, { status: 401 });
    }

    const payload = await req.json();
    const {
      event,
      call_id,
      from_number,
      to_number,
      direction,
      status,
      duration_seconds,
      recording_url,
      ivr_path,
      account_id,
    } = payload;

    if (!call_id) {
      return NextResponse.json({ error: 'Missing call_id' }, { status: 400 });
    }

    const supabase = await createClient();

    // Upsert call log
    const { error } = await supabase.from('call_logs').upsert(
      {
        whatomate_call_id: call_id,
        account_id: account_id,
        direction: direction || 'inbound',
        status: status || 'completed',
        from_number: from_number || '',
        to_number: to_number || '',
        duration_seconds: duration_seconds || 0,
        recording_url: recording_url || null,
        ivr_path: ivr_path || [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'whatomate_call_id' }
    );

    if (error) {
      console.error('[Whatomate Webhook] Failed to upsert call log:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
