import { NextResponse } from 'next/server'
import { requireRole, toErrorResponse } from '@/lib/auth/account'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'
import { loadAiConfig } from '@/lib/ai/config'
import { generateDossier } from '@/lib/ai/dossier'
import { logAiUsage } from '@/lib/ai/usage'
import { AiError } from '@/lib/ai/types'
import { getT } from '@/lib/i18n/translate'

const t = getT('Api')

/**
 * GET /api/contacts/[id]/dossier
 * Returns the current cached AI dossier for the contact.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase, accountId } = await requireRole('agent')
    const { id: contactId } = await params

    const { data: contact, error } = await supabase
      .from('contacts')
      .select('id, name, phone, company, ai_dossier, ai_dossier_updated_at')
      .eq('id', contactId)
      .eq('account_id', accountId)
      .maybeSingle()

    if (error) {
      console.error('[contacts/dossier] lookup error:', error)
      return NextResponse.json(
        { error: 'Failed to lookup contact' },
        { status: 500 },
      )
    }

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
    }

    return NextResponse.json({
      dossier: contact.ai_dossier || null,
      updated_at: contact.ai_dossier_updated_at || null,
    })
  } catch (err) {
    return toErrorResponse(err)
  }
}

/**
 * POST /api/contacts/[id]/dossier
 * Regenerates the Garry Tan gbrain AI memory dossier using the workspace BYO AI key,
 * saves it to `contacts.ai_dossier`, and returns the markdown result.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase, accountId, userId } = await requireRole('agent')
    const { id: contactId } = await params

    const userLimit = checkRateLimit(`ai-dossier:${userId}`, RATE_LIMITS.aiDossier)
    if (!userLimit.success) return rateLimitResponse(userLimit)

    const accountLimit = checkRateLimit(
      `ai-dossier-acct:${accountId}`,
      RATE_LIMITS.aiDossierAccount,
    )
    if (!accountLimit.success) return rateLimitResponse(accountLimit)

    // 1. Fetch contact data
    const { data: contact, error: contactErr } = await supabase
      .from('contacts')
      .select('*, tags(id, name, color)')
      .eq('id', contactId)
      .eq('account_id', accountId)
      .maybeSingle()

    if (contactErr || !contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 },
      )
    }

    // 2. Fetch recent deals
    const { data: deals } = await supabase
      .from('deals')
      .select('*')
      .eq('contact_id', contactId)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(10)

    // 3. Fetch CRM notes
    const { data: notes } = await supabase
      .from('contact_notes')
      .select('content, created_at')
      .eq('contact_id', contactId)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .limit(15)

    // 4. Fetch recent conversation messages
    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('contact_id', contactId)
      .eq('account_id', accountId)
      .maybeSingle()

    let recentMessages: Array<{
      sender_type: 'customer' | 'agent' | 'bot'
      content_text: string | null
      created_at: string
    }> = []

    if (conv?.id) {
      const { data: msgs } = await supabase
        .from('messages')
        .select('sender_type, content_text, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(30)

      if (msgs && msgs.length > 0) {
        recentMessages = [...msgs].reverse() as typeof recentMessages
      }
    }

    // 5. Load workspace AI config
    const config = await loadAiConfig(supabase, accountId).catch((err) => {
      console.error('[contacts/dossier] loadAiConfig error:', err)
      throw new AiError(t('ai.storedKeyUndecryptable'), {
        code: 'key_decrypt_failed',
        status: 400,
      })
    })

    if (!config) {
      return NextResponse.json(
        {
          error: t('ai.notConfigured'),
          code: 'ai_not_configured',
        },
        { status: 400 },
      )
    }

    // 6. Generate the dossier
    const result = await generateDossier(config, {
      contact: {
        ...contact,
        notes: notes || [],
        deals: deals || [],
      },
      recentMessages,
    })

    const updatedAt = new Date().toISOString()
    const dossierMarkdown = result.text.trim()

    // 7. Update contact record
    const { error: updateErr } = await supabase
      .from('contacts')
      .update({
        ai_dossier: dossierMarkdown,
        ai_dossier_updated_at: updatedAt,
      })
      .eq('id', contactId)
      .eq('account_id', accountId)

    if (updateErr) {
      console.error('[contacts/dossier] update error:', updateErr)
    }

    // 8. Log AI token usage
    void logAiUsage(supabase, {
      accountId,
      conversationId: conv?.id || null,
      mode: 'dossier',
      provider: config.provider,
      model: config.model,
      usage: result.usage,
    })

    return NextResponse.json({
      ok: true,
      dossier: dossierMarkdown,
      updated_at: updatedAt,
    })
  } catch (err) {
    console.error('[contacts/dossier] error:', err)
    return toErrorResponse(err)
  }
}
