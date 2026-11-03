import { NextRequest, NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getAdminClient } from "@/lib/gdrive/offload";
import { getVaultSecret } from "@/lib/vault";
import { getBorrowerNamespace, recallBorrowerContext, storeBorrowerMemory } from "@/lib/supermemory";
import { notifyNewLoanApplication } from "@/lib/slack/notify";

export const dynamic = "force-dynamic";

const OMNIROUTE_URL = process.env.OMNIROUTE_URL || "https://omniroute.dfydude.online/v1";
const DEFAULT_OMNIROUTE_KEY = process.env.OMNIROUTE_API_KEY || "sk-51ede91f935f3396-6c4dcc-42124cc3";

/**
 * Extracts structured loan application anchors from user messages or applicantProfile
 */
function extractLoanDetails(allMessages: any[], profile: any = {}) {
  const combinedText = allMessages.map((m: any) => m.text || m.content || "").join(" ");

  // Extract amount requested
  let amount = profile.requestedAmount || profile.amount || null;
  if (!amount) {
    const amtMatch = combinedText.match(/(?:(?:₹|rs\.?|inr)\s*(\d+(?:[.,]\d+)?\s*(?:lakhs?|lacs?|cr|crores?|k)?))|(\d+\s*(?:lakhs?|lacs?|cr|crores?))/i);
    if (amtMatch) {
      amount = amtMatch[0];
    }
  }

  // Extract phone number (Indian 10-digit format)
  let phone = profile.phone || null;
  if (!phone) {
    const phoneMatch = combinedText.match(/(?:\+?91[\-\s]?)?[6-9]\d{9}/);
    if (phoneMatch) {
      phone = phoneMatch[0].replace(/[^0-9]/g, "");
      if (phone.length === 12 && phone.startsWith("91")) {
        phone = phone.slice(2);
      }
    }
  }

  // Extract monthly turnover
  let monthlyTurnover = profile.monthlyTurnover || null;
  if (!monthlyTurnover) {
    const turnoverMatch = combinedText.match(/(?:turnover|sales|revenue|monthly)\s*(?:is|of|around)?\s*(?:₹|rs\.?)?\s*(\d+(?:[.,]\d+)?\s*(?:lakhs?|lacs?|cr|k)?)/i);
    if (turnoverMatch) {
      monthlyTurnover = turnoverMatch[1];
    }
  }

  // Extract business vintage
  let vintage = profile.vintage || null;
  if (!vintage) {
    const vintageMatch = combinedText.match(/(\d+)\s*(?:years?|yrs?)\s*(?:old|running|in business)?/i);
    if (vintageMatch) {
      vintage = `${vintageMatch[1]} years`;
    }
  }

  return { amount, phone, monthlyTurnover, vintage };
}

/**
 * GET /api/loans/consult?conversationId=<id>
 * Hydrates an existing conversation when a borrower resumes via deep-link ?resume=<id>
 */
export async function GET(req: NextRequest) {
  try {
    const { accountId } = await getCurrentAccount();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    const adminSupabase = getAdminClient();

    // Verify conversation belongs to this account or get conversation details
    const { data: conv, error: convErr } = await adminSupabase
      .from("conversations")
      .select(`
        id,
        account_id,
        status,
        ai_autoreply_disabled,
        contact:contacts (
          id,
          name,
          phone
        )
      `)
      .eq("id", conversationId)
      .maybeSingle();

    if (convErr || !conv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Safety: ensure it matches account if user is signed in to an account
    if (accountId && conv.account_id && conv.account_id !== accountId) {
      return NextResponse.json({ error: "Unauthorized access to conversation" }, { status: 403 });
    }

    // Fetch messages for this conversation ordered chronologically
    const { data: dbMessages, error: msgErr } = await adminSupabase
      .from("messages")
      .select("id, sender_type, content_text, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (msgErr) {
      console.error("[loans/consult] error fetching messages:", msgErr);
      return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
    }

    const formattedMessages = (dbMessages || []).map((m: any) => ({
      id: m.id,
      sender: m.sender_type === "customer" ? "user" : m.sender_type === "agent" ? "human_agent" : "ai",
      text: m.content_text || "",
      time: new Date(m.created_at || Date.now()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

    // If there were no messages stored, keep a fallback greeting
    if (formattedMessages.length === 0) {
      formattedMessages.push({
        id: "m-welcome",
        sender: "ai",
        text: "Namaste! 🙏 Welcome back to your loan consultation desk. How can we proceed with your application today?",
        time: "Just now",
      });
    }

    return NextResponse.json({
      success: true,
      conversationId: conv.id,
      isHumanTakenOver: conv.ai_autoreply_disabled === true,
      contact: (conv as any).contact || null,
      messages: formattedMessages,
    });
  } catch (err: any) {
    console.error("[loans/consult] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/loans/consult
 * Conversational AI Loan Underwriter with DB persistence:
 * - Persists conversation and messages in `conversations` & `messages`
 * - Detects human agent takeover (`ai_autoreply_disabled === true`)
 * - Structures leads into `contacts`, `deals` (Lending Desk), and `loan_applications`
 */
export async function POST(req: NextRequest) {
  try {
    const { accountId, userId } = await getCurrentAccount();
    const body = await req.json();
    const { messages = [], applicantProfile = {}, conversationId: clientConvId } = body;

    const adminSupabase = getAdminClient();

    // 1. Identify or create Contact
    const userPhone = applicantProfile?.phone || extractLoanDetails(messages, applicantProfile).phone || '';
    const userName = applicantProfile?.name || applicantProfile?.businessName || 'Loan Applicant';

    let contactId: string | null = null;
    if (userPhone && accountId) {
      const { data: existingContact } = await adminSupabase
        .from('contacts')
        .select('id')
        .eq('account_id', accountId)
        .eq('phone', userPhone)
        .limit(1)
        .maybeSingle();

      if (existingContact?.id) {
        contactId = existingContact.id;
      } else {
        const { data: newContact } = await adminSupabase
          .from('contacts')
          .insert({
            account_id: accountId,
            user_id: userId,
            name: userName,
            phone: userPhone,
          })
          .select('id')
          .maybeSingle();
        contactId = newContact?.id || null;
      }
    }

    // 2. Identify or create Conversation
    let activeConvId = clientConvId || null;
    let isAiDisabled = false;

    if (activeConvId && accountId) {
      const { data: convData } = await adminSupabase
        .from('conversations')
        .select('id, ai_autoreply_disabled, contact_id')
        .eq('id', activeConvId)
        .eq('account_id', accountId)
        .maybeSingle();

      if (convData) {
        isAiDisabled = convData.ai_autoreply_disabled === true;
        if (!contactId && convData.contact_id) {
          contactId = convData.contact_id;
        }
      } else {
        activeConvId = null;
      }
    }

    if (!activeConvId && accountId) {
      // Find latest open conversation for contact, or create a new conversation
      if (contactId) {
        const { data: existingConv } = await adminSupabase
          .from('conversations')
          .select('id, ai_autoreply_disabled')
          .eq('account_id', accountId)
          .eq('contact_id', contactId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingConv) {
          activeConvId = existingConv.id;
          isAiDisabled = existingConv.ai_autoreply_disabled === true;
        }
      }

      if (!activeConvId) {
        // If no contact yet, ensure we have a fallback contact to satisfy foreign key
        let safeContactId = contactId;
        if (!safeContactId) {
          const { data: defaultContact } = await adminSupabase
            .from('contacts')
            .insert({
              account_id: accountId,
              user_id: userId,
              name: userName,
              phone: userPhone || `guest-${Date.now()}`,
            })
            .select('id')
            .single();
          safeContactId = defaultContact?.id;
          contactId = safeContactId;
        }

        const { data: newConv } = await adminSupabase
          .from('conversations')
          .insert({
            account_id: accountId,
            user_id: userId,
            contact_id: safeContactId,
            status: 'open',
            ai_autoreply_disabled: false,
          })
          .select('id')
          .single();

        activeConvId = newConv?.id || null;
      }
    }

    // 3. Save incoming customer message to `messages`
    const latestUserMsg = messages[messages.length - 1];
    const incomingText = latestUserMsg?.text || latestUserMsg?.content || "";

    if (activeConvId && incomingText) {
      await adminSupabase.from('messages').insert({
        conversation_id: activeConvId,
        sender_type: 'customer',
        content_type: 'text',
        content_text: incomingText,
        status: 'sent',
      });

      await adminSupabase
        .from('conversations')
        .update({
          last_message_text: incomingText,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', activeConvId);
    }

    // 4. Check if human advisor has taken over the conversation
    if (isAiDisabled) {
      return NextResponse.json({
        success: true,
        humanTakenOver: true,
        conversationId: activeConvId,
        reply: "A senior lending advisor has joined this conversation and is reviewing your requirements personally.",
      });
    }

    // 5. Generate AI Loan Advisor reply
    // Recall past borrower context from Supermemory if available
    const borrowerNamespace = accountId && (userPhone || activeConvId)
      ? getBorrowerNamespace(accountId, userPhone || activeConvId!)
      : null;

    let recalledContext: string[] = [];
    if (borrowerNamespace) {
      try {
        recalledContext = await recallBorrowerContext(borrowerNamespace, incomingText || "loan advisory");
      } catch (err) {
        console.warn("[loans/consult] Supermemory recall skipped:", err);
      }
    }

    const memorySnippet = recalledContext.length > 0
      ? `\n\nVerified Borrower Memory & Historical Context:\n${recalledContext.map((c) => `- ${c}`).join("\n")}\nUse this context to personalize your advice and avoid re-asking details they already provided.`
      : "";

    const systemPrompt = `You are the Senior Underwriting Officer at UniCRM Capital (India's leading MSME & Business Lending Network).
Your mission is to understand the borrower's exact business needs and find viable financing angles even if they face traditional banking hurdles (like low CIBIL score, new business, or lack of 3-year ITR).${memorySnippet}

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
      ...messages.map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text || m.content || "",
      })),
    ];

    let replyText = "Thank you for sharing. Could you let me know if you or your family own any residential or commercial property, or what your average monthly business turnover is? That helps us find the best NBFC partners for you.";

    const omniRouteKey = (await getVaultSecret("OMNIROUTE_API_KEY")) || DEFAULT_OMNIROUTE_KEY;

    try {
      const aiRes = await fetch(`${OMNIROUTE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${omniRouteKey}`,
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: JSON.stringify({
          model: "auto/best-chat",
          messages: formattedMessages,
          temperature: 0.6,
        }),
      });

      if (aiRes.ok) {
        const data = await aiRes.json();
        replyText = data?.choices?.[0]?.message?.content?.trim() || replyText;
      }
    } catch (aiErr) {
      console.error('[loans/consult] OmniRoute fetch error:', aiErr);
    }

    // Async persist latest interaction into Supermemory (non-blocking)
    if (borrowerNamespace && incomingText) {
      storeBorrowerMemory(
        borrowerNamespace,
        `Applicant: "${incomingText}". Underwriter advice: "${replyText}"`,
        { phone: userPhone, conversationId: activeConvId }
      ).catch((err) => console.warn('[loans/consult] Supermemory async store failed:', err));
    }

    // 6. Save bot reply into `messages`
    if (activeConvId && replyText) {
      await adminSupabase.from('messages').insert({
        conversation_id: activeConvId,
        sender_type: 'bot',
        content_type: 'text',
        content_text: replyText,
        status: 'sent',
      });

      await adminSupabase
        .from('conversations')
        .update({
          last_message_text: replyText,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', activeConvId);
    }

    // 7. Auto-structure lead into pipeline, deal, and loan_applications
    const extracted = extractLoanDetails(messages, applicantProfile);
    const numericAmount = extracted.amount
      ? parseFloat(String(extracted.amount).replace(/[^0-9.]/g, '')) || 500000
      : 500000;

    if (accountId) {
      try {
        // Ensure Lending Desk pipeline exists
        const { data: pipelineData } = await adminSupabase.rpc('ensure_lending_pipeline', {
          p_account_id: accountId,
          p_user_id: userId,
        });

        const pipelineId = pipelineData;

        if (pipelineId) {
          const { data: stageData } = await adminSupabase
            .from('pipeline_stages')
            .select('id')
            .eq('pipeline_id', pipelineId)
            .order('position', { ascending: true })
            .limit(1)
            .maybeSingle();

          if (stageData?.id && contactId) {
            // Check if deal exists
            const { data: existingDeal } = await adminSupabase
              .from('deals')
              .select('id')
              .eq('account_id', accountId)
              .eq('pipeline_id', pipelineId)
              .eq('contact_id', contactId)
              .limit(1)
              .maybeSingle();

            if (!existingDeal?.id) {
              await adminSupabase.from('deals').insert({
                account_id: accountId,
                user_id: userId,
                pipeline_id: pipelineId,
                stage_id: stageData.id,
                contact_id: contactId,
                title: `${(applicantProfile?.category || 'business').toUpperCase()} LOAN INQUIRY`,
                value: numericAmount,
                status: 'open',
              });
            }

            // Also record in loan_applications for DSA Desk visibility
            const { data: existingApp } = await adminSupabase
              .from('loan_applications')
              .select('id')
              .eq('account_id', accountId)
              .eq('phone', userPhone || 'none')
              .limit(1)
              .maybeSingle();

            if (!existingApp?.id && userPhone) {
              await adminSupabase.from('loan_applications').insert({
                account_id: accountId,
                user_id: userId,
                business_name: applicantProfile?.businessName || userName,
                applicant_name: userName,
                phone: userPhone,
                email: applicantProfile?.email || 'borrower@unicrm.app',
                city: applicantProfile?.city || 'India',
                loan_category: applicantProfile?.category || 'business',
                amount_requested: numericAmount,
                monthly_turnover: extracted.monthlyTurnover || null,
                business_vintage: extracted.vintage || null,
                status: 'submitted',
              });

              // Dispatch real-time Slack alert for founder/agent desk (non-blocking)
              notifyNewLoanApplication({
                borrowerName: applicantProfile?.businessName || userName,
                phone: userPhone,
                loanType: `${(applicantProfile?.category || 'Business').toUpperCase()} Loan`,
                amount: numericAmount,
                city: applicantProfile?.city || 'India',
                conversationId: activeConvId || undefined,
              }).catch((err) => console.warn('[loans/consult] Slack alert error:', err));
            }
          }
        }
      } catch (pipelineErr) {
        console.error('[loans/consult] pipeline auto-qualify error:', pipelineErr);
      }
    }

    return NextResponse.json({
      success: true,
      reply: replyText,
      conversationId: activeConvId,
      humanTakenOver: false,
    });
  } catch (err: any) {
    console.error('[loans/consult] error:', err);
    return NextResponse.json({
      reply: "We received your loan inquiry. Could you share your expected loan amount and monthly business turnover so we can connect you with the right bank partner?",
    });
  }
}
