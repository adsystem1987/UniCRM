import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { refreshGmailAccessToken, sendGmailMessage } from "@/lib/gmail/client";
import { sendEmail } from "@/lib/email/sender";
import { isMasterAdminEmail } from "@/lib/auth/master-admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/inbox/send-email
 * Universal B2B inbox email dispatcher:
 * 1. If account has connected Gmail -> Sends through their personal Gmail.
 * 2. If Platform Owner / Admin -> Falls back to AWS SES (outreach.dfydude.online).
 * 3. Records the email message with channel = 'email' in the conversation.
 */
export async function POST(req: Request) {
  try {
    const { supabase, accountId, userId } = await getCurrentAccount();
    const { data: { user } } = await supabase.auth.getUser();
    const body = await req.json().catch(() => ({}));

    const conversationId = body.conversationId;
    const to = typeof body.to === "string" ? body.to.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "Conversation Update";
    const content = typeof body.message === "string" ? body.message.trim() : "";

    if (!to || !to.includes("@")) {
      return NextResponse.json({ error: "A valid recipient email address is required." }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Email body content is required." }, { status: 400 });
    }

    // 1. Check if the account has connected their own Gmail
    const { data: gmailConfig } = await supabase
      .from("gmail_configs")
      .select("connected_email, refresh_token, is_active")
      .eq("account_id", accountId)
      .maybeSingle();

    let sentVia: "gmail" | "ses" = "gmail";
    let messageId = "";

    if (gmailConfig?.is_active && gmailConfig.refresh_token) {
      // Send via user's authenticated Gmail
      const accessToken = await refreshGmailAccessToken(gmailConfig.refresh_token);
      const sent = await sendGmailMessage({
        accessToken,
        fromEmail: gmailConfig.connected_email,
        to,
        subject,
        bodyHtml: content.replace(/\n/g, "<br/>"),
      });
      sentVia = "gmail";
      messageId = sent.id;
    } else {
      // Only platform admins or owners can use the platform's AWS SES pipeline for arbitrary inbox emails
      const userEmail = user?.email || "";
      const isOwner = isMasterAdminEmail(userEmail);
      if (!isOwner) {
        return NextResponse.json(
          {
            error: "No email account connected. Please connect your Gmail in Settings -> Integrations to send direct emails.",
            requiresConnection: true,
          },
          { status: 400 }
        );
      }

      // Platform Owner sending via verified AWS SES
      const sesRes = await sendEmail({
        to,
        subject,
        html: `<p style="font-family: sans-serif; font-size: 14px; line-height: 22px; color: #1e293b;">${content.replace(/\n/g, "<br/>")}</p>`,
        text: content,
        from: process.env.EMAIL_FROM_ADDRESS || "UniCRM <hello@outreach.dfydude.online>",
        replyTo: userEmail || process.env.EMAIL_REPLY_TO || "help@dfyunicrm.com",
      });

      if (!sesRes.success) {
        return NextResponse.json({ error: sesRes.error || "Failed to deliver email via AWS SES" }, { status: 500 });
      }

      sentVia = "ses";
      messageId = sesRes.id || `ses_${Date.now()}`;
    }

    // 2. Insert into CRM messages table under this conversation
    if (conversationId) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_type: "agent",
        sender_id: userId,
        content_type: "text",
        content_text: `📧 [${subject}]\n\n${content}`,
        channel: "email",
        subject,
        status: "delivered",
        message_id: messageId,
      });

      // Update conversation snippet
      await supabase
        .from("conversations")
        .update({
          last_message_text: `📧 ${subject}`,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);
    }

    return NextResponse.json({
      success: true,
      sentVia,
      messageId,
      recipient: to,
    });
  } catch (err: any) {
    console.error("[api/inbox/send-email] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to send email" }, { status: 500 });
  }
}
