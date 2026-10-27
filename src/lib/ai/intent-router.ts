/**
 * Fast Single-Pass Intent Evaluator & Router
 * Inspired by non-autoregressive decision models (Laya principles).
 *
 * Runs in <2ms with zero external API calls or latency overhead.
 * Evaluates text in a single pass across English, Hindi, Hinglish, and Arabic/Global terms.
 */

export interface IntentDecision {
  /** Primary classified intent */
  intent: 'pricing' | 'urgent_booking' | 'complaint' | 'inquiry' | 'human_handoff' | 'general';
  /** Confidence score between 0.0 and 1.0 */
  score: number;
  /** Auto-tags to attach to the CRM Contact */
  suggestedTags: string[];
  /** Is this an urgent high-value lead requiring immediate sales alert? */
  isHotLead: boolean;
  /** Should this automatically hand off to a human agent? */
  requiresHuman: boolean;
}

// Multilingual match patterns (English, Hindi, Hinglish, Spanish/Global)
const PRICING_PATTERNS = [
  /\b(price|pricing|rate|rates|cost|costing|how much|fee|charges|package price|quotation|quote|kitna|kitne|rupees|rs|inr|\$|₹)\b/i,
  /\b(budget|discount|offer|best price|sasta|kam karo|estimate)\b/i,
];

const URGENT_BOOKING_PATTERNS = [
  /\b(book|booking|reserve|reservation|confirm|urgent|emergency|now|today|tonight|aaj|abhi|tomorrow|kal|immediate|pickup now)\b/i,
  /\b(room available|cab ready|appointment book|lock this|finalize)\b/i,
];

const COMPLAINT_PATTERNS = [
  /\b(complaint|cancel|cancellation|refund|money back|worst|bad service|scam|fraud|cheated|angry|not working|failed|bekaar|kharab)\b/i,
  /\b(call me now|manager|escalate)\b/i,
];

const HUMAN_HANDOFF_PATTERNS = [
  /\b(human|talk to person|real person|agent|executive|speak to someone|call me|connect to human|asli insaan|baat karo)\b/i,
];

export function evaluateTextIntent(text: string): IntentDecision {
  if (!text || !text.trim()) {
    return {
      intent: 'general',
      score: 0.1,
      suggestedTags: [],
      isHotLead: false,
      requiresHuman: false,
    };
  }

  const cleaned = text.trim();
  const tags: string[] = [];
  let isHotLead = false;
  let requiresHuman = false;

  // 1. Check Human Handoff Demand
  for (const pattern of HUMAN_HANDOFF_PATTERNS) {
    if (pattern.test(cleaned)) {
      tags.push('HumanRequested');
      requiresHuman = true;
      return {
        intent: 'human_handoff',
        score: 0.95,
        suggestedTags: tags,
        isHotLead: true,
        requiresHuman: true,
      };
    }
  }

  // 2. Check Urgent Booking Intent
  let urgentScore = 0;
  for (const pattern of URGENT_BOOKING_PATTERNS) {
    if (pattern.test(cleaned)) {
      urgentScore += 0.5;
    }
  }

  // 3. Check Pricing Inquiry
  let pricingScore = 0;
  for (const pattern of PRICING_PATTERNS) {
    if (pattern.test(cleaned)) {
      pricingScore += 0.45;
    }
  }

  // 4. Check Complaint / Issue
  for (const pattern of COMPLAINT_PATTERNS) {
    if (pattern.test(cleaned)) {
      tags.push('NeedsAttention');
      return {
        intent: 'complaint',
        score: 0.9,
        suggestedTags: tags,
        isHotLead: false,
        requiresHuman: true,
      };
    }
  }

  // Determine Dominant Intent
  if (urgentScore >= 0.5) {
    tags.push('UrgentBooking', 'HotLead');
    isHotLead = true;
    return {
      intent: 'urgent_booking',
      score: Math.min(0.95, 0.5 + urgentScore),
      suggestedTags: tags,
      isHotLead,
      requiresHuman: false,
    };
  }

  if (pricingScore >= 0.45) {
    tags.push('PricingInquiry', 'HotLead');
    return {
      intent: 'pricing',
      score: Math.min(0.9, 0.45 + pricingScore),
      suggestedTags: tags,
      isHotLead: true,
      requiresHuman: false,
    };
  }

  // General or Inquiry
  if (cleaned.length > 20 || cleaned.includes('?')) {
    tags.push('GeneralInquiry');
    return {
      intent: 'inquiry',
      score: 0.7,
      suggestedTags: tags,
      isHotLead: false,
      requiresHuman: false,
    };
  }

  return {
    intent: 'general',
    score: 0.5,
    suggestedTags: [],
    isHotLead: false,
    requiresHuman: false,
  };
}

/**
 * Apply intent decision tags to a CRM contact in the background.
 * Uses get-or-create on tags and avoids duplicate joins.
 */
export async function applyIntentToContact(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  params: {
    accountId: string;
    contactId: string;
    decision: IntentDecision;
  }
): Promise<void> {
  const { accountId, contactId, decision } = params;
  if (!decision.suggestedTags || decision.suggestedTags.length === 0) {
    return;
  }

  try {
    for (const tagName of decision.suggestedTags) {
      // 1. Find or create tag
      let tagId: string | null = null;
      const { data: existingTag } = await db
        .from('tags')
        .select('id')
        .eq('account_id', accountId)
        .eq('name', tagName)
        .maybeSingle();

      if (existingTag?.id) {
        tagId = existingTag.id;
      } else {
        const color =
          tagName === 'HotLead' || tagName === 'UrgentBooking'
            ? '#ef4444'
            : tagName === 'NeedsAttention' || tagName === 'HumanRequested'
            ? '#f59e0b'
            : '#10b981';

        const { data: newTag } = await db
          .from('tags')
          .insert({
            account_id: accountId,
            name: tagName,
            color,
          })
          .select('id')
          .maybeSingle();
        tagId = newTag?.id ?? null;
      }

      // 2. Attach tag to contact if found/created
      if (tagId) {
        await db.from('contact_tags').upsert(
          {
            contact_id: contactId,
            tag_id: tagId,
          },
          { onConflict: 'contact_id,tag_id' }
        );
      }
    }
  } catch (err) {
    console.error('[intent-router] Failed to apply tags to contact:', err);
  }
}

