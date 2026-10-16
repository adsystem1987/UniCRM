import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const event = body.event || body.type;

    // We handle messages.upsert
    if (event !== 'messages.upsert' && event !== 'MESSAGES_UPSERT') {
      return NextResponse.json({ received: true });
    }

    const data = body.data;
    if (!data || !data.key) {
      return NextResponse.json({ received: true });
    }

    const remoteJid = data.key.remoteJid || '';
    // Skip status broadcasts or group messages
    if (!remoteJid || remoteJid.includes('@g.us') || remoteJid === 'status@broadcast') {
      return NextResponse.json({ received: true });
    }

    const rawPhone = remoteJid.replace('@s.whatsapp.net', '');
    const phone = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;
    const pushName = data.pushName || phone;

    // Extract message content
    const messageContent =
      data.message?.conversation ||
      data.message?.extendedTextMessage?.text ||
      data.message?.imageMessage?.caption ||
      data.message?.videoMessage?.caption ||
      (data.message?.imageMessage ? '[Image]' : null) ||
      (data.message?.audioMessage ? '[Audio]' : null) ||
      (data.message?.documentMessage ? '[Document]' : null) ||
      '[Message]';

    const isFromMe = Boolean(data.key.fromMe);
    const messageId = data.key.id || `evo_${Date.now()}`;
    const instanceName = body.instance || '';

    const supabase = supabaseAdmin();

    // Resolve account_id from instanceName (e.g. acc_dce8cbba)
    const userPrefix = instanceName.replace('acc_', '');
    let accountId: string | null = null;

    if (userPrefix) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_id, user_id')
        .filter('user_id::text', 'ilike', `${userPrefix}%`)
        .limit(1)
        .maybeSingle();

      if (profile?.account_id) {
        accountId = profile.account_id;
      }
    }

    // Fallback: if single account in DB or cannot match prefix
    if (!accountId) {
      const { data: firstAcc } = await supabase
        .from('accounts')
        .select('id')
        .limit(1)
        .maybeSingle();
      accountId = firstAcc?.id;
    }

    if (!accountId) {
      console.warn('[evolution-webhook] unable to resolve account for instance:', instanceName);
      return NextResponse.json({ received: true });
    }

    // 1. Find or create Contact
    let { data: contact } = await supabase
      .from('contacts')
      .select('id, name')
      .eq('account_id', accountId)
      .eq('phone', phone)
      .maybeSingle();

    if (!contact) {
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          account_id: accountId,
          name: pushName,
          phone: phone,
          status: 'lead',
          source: 'whatsapp',
        })
        .select('id, name')
        .single();

      if (contactError) {
        console.error('[evolution-webhook] error creating contact:', contactError);
      }
      contact = newContact;
    }

    if (!contact) {
      return NextResponse.json({ received: true });
    }

    // 2. Find or create Conversation
    let { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('account_id', accountId)
      .eq('contact_id', contact.id)
      .maybeSingle();

    if (!conv) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          account_id: accountId,
          contact_id: contact.id,
          status: 'open',
          channel: 'whatsapp',
          last_message_text: messageContent,
          last_message_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (convError) {
        console.error('[evolution-webhook] error creating conversation:', convError);
      }
      conv = newConv;
    }

    if (!conv) {
      return NextResponse.json({ received: true });
    }

    // 3. Prevent duplicate messages by message_id
    const { data: existingMsg } = await supabase
      .from('messages')
      .select('id')
      .eq('message_id', messageId)
      .maybeSingle();

    if (!existingMsg) {
      await supabase.from('messages').insert({
        conversation_id: conv.id,
        sender_type: isFromMe ? 'agent' : 'customer',
        content_type: 'text',
        content_text: messageContent,
        message_id: messageId,
        status: isFromMe ? 'sent' : 'delivered',
      });

      await supabase
        .from('conversations')
        .update({
          last_message_text: messageContent,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conv.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[evolution-webhook] error:', err);
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
