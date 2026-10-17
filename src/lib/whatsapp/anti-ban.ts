import type { SupabaseClient } from '@supabase/supabase-js';
import { sendMessageToConversation } from '@/lib/whatsapp/send-message';

export const OPT_OUT_KEYWORDS = [
  'stop',
  'unsubscribe',
  'stopall',
  'cancel',
  'quit',
  'end',
  'remove',
  'optout',
  'opt-out',
  'dnc',
  'arret',
] as const;

export const OPT_IN_KEYWORDS = [
  'start',
  'unstop',
  'subscribe',
  'yes',
  'recommencer',
  'join',
] as const;

/**
 * Checks if incoming text is a recognized unsubscribe keyword
 */
export function isOptOutKeyword(rawText: string | null | undefined): boolean {
  if (!rawText) return false;
  const clean = rawText.trim().toLowerCase();
  return OPT_OUT_KEYWORDS.includes(clean as (typeof OPT_OUT_KEYWORDS)[number]);
}

/**
 * Checks if incoming text is a recognized resubscribe keyword
 */
export function isOptInKeyword(rawText: string | null | undefined): boolean {
  if (!rawText) return false;
  const clean = rawText.trim().toLowerCase();
  return OPT_IN_KEYWORDS.includes(clean as (typeof OPT_IN_KEYWORDS)[number]);
}

/**
 * Checks if a contact has been tagged with DNC or opted-out
 */
export async function isContactOptedOut(
  db: SupabaseClient,
  accountId: string,
  contactId: string
): Promise<boolean> {
  try {
    const { data: optTags } = await db
      .from('tags')
      .select('id')
      .eq('account_id', accountId)
      .in('name', ['DNC', 'opted_out', 'opted-out', 'unsubscribed']);

    if (!optTags || optTags.length === 0) return false;
    const tagIds = optTags.map((t) => t.id);

    const { data: matched } = await db
      .from('contact_tags')
      .select('contact_id')
      .eq('contact_id', contactId)
      .in('tag_id', tagIds)
      .limit(1);

    return Boolean(matched && matched.length > 0);
  } catch (err) {
    console.error('[anti-ban] isContactOptedOut error:', err);
    return false;
  }
}

/**
 * Handles incoming STOP or START keywords:
 * - Applies/removes 'DNC' tag
 * - Returns automated compliant confirmation message
 */
export async function handleOptOutInbound(
  db: SupabaseClient,
  params: {
    accountId: string;
    contactId: string;
    phone: string;
    text: string;
    conversationId?: string;
  }
): Promise<{ handled: boolean; action?: 'opt_out' | 'opt_in' }> {
  const { accountId, contactId, phone, text, conversationId } = params;

  if (isOptOutKeyword(text)) {
    try {
      // Find or create 'DNC' (Do Not Contact) tag
      let { data: tag } = await db
        .from('tags')
        .select('id')
        .eq('account_id', accountId)
        .eq('name', 'DNC')
        .maybeSingle();

      if (!tag) {
        const { data: newTag } = await db
          .from('tags')
          .insert({
            account_id: accountId,
            name: 'DNC',
            color: '#ef4444',
          })
          .select('id')
          .maybeSingle();
        tag = newTag;
      }

      if (tag) {
        await db.from('contact_tags').upsert(
          {
            contact_id: contactId,
            tag_id: tag.id,
          },
          { onConflict: 'contact_id,tag_id' }
        );
      }

      console.info(`[anti-ban] Contact ${contactId} (${phone}) opted out via STOP keyword.`);

      // Send standard compliance confirmation if conversation is available
      if (conversationId) {
        const optOutMsg =
          'You have successfully unsubscribed from automated messages. You will not receive any further broadcasts. Reply START to resubscribe at any time.';

        try {
          await sendMessageToConversation(db, accountId, {
            conversationId,
            messageType: 'text',
            contentText: optOutMsg,
          });
        } catch (sendErr) {
          console.warn('[anti-ban] Could not send opt-out confirmation:', sendErr);
        }
      }

      return { handled: true, action: 'opt_out' };
    } catch (err) {
      console.error('[anti-ban] Error handling opt-out:', err);
      return { handled: true, action: 'opt_out' };
    }
  }

  if (isOptInKeyword(text)) {
    try {
      const { data: optTags } = await db
        .from('tags')
        .select('id')
        .eq('account_id', accountId)
        .in('name', ['DNC', 'opted_out', 'opted-out', 'unsubscribed']);

      if (optTags && optTags.length > 0) {
        const tagIds = optTags.map((t) => t.id);
        await db
          .from('contact_tags')
          .delete()
          .eq('contact_id', contactId)
          .in('tag_id', tagIds);
      }

      console.info(`[anti-ban] Contact ${contactId} (${phone}) resubscribed via START keyword.`);

      if (conversationId) {
        const optInMsg =
          'You have been resubscribed to messages. Reply STOP at any time to opt out.';

        try {
          await sendMessageToConversation(db, accountId, {
            conversationId,
            messageType: 'text',
            contentText: optInMsg,
          });
        } catch (sendErr) {
          console.warn('[anti-ban] Could not send opt-in confirmation:', sendErr);
        }
      }

      return { handled: true, action: 'opt_in' };
    } catch (err) {
      console.error('[anti-ban] Error handling opt-in:', err);
      return { handled: true, action: 'opt_in' };
    }
  }

  return { handled: false };
}

