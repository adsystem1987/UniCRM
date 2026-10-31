import type { Contact, Deal, Tag } from '@/types'
import { generateReply } from './generate'
import type { AiConfig, GenerateResult } from './types'

export interface ContactDossierContext {
  contact: Contact & {
    tags?: Tag[]
    notes?: Array<{ content: string; created_at: string }>
    deals?: Deal[]
  }
  recentMessages?: Array<{
    sender_type: 'customer' | 'agent' | 'bot'
    content_text: string | null
    created_at: string
  }>
}

/**
 * System prompt following Garry Tan's gbrain persona philosophy:
 * "A brain page should read like an intelligence dossier crossed with a therapist's notes,
 * not a LinkedIn scrape. Facts are table stakes. Texture is the value."
 */
export const GBRAIN_DOSSIER_SYSTEM_PROMPT = `You are an elite executive intelligence analyst preparing a high-density, psychologically astute briefing dossier on a customer/prospect for an account executive.

Your brief is modeled after Garry Tan's "gbrain" executive memory framework.
Guiding rule: "A brain page should read like an intelligence dossier crossed with a therapist's notes, not a LinkedIn scrape. Facts are table stakes. Texture is the value."

Analyze the provided contact history, notes, deals, and communication transcript, then produce a clean, structured Markdown dossier strictly adhering to this format:

---
title: {Contact Name or Phone}
type: customer_dossier
updated: {Current Date YYYY-MM-DD}
relationship_stage: {Lead / Qualified / Negotiating / Closed / Stalled}
sentiment: {Positive / Neutral / Skeptical / Frustrated}
---

# {Contact Name or Phone}
> **Executive Read**: 1–2 sentence sharp psychological summary. Who are they really, how do they operate, and what is the current state of our relationship?

## 1. Operating State & Context
- **Role & Scope**: Current position, company, authority level, or business context.
- **Budget / Commercial Scale**: Known deals, budget scope, or purchase volume.

## 2. What They're Building & Buying
- What are they actively trying to achieve, purchase, or solve?
- What specific features, services, or outcomes are they evaluating?

## 3. Core Motivations & Pain Points
- What keeps them up at night? What does a massive win look like for them?
- Where is their internal friction or operational bottleneck?

## 4. Communication Style & Psychological Tells
- **Tone & Cadence**: (e.g. terse, ultra-busy, polite, analytical, price-sensitive).
- **Triggers & Objections**: Patterns in what makes them hesitate, ghost, or push back.

## 5. Strategic Playbook / Next Pitch Angle
- **Recommended Angle**: The exact positioning, offer, or framing that will convert or expand them.
- **Immediate Next Step**: Concrete tactical recommendation for the next message or call.

Rules:
- Be incisive, dense, and candid. Cut all corporate fluff and generic CRM cliches.
- If information on a section is thin, synthesize the best inference from conversation tone and note what needs to be discovered.
- Never use emojis in the output.
`

export function buildDossierUserPrompt(ctx: ContactDossierContext): string {
  const { contact, recentMessages = [] } = ctx
  const lines: string[] = []

  lines.push('### Contact Facts:')
  lines.push(`Name: ${contact.name || 'Unknown'}`)
  lines.push(`Phone: ${contact.phone || 'N/A'}`)
  if (contact.email) lines.push(`Email: ${contact.email}`)
  if (contact.company) lines.push(`Company: ${contact.company}`)
  if (contact.tags && contact.tags.length > 0) {
    lines.push(`Tags: ${contact.tags.map((t) => t.name).join(', ')}`)
  }

  if (contact.deals && contact.deals.length > 0) {
    lines.push('\n### Deals:')
    for (const d of contact.deals) {
      lines.push(
        `- Deal: ${d.title} | Status: ${d.status} | Value: ${d.currency || 'USD'} ${d.value}`,
      )
    }
  }

  if (contact.notes && contact.notes.length > 0) {
    lines.push('\n### CRM Notes:')
    for (const n of contact.notes) {
      lines.push(`- [${n.created_at?.slice(0, 10) || 'Date'}]: ${n.content}`)
    }
  }

  if (recentMessages.length > 0) {
    lines.push('\n### Recent Conversation History (Oldest to Newest):')
    for (const m of recentMessages) {
      const sender = m.sender_type === 'customer' ? 'Customer' : 'Our Team'
      const text = (m.content_text || '').trim()
      if (text) {
        lines.push(`[${sender}]: ${text}`)
      }
    }
  } else {
    lines.push('\n(No conversation messages logged yet)')
  }

  return lines.join('\n')
}

export async function generateDossier(
  config: AiConfig,
  ctx: ContactDossierContext,
): Promise<GenerateResult> {
  const userPrompt = buildDossierUserPrompt(ctx)

  return generateReply({
    config,
    systemPrompt: GBRAIN_DOSSIER_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })
}
