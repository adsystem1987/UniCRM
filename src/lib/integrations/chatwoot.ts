import type { SupabaseClient } from '@supabase/supabase-js';

export interface ChatwootConfig {
  baseUrl: string;
  accountId: string;
  inboxId: string;
  apiAccessToken: string;
  enabled: boolean;
  syncInbound: boolean;
  syncOutbound: boolean;
}

/**
 * Storage key or table lookup for Chatwoot configuration
 */
export async function getChatwootConfig(
  db: SupabaseClient,
  crmAccountId: string
): Promise<ChatwootConfig | null> {
  try {
    const { data: config } = await db
      .from('chatwoot_configs')
      .select('*')
      .eq('account_id', crmAccountId)
      .maybeSingle();

    if (config && config.base_url && config.api_token) {
      return {
        baseUrl: config.base_url.replace(/\/$/, ''),
        accountId: String(config.chatwoot_account_id),
        inboxId: String(config.chatwoot_inbox_id),
        apiAccessToken: config.api_token,
        enabled: Boolean(config.is_active),
        syncInbound: config.sync_inbound ?? true,
        syncOutbound: config.sync_outbound ?? true,
      };
    }
  } catch {
    // chatwoot_configs table might not exist yet; fall back gracefully
  }
  return null;
}

/**
 * Test connectivity to Chatwoot
 */
export async function testChatwootConnection(config: {
  baseUrl: string;
  accountId: string;
  inboxId: string;
  apiAccessToken: string;
}): Promise<{ ok: boolean; message: string; inboxName?: string }> {
  const cleanUrl = config.baseUrl.replace(/\/$/, '');
  try {
    const res = await fetch(
      `${cleanUrl}/api/v1/accounts/${config.accountId}/inboxes/${config.inboxId}`,
      {
        headers: {
          api_access_token: config.apiAccessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const err = await res.text().catch(() => '');
      return {
        ok: false,
        message: `HTTP ${res.status}: ${err.slice(0, 150) || res.statusText}`,
      };
    }

    const data = await res.json();
    return {
      ok: true,
      message: 'Connected to Chatwoot successfully!',
      inboxName: data.name || data.channel_type || 'WhatsApp Inbox',
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Failed to reach Chatwoot host',
    };
  }
}

/**
 * Mirrors an inbound customer WhatsApp message to Chatwoot
 */
export async function mirrorInboundToChatwoot(
  config: ChatwootConfig,
  params: {
    phone: string;
    name?: string;
    messageText: string;
    mediaUrl?: string | null;
  }
): Promise<{ success: boolean; chatwootConversationId?: number }> {
  if (!config.enabled || !config.syncInbound) return { success: false };

  const cleanUrl = config.baseUrl.replace(/\/$/, '');
  const headers = {
    api_access_token: config.apiAccessToken,
    'Content-Type': 'application/json',
  };

  try {
    // 1. Search or create contact in Chatwoot
    let contactId: number | null = null;

    const searchRes = await fetch(
      `${cleanUrl}/api/v1/accounts/${config.accountId}/contacts/search?q=${encodeURIComponent(params.phone)}`,
      { headers }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.payload && searchData.payload.length > 0) {
        contactId = searchData.payload[0].id;
      }
    }

    if (!contactId) {
      const createContactRes = await fetch(
        `${cleanUrl}/api/v1/accounts/${config.accountId}/contacts`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            inbox_id: config.inboxId,
            name: params.name || params.phone,
            phone_number: params.phone.startsWith('+') ? params.phone : `+${params.phone}`,
          }),
        }
      );

      if (createContactRes.ok) {
        const contactData = await createContactRes.json();
        contactId = contactData.payload?.contact?.id || contactData.id;
      }
    }

    if (!contactId) {
      console.warn('[chatwoot] Could not resolve contact in Chatwoot');
      return { success: false };
    }

    // 2. Find or create conversation in Chatwoot
    let conversationId: number | null = null;
    const convSearchRes = await fetch(
      `${cleanUrl}/api/v1/accounts/${config.accountId}/contacts/${contactId}/conversations`,
      { headers }
    );

    if (convSearchRes.ok) {
      const convList = await convSearchRes.json();
      const openConv = convList.payload?.find(
        (c: { status: string; inbox_id: number | string }) =>
          c.status !== 'resolved' && String(c.inbox_id) === String(config.inboxId)
      );
      if (openConv) {
        conversationId = openConv.id;
      }
    }

    if (!conversationId) {
      const newConvRes = await fetch(
        `${cleanUrl}/api/v1/accounts/${config.accountId}/conversations`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            inbox_id: config.inboxId,
            contact_id: contactId,
            status: 'open',
          }),
        }
      );

      if (newConvRes.ok) {
        const newConvData = await newConvRes.json();
        conversationId = newConvData.id;
      }
    }

    if (!conversationId) {
      console.warn('[chatwoot] Could not open conversation in Chatwoot');
      return { success: false };
    }

    // 3. Post the customer message as incoming
    const content = params.messageText || (params.mediaUrl ? `[Attachment]: ${params.mediaUrl}` : '[Empty]');
    const postRes = await fetch(
      `${cleanUrl}/api/v1/accounts/${config.accountId}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content,
          message_type: 'incoming',
        }),
      }
    );

    return { success: postRes.ok, chatwootConversationId: conversationId };
  } catch (err) {
    console.error('[chatwoot] mirrorInboundToChatwoot error:', err);
    return { success: false };
  }
}
