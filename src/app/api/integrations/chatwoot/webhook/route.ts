import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendMessageToConversation } from '@/lib/whatsapp/send-message';

// Lazy-initialized admin client for webhook delivery
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _adminClient: any = null;
function supabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _adminClient;
}

export const dynamic = 'force-dynamic';

/**
 * Inbound webhook from Chatwoot:
 * When a live agent in Chatwoot replies to a conversation,
 * Chatwoot fires a `message_created` event with `message_type: 'outgoing'`.
 * We take that message and send it to the customer on WhatsApp!
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const event = body.event;
    const messageType = body.message_type;

    // We only process outgoing messages from Chatwoot human agents
    if (event !== 'message_created' || messageType !== 'outgoing') {
      return NextResponse.json({ received: true });
    }

    const content = body.content || '';
    if (!content.trim() && (!body.attachments || body.attachments.length === 0)) {
      return NextResponse.json({ received: true });
    }

    // Extract customer phone number from Chatwoot sender metadata
    const sender = body.conversation?.meta?.sender || body.sender;
    const rawPhone = sender?.phone_number || '';
    if (!rawPhone) {
      console.warn('[chatwoot/webhook] missing sender phone number');
      return NextResponse.json({ received: true });
    }

    const cleanPhone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
    const supabase = supabaseAdmin();

    // Find contact and conversation in UniCRM
    const { data: contact } = await supabase
      .from('contacts')
      .select('id, account_id')
      .eq('phone', cleanPhone)
      .limit(1)
      .maybeSingle();

    if (!contact) {
      console.warn('[chatwoot/webhook] no matching contact for phone:', cleanPhone);
      return NextResponse.json({ received: true });
    }

    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('contact_id', contact.id)
      .eq('account_id', contact.account_id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!conv) {
      console.warn('[chatwoot/webhook] no conversation found for contact:', contact.id);
      return NextResponse.json({ received: true });
    }

    // Send through WhatsApp
    await sendMessageToConversation(supabase, contact.account_id, {
      conversationId: conv.id,
      messageType: 'text',
      contentText: content,
    });

    console.info(`[chatwoot/webhook] Successfully relayed Chatwoot agent reply to ${cleanPhone}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[chatwoot/webhook] Error handling webhook:', err);
    return NextResponse.json({ received: true });
  }
}
