import { NextRequest, NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getAdminClient } from "@/lib/gdrive/offload";
import { evolution } from "@/lib/evolution/client";
import { timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";

/**
 * Validates cron authorization from shared secret
 */
function isCronAuthorized(req: Request): boolean {
  const expected = process.env.AUTOMATION_CRON_SECRET || process.env.CRON_SECRET || "unicrm-cron-secret-2026";
  const headerSecret = req.headers.get("x-cron-secret");
  const authHeader = req.headers.get("authorization");
  const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const supplied = headerSecret || bearerSecret || "";

  if (!supplied) return false;
  const suppliedBuf = Buffer.from(supplied);
  const expectedBuf = Buffer.from(expected);
  if (suppliedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(suppliedBuf, expectedBuf);
}

/**
 * GET /api/loans/followup
 * Automated Inactivity Background Trigger:
 * Periodically invoked via cron (or background worker).
 * Finds loan inquiries that have been inactive for > 15 minutes, where the borrower
 * has not completed application or where no follow-up was sent yet.
 */
export async function GET(req: NextRequest) {
  try {
    // Check cron authorization or user role
    const isCron = isCronAuthorized(req);
    let authAccountId: string | null = null;

    if (!isCron) {
      try {
        const { accountId } = await getCurrentAccount();
        authAccountId = accountId;
      } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const adminSupabase = getAdminClient();
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Find conversations created/active between 15 mins and 24 hours ago
    let query = adminSupabase
      .from("conversations")
      .select(`
        id,
        account_id,
        status,
        last_message_at,
        last_message_text,
        contact:contacts (
          id,
          name,
          phone
        )
      `)
      .eq("status", "open")
      .lte("last_message_at", fifteenMinutesAgo)
      .gte("last_message_at", twentyFourHoursAgo)
      .order("last_message_at", { ascending: false })
      .limit(20);

    if (authAccountId) {
      query = query.eq("account_id", authAccountId);
    }

    const { data: inactiveConversations, error: convErr } = await query;
    if (convErr) {
      console.error("[loans/followup] error fetching inactive conversations:", convErr);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dfyunicrm.com";
    const processed: any[] = [];

    for (const conv of inactiveConversations || []) {
      const contact = (conv as any).contact;
      if (!contact?.phone || contact.phone.startsWith("guest-")) continue;

      // Check if this conversation is associated with a loan inquiry
      const { data: deal } = await adminSupabase
        .from("deals")
        .select("id, title, value")
        .eq("account_id", conv.account_id)
        .eq("contact_id", contact.id)
        .ilike("title", "%LOAN%")
        .limit(1)
        .maybeSingle();

      const { data: loanApp } = await adminSupabase
        .from("loan_applications")
        .select("id, amount_requested, status")
        .eq("account_id", conv.account_id)
        .eq("phone", contact.phone)
        .limit(1)
        .maybeSingle();

      if (!deal && !loanApp) continue;

      // Check if we already sent a drop-off recovery follow-up in the last 24h
      const { data: previousFollowup } = await adminSupabase
        .from("messages")
        .select("id")
        .eq("conversation_id", conv.id)
        .ilike("content_text", "%Automated WhatsApp Drop-off Follow-up Sent%")
        .limit(1)
        .maybeSingle();

      if (previousFollowup) {
        continue; // Already nudged, skip to prevent spam
      }

      const cleanPhone = contact.phone.replace(/[^0-9]/g, "");
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      const targetName = contact.name || "Valued Business Owner";
      const loanAmount = deal?.value ? `₹${deal.value.toLocaleString("en-IN")}` : "your requested capital";
      const resumeLink = `${appUrl}/loans?resume=${conv.id}`;

      const followUpMessage = `Namaste ${targetName}! 🙏

We noticed you started your loan inquiry for ${loanAmount} on UniCRM Capital, but we haven't finished structuring your application.

Our banking & NBFC partners have special low-interest & low-CIBIL routes active right now.

👉 Click here to resume where you left off:
${resumeLink}

Or simply reply directly to this WhatsApp message with any questions, and our senior lending desk will assist you right away!`;

      let sent = false;
      let evoInstance = `acc_${conv.account_id ? conv.account_id.slice(0, 8) : "default"}`;

      try {
        const evoRes = await evolution.sendText(evoInstance, formattedPhone, followUpMessage).catch(() => null);
        if (evoRes?.key?.id) {
          sent = true;
        } else {
          const fallbackRes = await evolution.sendText("default", formattedPhone, followUpMessage).catch(() => null);
          if (fallbackRes?.key?.id) sent = true;
        }
      } catch (evoErr) {
        console.warn(`[loans/followup] failed to send drop-off nudge to ${formattedPhone}:`, evoErr);
      }

      if (sent) {
        await adminSupabase.from("messages").insert({
          conversation_id: conv.id,
          sender_type: "bot",
          content_type: "text",
          content_text: `[Automated WhatsApp Drop-off Follow-up Sent]\n${followUpMessage}`,
          status: "sent",
        });

        await adminSupabase
          .from("conversations")
          .update({
            last_message_text: "Automated WhatsApp drop-off follow-up dispatched.",
            last_message_at: new Date().toISOString(),
          })
          .eq("id", conv.id);

        processed.push({
          conversationId: conv.id,
          phone: formattedPhone,
          name: targetName,
          status: "sent",
        });
      }
    }

    return NextResponse.json({
      success: true,
      scanned: inactiveConversations?.length || 0,
      dispatched: processed.length,
      processed,
    });
  } catch (err: any) {
    console.error("[loans/followup] GET cron error:", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}

/**
 * POST /api/loans/followup
 * Omnichannel Drop-off Recovery:
 * If a borrower stops responding or leaves the loan consultation on /loans,
 * this endpoint sends an automated follow-up via WhatsApp with a deep-link
 * allowing the borrower to continue either on WhatsApp or by returning to UniCRM.
 */
export async function POST(req: NextRequest) {
  try {
    const { accountId, userId } = await getCurrentAccount();
    const body = await req.json();
    const { conversationId, applicantPhone, applicantName, requestedAmount } = body;

    const adminSupabase = getAdminClient();

    let targetPhone = applicantPhone;
    let targetName = applicantName || "Valued Business Owner";
    let loanAmount = requestedAmount || "your requested amount";

    // If conversationId provided, fetch details from DB
    if (conversationId) {
      const { data: conv } = await adminSupabase
        .from("conversations")
        .select(`
          id,
          account_id,
          contact:contacts (
            id,
            name,
            phone
          )
        `)
        .eq("id", conversationId)
        .maybeSingle();

      if (conv && (conv as any).contact) {
        const contact = (conv as any).contact;
        if (!targetPhone && contact.phone) targetPhone = contact.phone;
        if (targetName === "Valued Business Owner" && contact.name) targetName = contact.name;
      }
    }

    if (!targetPhone) {
      return NextResponse.json(
        { error: "Borrower phone number is required to send WhatsApp follow-up." },
        { status: 400 }
      );
    }

    const cleanPhone = targetPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dfyunicrm.com";
    const resumeLink = conversationId
      ? `${appUrl}/loans?resume=${conversationId}`
      : `${appUrl}/loans`;

    const followUpMessage = `Namaste ${targetName}! 🙏

We noticed you started your loan inquiry for ${loanAmount} on UniCRM Capital, but we haven't finished structuring your application.

Our banking & NBFC partners have special low-interest & low-CIBIL routes active right now.

👉 Click here to resume where you left off:
${resumeLink}

Or simply reply directly to this WhatsApp message with any questions, and our senior lending desk will assist you right away!`;

    // Attempt WhatsApp delivery via Evolution API instance
    let sentViaWhatsApp = false;
    let evolutionInstance = `acc_${accountId ? accountId.slice(0, 8) : "default"}`;

    try {
      // Check if instance is connected, else use default instance
      const state = await evolution.getConnectionState(evolutionInstance).catch(() => null);
      if (state?.instance?.state !== "open") {
        evolutionInstance = "default";
      }

      const evoRes = await evolution.sendText(evolutionInstance, formattedPhone, followUpMessage);
      if (evoRes?.key?.id) {
        sentViaWhatsApp = true;
      }
    } catch (evoErr) {
      console.warn("[loans/followup] Evolution send failed, trying default instance:", evoErr);
      try {
        const evoResFallback = await evolution.sendText("default", formattedPhone, followUpMessage);
        if (evoResFallback?.key?.id) {
          sentViaWhatsApp = true;
        }
      } catch (fallbackErr) {
        console.error("[loans/followup] Evolution fallback failed:", fallbackErr);
      }
    }

    // Record follow-up message into messages table if conversationId exists
    if (conversationId && sentViaWhatsApp) {
      await adminSupabase.from("messages").insert({
        conversation_id: conversationId,
        sender_type: "bot",
        content_type: "text",
        content_text: `[Automated WhatsApp Drop-off Follow-up Sent]\n${followUpMessage}`,
        status: "sent",
      });

      await adminSupabase
        .from("conversations")
        .update({
          last_message_text: "Automated WhatsApp drop-off follow-up dispatched.",
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversationId);
    }

    return NextResponse.json({
      success: true,
      sentViaWhatsApp,
      targetPhone: formattedPhone,
      resumeLink,
    });
  } catch (err: any) {
    console.error("[loans/followup] error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to dispatch follow-up" },
      { status: 500 }
    );
  }
}
