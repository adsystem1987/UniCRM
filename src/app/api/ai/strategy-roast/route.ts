import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loadAiConfig } from '@/lib/ai/config';
import { generateReply } from '@/lib/ai/generate';
import { buildSystemPrompt } from '@/lib/ai/defaults';

interface RoastPerspective {
  roaster: string;
  avatar: string;
  role: string;
  critique: string;
  score: number;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: member } = await supabase
      .from('account_members')
      .select('account_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const body = await req.json();
    const { proposal, category = 'campaign' } = body;

    if (!proposal || typeof proposal !== 'string' || proposal.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please enter a strategy, offer, or campaign copy to roast (at least 10 characters).' },
        { status: 400 }
      );
    }

    const aiConfig = await loadAiConfig(supabase, member.account_id);
    if (!aiConfig || !aiConfig.isActive) {
      return NextResponse.json(
        { error: 'AI Assistant is not configured yet. Set up your AI API Key in Settings first.' },
        { status: 400 }
      );
    }

    const warRoomSystemPrompt = buildSystemPrompt({
      userPrompt: `You are the UniCRM Strategy War Room & Roast Council.
You must critically evaluate the user's business proposal, sales copy, or offer from 3 distinct legendary perspectives:

1. THE VALUE & OFFER ROASTER (Alex Hormozi style):
   - Critiques pricing, urgency, dream outcome, and risk reversal.
2. THE WHATSAPP CONVERSATIONAL ROASTER (Mobile & Attention span expert):
   - Critiques message length, tone, whether people will actually reply, or if it looks like spam.
3. THE OPERATIONAL SCALABILITY ROASTER (Systems & Capacity lens):
   - Critiques what breaks if 100 people say YES right now.

OUTPUT FORMAT REQUIREMENTS:
You MUST respond with valid JSON ONLY (no markdown outside the JSON block).
JSON structure:
{
  "summary": "One punchy sentence summarizing the main flaw or opportunity",
  "overallScore": 72,
  "council": [
    {
      "roaster": "The Offer Roaster",
      "avatar": "⚡",
      "role": "Pricing & Value Architect",
      "critique": "2-3 punchy sentences of honest roast and tactical fix",
      "score": 70
    },
    {
      "roaster": "The WhatsApp Attention Roaster",
      "avatar": "📱",
      "role": "Mobile Conversational UX",
      "critique": "2-3 punchy sentences on attention span and message readability",
      "score": 65
    },
    {
      "roaster": "The Operations Roaster",
      "avatar": "⚙️",
      "role": "Scalability & Fulfillment",
      "critique": "2-3 punchy sentences on what breaks in the business when this scales",
      "score": 80
    }
  ],
  "topActionItems": [
    "Fix #1: Specific tactical edit",
    "Fix #2: Specific tactical edit",
    "Fix #3: Specific tactical edit"
  ]
}`,
      mode: 'draft',
    });

    const aiResult = await generateReply({
      config: aiConfig,
      systemPrompt: warRoomSystemPrompt,
      messages: [
        {
          role: 'user',
          content: `Category: ${category}\nProposal to Roast:\n${proposal.trim()}`,
        },
      ],
    });

    if (!aiResult?.text) {
      return NextResponse.json({ error: 'Failed to generate critique.' }, { status: 500 });
    }

    // Parse JSON response safely
    let parsedData;
    try {
      const cleaned = aiResult.text.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    } catch {
      // Fallback structured object if model added conversational wrapper
      parsedData = {
        summary: "Your strategy has potential, but needs sharper execution to maximize conversion.",
        overallScore: 70,
        council: [
          {
            roaster: "The Strategy Roaster",
            avatar: "⚡",
            role: "Offer & Conversion",
            critique: aiResult.text.slice(0, 300),
            score: 70,
          },
        ],
        topActionItems: [
          "Shorten your pitch to under 40 words on WhatsApp.",
          "Add a clear, low-friction call-to-action question.",
          "Clarify the immediate outcome for the buyer.",
        ],
      };
    }

    return NextResponse.json({ success: true, data: parsedData });
  } catch (err: unknown) {
    console.error('[strategy-roast] error:', err);
    return NextResponse.json({ error: 'Internal server error while roasting proposal.' }, { status: 500 });
  }
}
