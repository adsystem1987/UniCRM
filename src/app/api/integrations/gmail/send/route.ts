import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { refreshGmailAccessToken, sendGmailMessage } from "@/lib/gmail/client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { supabase, accountId, userId } = await getCurrentAccount();
    const body = await request.json().catch(() => ({}));

    const to = typeof body.to === "string" ? body.to.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const content = typeof body.message === "string" ? body.message.trim() : "";
    const contactId = typeof body.contactId === "string" ? body.contactId.trim() : null;

    if (!to || !to.includes("@")) {
      return NextResponse.json({ error: "A valid recipient email is required." }, { status: 400 });
    }

    if (!subject) {
      return NextResponse.json({ error: "Email subject is required." }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Email body content is required." }, { status: 400 });
    }

    // 1. Fetch active Gmail config for the account
    const { data: config, error: configError } = await supabase
      .from("gmail_configs")
      .select("connected_email, refresh_token, is_active")
      .eq("account_id", accountId)
      .maybeSingle();

    if (configError || !config || !config.is_active || !config.refresh_token) {
      return NextResponse.json(
        { error: "Gmail is not connected. Please connect your Gmail in Settings -> Integrations." },
        { status: 400 }
      );
    }

    // 2. Refresh access token
    const accessToken = await refreshGmailAccessToken(config.refresh_token);

    // 3. Send email via Gmail API
    const sent = await sendGmailMessage({
      accessToken,
      fromEmail: config.connected_email,
      to,
      subject,
      bodyHtml: content.replace(/\n/g, "<br/>"),
    });

    // 4. If associated with a CRM contact, record the sent email in conversations
    if (contactId) {
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("account_id", accountId)
        .eq("contact_id", contactId)
        .maybeSingle();

      if (conv) {
        await supabase.from("messages").insert({
          conversation_id: conv.id,
          sender_type: "agent",
          sender_id: userId,
          content_type: "text",
          content_text: `📧 [Email to ${to}] ${subject}\n\n${content}`,
          status: "sent",
        });

        await supabase
          .from("conversations")
          .update({
            last_message_text: `📧 ${subject}`,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", conv.id);
      }
    }

    return NextResponse.json({
      success: true,
      messageId: sent.id,
      threadId: sent.threadId,
    });
  } catch (err) {
    console.error("[gmail/send] error:", err);
    const message = err instanceof Error ? err.message : "Failed to send email via Gmail";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
