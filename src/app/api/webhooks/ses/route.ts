import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/gdrive/offload";

export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/ses
 * Handles AWS SES events routed via SNS:
 * - Bounce: Records bounce in workspace_claim_tokens & messages, adds to email_suppression_list
 * - Complaint: Adds recipient to email_suppression_list immediately
 * - Delivery / Open / Click: AWS SES native feedback
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // 1. Handle AWS SNS Subscription Confirmation handshake
    if (body.Type === "SubscriptionConfirmation" && body.SubscribeURL) {
      console.log("[SES Webhook] Subscribing to SNS topic via URL:", body.SubscribeURL);
      const subscribeRes = await fetch(body.SubscribeURL);
      if (subscribeRes.ok) {
        console.log("[SES Webhook] Successfully confirmed SNS subscription!");
        return NextResponse.json({ success: true, message: "Subscription confirmed" });
      }
      return NextResponse.json({ error: "Failed to confirm subscription" }, { status: 500 });
    }

    // 2. Handle SNS Notification
    if (body.Type === "Notification" && body.Message) {
      let sesEvent: any;
      try {
        sesEvent = typeof body.Message === "string" ? JSON.parse(body.Message) : body.Message;
      } catch {
        sesEvent = body.Message;
      }

      const eventType = sesEvent?.eventType || sesEvent?.notificationType;
      const admin = getAdminClient();
      const now = new Date().toISOString();

      console.log(`[SES Webhook] Processing event type: ${eventType}`);

      if (eventType === "Bounce") {
        const bounce = sesEvent.bounce;
        const bounceType = bounce?.bounceType || "Permanent";
        const recipients = bounce?.bouncedRecipients || [];

        for (const recipient of recipients) {
          const email = recipient.emailAddress?.toLowerCase().trim();
          const reason = recipient.diagnosticCode || bounce?.bounceSubType || bounceType;

          if (email) {
            console.log(`[SES Webhook] Adding bounced email to suppression list: ${email} (${reason})`);
            // Add to suppression list
            await admin.from("email_suppression_list").upsert(
              {
                email,
                reason: `SES_BOUNCE: ${reason}`,
                suppressed_at: now,
              },
              { onConflict: "email" }
            );

            // Update workspace claim token if any
            await admin
              .from("workspace_claim_tokens")
              .update({
                status: "bounced",
                bounced_at: now,
                bounce_reason: reason,
              })
              .ilike("email", email);

            // Update message status
            await admin
              .from("messages")
              .update({
                status: "failed",
                bounced_at: now,
              })
              .eq("channel", "email");
          }
        }
      } else if (eventType === "Complaint") {
        const complaint = sesEvent.complaint;
        const recipients = complaint?.complainedRecipients || [];

        for (const recipient of recipients) {
          const email = recipient.emailAddress?.toLowerCase().trim();
          if (email) {
            console.log(`[SES Webhook] Adding complaint to suppression list: ${email}`);
            await admin.from("email_suppression_list").upsert(
              {
                email,
                reason: "SES_SPAM_COMPLAINT",
                suppressed_at: now,
              },
              { onConflict: "email" }
            );

            await admin
              .from("workspace_claim_tokens")
              .update({
                status: "opted_out",
                opted_out_at: now,
              })
              .ilike("email", email);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[api/webhooks/ses] Exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
