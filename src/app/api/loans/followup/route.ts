import { NextRequest, NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getAdminClient } from "@/lib/gdrive/offload";
import { evolution } from "@/lib/evolution/client";

export const dynamic = "force-dynamic";

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
