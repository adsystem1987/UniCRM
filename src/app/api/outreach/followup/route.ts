import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/gdrive/offload";
import { sendEmail } from "@/lib/email/sender";

export const dynamic = "force-dynamic";

const OMNIROUTE_URL = process.env.OMNIROUTE_URL || "https://omniroute.dfydude.online/v1";
const OMNIROUTE_KEY = process.env.OMNIROUTE_API_KEY || "sk-51ede91f935f3396-6c4dcc-42124cc3";

/**
 * AI Nudge Drafter using OmniRoute AI Gateway
 */
async function generateAiNudge(params: {
  businessName: string;
  contactName?: string;
  category?: string;
  city?: string;
  opened: boolean;
  followupCount: number;
}): Promise<{ subject: string; message: string }> {
  try {
    const prompt = `You are an executive assistant at UniCRM (a Done-For-You AI & WhatsApp CRM for service businesses).
Write a brief, polite, high-converting follow-up email to ${params.contactName || "the business owner"} of "${params.businessName}" (${params.category || "business"} in ${params.city || "India"}).

Context:
- We recently prepared a free, dedicated UniCRM workspace with their public business profile.
- Recipient status: ${params.opened ? "They opened our initial email but have not yet claimed their workspace." : "They haven't opened or claimed yet."}
- Follow-up round: #${params.followupCount + 1}.

Requirements:
- Tone: Warm, respectful, non-pushy, strictly B2B professional.
- Length: 2 to 3 short sentences.
- Mention how having automated WhatsApp lead capture and a free verified profile helps their ${params.category || "business"} get more local clients.
- Return ONLY JSON in the following exact format without markdown:
{"subject": "Short catchy subject line", "message": "The 2-3 sentence email body"}`;

    const res = await fetch(`${OMNIROUTE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OMNIROUTE_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({
        model: "auto/best-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const rawText = data?.choices?.[0]?.message?.content?.trim() || "";
      // Strip json code fences if any
      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.subject && parsed.message) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[Agentic Followup] OmniRoute drafting fallback triggered:", err);
  }

  // Graceful deterministic fallback
  const greeting = params.contactName ? `Hi ${params.contactName},` : "Hello,";
  return {
    subject: `Quick follow-up regarding ${params.businessName}'s CRM workspace`,
    message: `${greeting}\n\nJust checking in to ensure you had a chance to view the free UniCRM workspace and micro-page prepared for ${params.businessName}.\n\nIt is already configured to route WhatsApp inquiries and track customer leads with zero setup required.`,
  };
}

/**
 * GET /api/outreach/followup/candidates
 * Fetches all leads ready for agentic follow-up review:
 * - Status: 'pending' (not claimed, not opted-out, not bounced)
 * - Sent at least 48 hours ago
 * - Follow-up count < 2
 */
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminClient();
    const cutoffDate = new Date(Date.now() - 48 * 3600 * 1000).toISOString();

    const { data: candidates, error } = await admin
      .from("workspace_claim_tokens")
      .select("id, token, email, business_name, contact_name, category, city, page_slug, status, created_at, opened_at, followup_count, last_followup_at, ai_nudge_draft")
      .eq("status", "pending")
      .lt("created_at", cutoffDate)
      .lt("followup_count", 2)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // For any candidate without an AI draft, generate one now
    const results = [];
    for (const item of candidates || []) {
      let draft = item.ai_nudge_draft ? JSON.parse(item.ai_nudge_draft) : null;
      if (!draft) {
        draft = await generateAiNudge({
          businessName: item.business_name,
          contactName: item.contact_name,
          category: item.category,
          city: item.city,
          opened: !!item.opened_at,
          followupCount: item.followup_count || 0,
        });

        // Cache the draft
        await admin
          .from("workspace_claim_tokens")
          .update({ ai_nudge_draft: JSON.stringify(draft) })
          .eq("id", item.id);
      }

      results.push({
        ...item,
        draftSubject: draft.subject,
        draftMessage: draft.message,
      });
    }

    return NextResponse.json({ success: true, candidates: results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/outreach/followup/send
 * Dispatches an approved follow-up email via AWS SES.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tokenId, subject, message, isTestMode } = body;

    if (!tokenId) {
      return NextResponse.json({ error: "tokenId is required" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: lead, error } = await admin
      .from("workspace_claim_tokens")
      .select("*")
      .eq("id", tokenId)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dfyunicrm.com";
    const claimUrl = `${siteUrl}/claim?token=${lead.token}`;
    const optOutUrl = `${siteUrl}/opt-out?token=${lead.token}`;

    const recipient = isTestMode ? "brosir2019@gmail.com" : lead.email;
    const finalSubject = isTestMode ? `[Test Follow-Up] ${subject}` : subject;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 24px; margin: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
    <tr>
      <td style="padding: 28px 32px;">
        <h2 style="font-size: 18px; color: #0f172a; margin-top: 0; margin-bottom: 16px;">${lead.business_name} • Free Workspace Follow-Up</h2>
        <p style="font-size: 14px; color: #334155; line-height: 24px; white-space: pre-wrap; margin-bottom: 24px;">${message}</p>
        
        <div style="text-align: center; margin: 28px 0;">
          <a href="${claimUrl}" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
            ⚡ Claim ${lead.business_name} Workspace
          </a>
        </div>

        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 28px;">
          Not interested? <a href="${optOutUrl}" style="color: #ef4444; text-decoration: underline;">Opt-out & Delete Record</a>
        </p>
      </td>
    </tr>
  </table>
  <img src="https://dfyunicrm.com/api/email/track/open?token=${encodeURIComponent(lead.token)}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;opacity:0;" />
</body>
</html>`;

    const sendRes = await sendEmail({
      to: recipient,
      subject: finalSubject,
      html: emailHtml,
      text: `${message}\n\nClaim: ${claimUrl}\nOpt-out: ${optOutUrl}`,
    });

    if (!sendRes.success) {
      return NextResponse.json({ error: sendRes.error }, { status: 500 });
    }

    if (!isTestMode) {
      await admin
        .from("workspace_claim_tokens")
        .update({
          followup_count: (lead.followup_count || 0) + 1,
          last_followup_at: new Date().toISOString(),
          ai_nudge_draft: null, // Clear cached draft
        })
        .eq("id", lead.id);
    }

    return NextResponse.json({
      success: true,
      message: `Follow-up sent successfully to ${recipient}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
