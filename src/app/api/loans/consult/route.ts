import { NextRequest, NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getAdminClient } from "@/lib/gdrive/offload";

export const dynamic = "force-dynamic";

const OMNIROUTE_URL = process.env.OMNIROUTE_URL || "https://omniroute.dfydude.online/v1";
const OMNIROUTE_KEY = process.env.OMNIROUTE_API_KEY || "sk-51ede91f935f3396-6c4dcc-42124cc3";

/**
 * POST /api/loans/consult
 * Conversational AI Loan Underwriter:
 * Analyzes turnover, property ownership, CIBIL nuances, and recommends the best loan route.
 */
export async function POST(req: NextRequest) {
  try {
    const { supabase, accountId, userId } = await getCurrentAccount();
    const body = await req.json();
    const { messages, applicantProfile } = body;

    const systemPrompt = `You are the Senior Underwriting Officer at UniCRM Capital (India's leading MSME & Business Lending Network).
Your mission is to understand the borrower's exact business needs and find viable financing angles even if they face traditional banking hurdles (like low CIBIL score, new business, or lack of 3-year ITR).

Key Lending Paths to Consider in India:
1. Unsecured Business Loan: Best if monthly GST/bank turnover > ₹2L, running 1+ year.
2. Loan Against Property (LAP) / Commercial Mortgage: Best if applicant or family owns residential/commercial property. Works even with low CIBIL (550-650).
3. MSME Machinery / Equipment Finance: Subsidized CGTMSE / SIDBI schemes.
4. Home Loan & Balance Transfer: For personal or business owners seeking lower EMIs.
5. Revenue-Based / Private Funding: For D2C brands, tech startups, or rapid-growth retailers with high online/UPI sales.

Guidelines:
- Tone: Extremely helpful, respectful, clear, and reassuring Indian B2B financial advisor.
- Do NOT use heavy banking jargon. Explain things in simple layman terms.
- Ask targeted follow-up questions one at a time:
  - If CIBIL is low, ask: "Do you or anyone in your immediate family own residential or commercial property in your city?"
  - If ITR is short, ask: "What is your average monthly bank credit or GST sales in the last 6 months?"
- Keep responses to 2 to 3 concise, friendly sentences.`;

    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []).map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
    ];

    const aiRes = await fetch(`${OMNIROUTE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OMNIROUTE_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({
        model: "auto/best-chat",
        messages: formattedMessages,
        temperature: 0.6,
      }),
    });

    if (!aiRes.ok) {
      return NextResponse.json({
        reply: "Thank you for sharing. Could you let me know if you or your family own any residential or commercial property, or what your average monthly business turnover is? That helps us find the best NBFC partners for you.",
      });
    }

    const data = await aiRes.json();
    const replyText = data?.choices?.[0]?.message?.content?.trim() || "Thank you for providing the details. Let me structure the best lending route for you.";

    return NextResponse.json({ success: true, reply: replyText });
  } catch (err: any) {
    return NextResponse.json({
      reply: "We received your loan inquiry. Could you share your expected loan amount and monthly business turnover so we can connect you with the right bank partner?",
    });
  }
}
