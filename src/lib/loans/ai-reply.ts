import { getAdminClient } from "@/lib/gdrive/offload";
import { evolution } from "@/lib/evolution/client";

const OMNIROUTE_URL = process.env.OMNIROUTE_URL || "https://omniroute.dfydude.online/v1";
const OMNIROUTE_KEY = process.env.OMNIROUTE_API_KEY || "sk-51ede91f935f3396-6c4dcc-42124cc3";

interface HandleLoanInboundArgs {
  accountId: string;
  conversationId: string;
  contactId: string;
  phone: string;
  contactName: string;
  messageContent: string;
  instanceName?: string;
}

/**
 * Handles inbound WhatsApp messages for loan advisory conversations:
 * 1. Checks if human takeover is active (ai_autoreply_disabled === true).
 * 2. If human active: leaves message for workplace inbox, sends NO bot message.
 * 3. If AI active: generates loan underwriting response via Omniroute/Gemini and dispatches to borrower's WhatsApp.
 */
export async function handleLoanWhatsAppInbound(args: HandleLoanInboundArgs): Promise<boolean> {
  const { accountId, conversationId, contactId, phone, contactName, messageContent, instanceName } = args;
  const adminSupabase = getAdminClient();

  try {
    // 1. Check if conversation has an active loan application or is in loans category
    const { data: conv } = await adminSupabase
      .from("conversations")
      .select("id, ai_autoreply_disabled, assigned_agent_id")
      .eq("id", conversationId)
      .maybeSingle();

    if (!conv) return false;

    // Check if there is an associated deal in Lending Desk or loan application
    const { data: deal } = await adminSupabase
      .from("deals")
      .select("id, title")
      .eq("account_id", accountId)
      .eq("contact_id", contactId)
      .ilike("title", "%LOAN%")
      .limit(1)
      .maybeSingle();

    const { data: loanApp } = await adminSupabase
      .from("loan_applications")
      .select("id, status")
      .eq("account_id", accountId)
      .eq("phone", phone)
      .limit(1)
      .maybeSingle();

    // If neither deal nor loanApp exists, this is standard CRM chat, not loan underwriting
    if (!deal && !loanApp) {
      return false;
    }

    // 2. Human Takeover Enforcement
    // If human agent has taken over or assigned, DO NOT auto-reply via AI
    if (conv.ai_autoreply_disabled || conv.assigned_agent_id) {
      console.log(`[loan-wa-inbound] human agent owns thread ${conversationId}. Skipping AI auto-reply.`);
      return true; // consumed as loan conversation, but kept quiet for human
    }

    // 3. Load recent context from messages
    const { data: recentMsgs } = await adminSupabase
      .from("messages")
      .select("sender_type, content_text")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(8);

    const history = (recentMsgs || [])
      .reverse()
      .map((m: any) => ({
        role: m.sender_type === "customer" ? "user" : "assistant",
        content: m.content_text || "",
      }));

    if (history.length === 0 || history[history.length - 1].content !== messageContent) {
      history.push({ role: "user", content: messageContent });
    }

    // 4. Generate AI Underwriter Response
    const systemPrompt = `You are the Senior Underwriter & Credit Risk Advisor at UniCRM Lending & Capital Desk.
You are communicating with the borrower "${contactName}" via WhatsApp.
Keep your responses concise, warm, professional, and formatted cleanly for WhatsApp (use emojis, bullet points, bolding with *text*).
Assess:
1. Exact loan requirement amount.
2. Monthly turnover / revenue.
3. Collateral status: Property ownership, factory/machinery, or unsecured/GST-backed.
4. Business vintage (years in business).

Provide clear guidance. Reassure them that even with low CIBIL scores or limited ITR, UniCRM matches them with flexible NBFCs and co-operative banking routes.
Keep answers under 3-4 short sentences per turn so it reads naturally on WhatsApp.`;

    let replyText = "Namaste! 🙏 We received your message regarding your loan inquiry. Could you share your expected loan amount and monthly turnover?";

    try {
      const aiRes = await fetch(`${OMNIROUTE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OMNIROUTE_KEY}`,
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...history,
          ],
          temperature: 0.6,
          max_tokens: 400,
        }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const generated = aiData.choices?.[0]?.message?.content;
        if (generated && generated.trim()) {
          replyText = generated.trim();
        }
      }
    } catch (llmErr) {
      console.warn("[loan-wa-inbound] LLM call error, using polite fallback:", llmErr);
    }

    // 5. Send reply back to borrower via WhatsApp
    const cleanPhone = phone.replace(/\D/g, "");
    const evoInstance = instanceName || `acc_${accountId.slice(0, 8)}`;

    let evoRes = await evolution.sendText(evoInstance, cleanPhone, replyText).catch(() => null);
    if (!evoRes?.key?.id) {
      evoRes = await evolution.sendText("default", cleanPhone, replyText).catch(() => null);
    }

    const waMsgId = evoRes?.key?.id || `evo_reply_${Date.now()}`;

    // 6. Record outbound message in DB so staff in UniCRM Workplace see it immediately
    await adminSupabase.from("messages").insert({
      conversation_id: conversationId,
      sender_type: "bot",
      content_type: "text",
      content_text: replyText,
      message_id: waMsgId,
      status: "sent",
      ai_generated: true,
    });

    await adminSupabase
      .from("conversations")
      .update({
        last_message_text: replyText,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    return true;
  } catch (err) {
    console.error("[loan-wa-inbound] error processing inbound:", err);
    return false;
  }
}
