import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminClient } from "@/lib/gdrive/offload";
import { sendEmail } from "@/lib/email/sender";
import { renderWorkspaceInviteEmailHtml } from "@/lib/email/templates/workspace-invite";

export const dynamic = "force-dynamic";

interface InviteRequestBody {
  businessName: string;
  contactName?: string;
  email: string;
  phone?: string;
  category?: string;
  city?: string;
  slug?: string;
  isTest?: boolean;
}

/**
 * POST /api/integrations/profiles/invite
 * Ingestion point for OpenClaw CNS or automated lead generation scripts.
 * 1. Verifies anti-spam suppression list.
 * 2. Pre-creates or reserves the business micro-page.
 * 3. Generates a secure single-use claim token.
 * 4. Dispatches the claim invitation email via AWS SES.
 * If isTest === true (or email contains test), sends a test copy to TEST_REVIEW_EMAIL (brosir2019@gmail.com) with [Test] in subject.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretKey = process.env.OPENCLAW_API_SECRET || process.env.CRON_SECRET || "dfy-openclaw-secret-key-2026";

    // Simple Bearer token check for OpenClaw CNS / AWS agent
    if (authHeader && authHeader.replace(/^Bearer\s+/i, "") !== secretKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as InviteRequestBody;
    const { businessName, contactName, email, phone, category = "loan_provider", city, slug: customSlug, isTest } = body;

    if (!businessName || !email) {
      return NextResponse.json(
        { error: "businessName and email are required fields." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const isTestMode = Boolean(isTest || cleanEmail.includes("test") || process.env.OUTREACH_TEST_MODE === "true");
    const testReviewEmail = process.env.TEST_REVIEW_EMAIL || "brosir2019@gmail.com";
    const recipientEmail = isTestMode ? testReviewEmail : cleanEmail;
    const emailSubject = isTestMode
      ? `[Test] Invitation to Claim your DFY UniCRM Workspace — ${businessName}`
      : `Invitation to Claim your DFY UniCRM Workspace — ${businessName}`;

    const admin = getAdminClient();

    // 1. Anti-Spam Check: Verify if email is in the suppression list
    const { data: suppressed } = await admin
      .from("email_suppression_list")
      .select("email, reason")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (suppressed) {
      console.log(`[ProfileInvite] Skipped ${cleanEmail} - Present in suppression list (${suppressed.reason})`);
      return NextResponse.json({
        skipped: true,
        reason: `Email is permanently suppressed (${suppressed.reason})`,
      });
    }

    // 2. Generate slug and URLs
    const baseSlug = (customSlug || businessName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const pageSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dfyunicrm.com";
    const pageUrl = `${siteUrl}/p/${pageSlug}`;

    // 3. Generate secure claim token
    const token = crypto.randomBytes(24).toString("hex");

    // Store claim token in database
    const { error: tokenErr } = await admin.from("workspace_claim_tokens").insert({
      token,
      email: cleanEmail,
      business_name: businessName,
      contact_name: contactName || null,
      phone: phone || null,
      category,
      city: city || null,
      page_slug: pageSlug,
      status: "pending",
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (tokenErr) {
      console.error("[ProfileInvite] Database token insert error:", tokenErr);
      return NextResponse.json({ error: "Failed to create claim record" }, { status: 500 });
    }

    const claimUrl = `${siteUrl}/claim?token=${token}`;
    const optOutUrl = `${siteUrl}/opt-out?token=${token}`;

    // 4. Render and dispatch transactional invitation email via AWS SES
    const html = renderWorkspaceInviteEmailHtml({
      businessName,
      contactName,
      category,
      city,
      pageUrl,
      claimUrl,
      optOutUrl,
      token,
    });

    const emailRes = await sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      html,
      text: `${isTestMode ? "[TEST EMAIL REVIEW]\nIntended Recipient: " + cleanEmail + "\n\n" : ""}Hi ${contactName || "there"},\n\nWe have set up a pre-configured 100% free UniCRM workspace for ${businessName}.\n\nPublic page: ${pageUrl}\n\nClaim your free workspace: ${claimUrl}\n\nTo delete your profile and opt-out: ${optOutUrl}\n\nBest regards,\nUniCRM Team`,
      from: process.env.EMAIL_FROM_ADDRESS || "UniCRM <hello@outreach.dfydude.online>",
      replyTo: process.env.EMAIL_REPLY_TO || "help@dfyunicrm.com",
    });

    return NextResponse.json({
      success: true,
      emailSent: emailRes.success,
      provider: emailRes.provider,
      isTest: isTestMode,
      sentTo: recipientEmail,
      intendedRecipient: cleanEmail,
      pageUrl,
      claimUrl,
      optOutUrl,
    });
  } catch (error: any) {
    console.error("[ProfileInvite] Unexpected error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
