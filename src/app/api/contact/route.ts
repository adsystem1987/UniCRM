import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/gdrive/offload';
import { refreshGmailAccessToken, sendGmailMessage } from '@/lib/gmail/client';
import { notifySlackContactLead } from '@/lib/slack/notify';
import { evaluateTextIntent, applyIntentToContact } from '@/lib/ai/intent-router';
import { loadAiConfig } from '@/lib/ai/config';
import { generateReply } from '@/lib/ai/generate';
import { buildSystemPrompt } from '@/lib/ai/defaults';
import { runAutomationsForTrigger } from '@/lib/automations/engine';

export const dynamic = 'force-dynamic';

const DESTINATION_EMAIL = 'help@dfyunicrm.com';

export async function POST(req: Request) {
  try {
    let name = '';
    let email = '';
    let phone = '';
    let topic = 'General Inquiry';
    let message = '';
    let honeypot = '';
    const isFormSubmit = !req.headers.get('content-type')?.includes('application/json');

    if (isFormSubmit) {
      const formData = await req.formData();
      name = (formData.get('name') as string)?.trim() || '';
      email = (formData.get('email') as string)?.trim() || '';
      phone = (formData.get('phone') as string)?.trim() || '';
      topic = (formData.get('topic') as string)?.trim() || 'General Inquiry';
      message = (formData.get('message') as string)?.trim() || '';
      honeypot = (formData.get('company_website_url') as string)?.trim() || '';
    } else {
      const body = await req.json().catch(() => ({}));
      name = body.name?.trim() || '';
      email = body.email?.trim() || '';
      phone = body.phone?.trim() || '';
      topic = body.topic || 'General Inquiry';
      message = body.message?.trim() || '';
      honeypot = body.company_website_url?.trim() || '';
    }

    // Anti-Bot Protection: Drop spam submissions where the hidden honeypot field was filled
    if (honeypot) {
      console.warn('[Contact Support] Dropped automated bot submission matching honeypot:', { name, email, honeypot });
      if (isFormSubmit) {
        return NextResponse.redirect(new URL('/contact?success=true&name=Friend', req.url), 303);
      }
      return NextResponse.json({ success: true, message: 'Message received.' });
    }

    // Common spam keyword filters (e.g. backlink / search index spam)
    const isSpamText = /addwebsite\.pro|google's search index|visible in google search results/i.test(message);
    if (isSpamText) {
      console.warn('[Contact Support] Dropped automated spam bot pitch:', { name, email, message });
      if (isFormSubmit) {
        return NextResponse.redirect(new URL('/contact?success=true&name=Friend', req.url), 303);
      }
      return NextResponse.json({ success: true, message: 'Message received.' });
    }

    // Live chat or contact form submission:
    // Form submits strictly require name, email, message.
    // Live chat requires name, at least (email OR phone), and message.
    const hasContactMethod = Boolean(email || phone);
    if (!name || !message || (!email && isFormSubmit) || !hasContactMethod) {
      if (isFormSubmit) {
        return NextResponse.redirect(
          new URL('/contact?error=missing_fields', req.url),
          303
        );
      }
      return NextResponse.json(
        { error: 'Please provide your name, a valid email or phone number, and a message.' },
        { status: 400 }
      );
    }

    const payload = {
      to: DESTINATION_EMAIL,
      from: email || 'No email provided (Phone-only inquiry)',
      name,
      phone: phone || 'Not provided',
      topic,
      message,
      submittedAt: new Date().toISOString(),
    };

    console.log('[Contact Support Submission]', JSON.stringify(payload, null, 2));

    let aiGeneratedReply: string | null = null;
    let detectedIntent: string = 'general';
    let isHotLeadDetected = false;

    // 1. Sync in Real-Time to UniCRM Inbox & Contacts
    try {
      const supabase = getAdminClient();
      const { data: account } = await supabase
        .from('accounts')
        .select('id, owner_user_id')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (account) {
        const accountId = account.id;
        const userId = account.owner_user_id;

        // Fast Intent Evaluation (<2ms)
        const intentDecision = evaluateTextIntent(`${topic} ${message}`);
        detectedIntent = intentDecision.intent;
        isHotLeadDetected = intentDecision.isHotLead;

        // Check if contact exists
        let contactId: string | null = null;
        let isNewContact = false;
        if (phone) {
          const { data: byPhone } = await supabase
            .from('contacts')
            .select('id')
            .eq('account_id', accountId)
            .eq('phone', phone)
            .maybeSingle();
          if (byPhone) contactId = byPhone.id;
        }

        if (!contactId && email) {
          const { data: byEmail } = await supabase
            .from('contacts')
            .select('id')
            .eq('account_id', accountId)
            .eq('email', email)
            .maybeSingle();
          if (byEmail) contactId = byEmail.id;
        }

        if (!contactId) {
          const { data: newContact } = await supabase
            .from('contacts')
            .insert({
              account_id: accountId,
              user_id: userId,
              name,
              email: email || null,
              phone: phone || null,
            })
            .select('id')
            .single();
          if (newContact) {
            contactId = newContact.id;
            isNewContact = true;
          }
        }

        if (contactId) {
          // Tag contact with #WebInquiry + Intent Tags (#HotLead, #UrgentBooking, etc.)
          await applyIntentToContact(supabase, {
            accountId,
            contactId,
            decision: {
              ...intentDecision,
              suggestedTags: Array.from(new Set(['WebInquiry', ...intentDecision.suggestedTags])),
            },
          });

          // Option B: If AI detects Hot Lead or Urgent Booking, auto-create a deal in the sales pipeline
          if (intentDecision.isHotLead) {
            try {
              // Find the default or active pipeline and its first stage
              const { data: pipeline } = await supabase
                .from('pipelines')
                .select('id')
                .eq('account_id', accountId)
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle();

              if (pipeline) {
                const { data: stage } = await supabase
                  .from('pipeline_stages')
                  .select('id')
                  .eq('pipeline_id', pipeline.id)
                  .order('position', { ascending: true })
                  .limit(1)
                  .maybeSingle();

                if (stage) {
                  // Check if an open deal already exists for this contact
                  const { data: existingDeal } = await supabase
                    .from('deals')
                    .select('id')
                    .eq('account_id', accountId)
                    .eq('contact_id', contactId)
                    .eq('status', 'open')
                    .maybeSingle();

                  if (!existingDeal) {
                    await supabase.from('deals').insert({
                      account_id: accountId,
                      user_id: userId,
                      pipeline_id: pipeline.id,
                      stage_id: stage.id,
                      contact_id: contactId,
                      title: `🔥 [Hot Lead] ${name} - ${topic}`,
                      value: 0,
                      currency: 'INR',
                      status: 'open',
                      notes: `Inbound high-intent web lead.\n\nIntent: ${intentDecision.intent} (Score: ${intentDecision.score})\nTags: ${intentDecision.suggestedTags.join(', ')}\nInquiry: ${message}`,
                    });
                    console.log(`[contact/route] Auto-created Pipeline Deal for Hot Lead: ${name}`);
                  }
                }
              }
            } catch (dealErr) {
              console.warn('[contact/route] Could not auto-create deal:', dealErr);
            }
          }

          // Find or create conversation
          let conversationId: string | null = null;
          let isFirstInbound = false;
          const { data: existingConv } = await supabase
            .from('conversations')
            .select('id')
            .eq('account_id', accountId)
            .eq('contact_id', contactId)
            .maybeSingle();

          const messageContent = `📬 Web Contact Inquiry\n\n📌 Topic: ${topic}\n👤 Name: ${name}\n📧 Email: ${email || 'Not provided'}\n📱 Phone: ${phone || 'Not provided'}\n\n💬 Message:\n${message}`;

          if (existingConv) {
            conversationId = existingConv.id;
          } else {
            isFirstInbound = true;
            const { data: newConv } = await supabase
              .from('conversations')
              .insert({
                account_id: accountId,
                user_id: userId,
                contact_id: contactId,
                last_message_text: messageContent,
                last_message_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                unread_count: 1,
              })
              .select('id')
              .single();
            if (newConv) conversationId = newConv.id;
          }

          if (conversationId) {
            // Realtime Inbound Message matching messages table schema
            const { error: msgErr } = await supabase.from('messages').insert({
              conversation_id: conversationId,
              sender_type: 'customer',
              content_type: 'text',
              content_text: messageContent,
              message_id: `web_${Date.now()}`,
              status: 'delivered',
            });

            if (msgErr) {
              console.error('[contact/route] Message insert error:', msgErr);
            }

            // Keep conversation snippet and unread counter up to date
            await supabase
              .from('conversations')
              .update({
                last_message_text: messageContent,
                last_message_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                unread_count: 1,
              })
              .eq('id', conversationId);

            // 1. Try Contextual AI Auto-Reply first (Reads the message and generates a tailored response)
            let handledByAi = false;
            try {
              const aiConfig = await loadAiConfig(supabase, accountId);
              if (aiConfig && aiConfig.isActive) {
                const systemPrompt = buildSystemPrompt({
                  userPrompt: aiConfig.systemPrompt || "You are an expert customer assistant for UniCRM. Answer inquiries politely, clearly, and concisely in under 3 sentences.",
                  mode: 'auto_reply',
                });

                const aiResult = await generateReply({
                  config: aiConfig,
                  systemPrompt,
                  messages: [
                    {
                      role: 'user',
                      content: `Customer Name: ${name}\nInquiry: ${message}`,
                    },
                  ],
                });

                if (aiResult?.text && !aiResult.handoff) {
                  aiGeneratedReply = aiResult.text.trim();
                  handledByAi = true;

                  // Save AI agent response into CRM conversation thread
                  await supabase.from('messages').insert({
                    conversation_id: conversationId,
                    sender_type: 'agent',
                    content_type: 'text',
                    content_text: aiGeneratedReply,
                    message_id: `ai_${Date.now()}`,
                    status: 'delivered',
                  });

                  // Update conversation last message
                  await supabase
                    .from('conversations')
                    .update({
                      last_message_text: `🤖 ${aiGeneratedReply}`,
                      last_message_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', conversationId);
                }
              }
            } catch (aiErr) {
              console.warn('[contact/route] AI auto-reply generation skipped:', aiErr);
            }

            // 2. Trigger Automations engine only if AI did not handle it, or for non-duplicating automation triggers
            // This prevents rigid "Welcome" template blasts from conflicting with intelligent AI responses.
            if (!handledByAi) {
              try {
                const triggersToFire: Array<'new_contact_created' | 'first_inbound_message' | 'new_message_received'> = ['new_message_received'];
                if (isFirstInbound) triggersToFire.unshift('first_inbound_message');
                if (isNewContact) triggersToFire.unshift('new_contact_created');

                for (const triggerType of triggersToFire) {
                  await runAutomationsForTrigger({
                    accountId,
                    triggerType,
                    contactId,
                    context: {
                      message_text: message,
                      conversation_id: conversationId,
                    },
                  }).catch((autoErr) => console.error('[contact/route] automation run error:', autoErr));
                }
              } catch (autoErr) {
                console.error('[contact/route] failed to dispatch automations:', autoErr);
              }
            }
          }
        }

        // 2. Send email via Gmail if configured
        const { data: gmailConfig } = await supabase
          .from('gmail_configs')
          .select('refresh_token, connected_email')
          .eq('account_id', accountId)
          .maybeSingle();

        if (gmailConfig?.refresh_token) {
          try {
            const accessToken = await refreshGmailAccessToken(gmailConfig.refresh_token);
            await sendGmailMessage({
              accessToken,
              fromEmail: gmailConfig.connected_email,
              fromName: 'UniCRM Support Desk',
              to: DESTINATION_EMAIL,
              subject: `[UniCRM Inquiry] ${topic} from ${name}`,
              bodyHtml: `
                <h3>New Support Inquiry Received</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Topic:</strong> ${topic}</p>
                <hr/>
                <p><strong>Message:</strong></p>
                <blockquote style="background:#f4f4f6;padding:12px;border-left:4px solid #10b981;border-radius:4px;">
                  ${message.replace(/\n/g, '<br/>')}
                </blockquote>
              `,
            });
          } catch (gmailErr) {
            console.warn('[contact/route] Gmail notification send failed:', gmailErr);
          }
        }

        // 3. Send email via Resend if RESEND_API_KEY is configured
        if (process.env.RESEND_API_KEY) {
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: process.env.RESEND_FROM || 'UniCRM Inquiries <onboarding@resend.dev>',
                to: DESTINATION_EMAIL,
                reply_to: email,
                subject: `[UniCRM Lead] ${topic} from ${name}`,
                html: `
                  <h3>New Support Desk Inquiry</h3>
                  <p><strong>Name:</strong> ${name}</p>
                  <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                  <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                  <p><strong>Topic:</strong> ${topic}</p>
                  <hr/>
                  <p><strong>Message:</strong></p>
                  <blockquote style="background:#f4f4f6;padding:12px;border-left:4px solid #10b981;border-radius:4px;">
                    ${message.replace(/\n/g, '<br/>')}
                  </blockquote>
                `,
              }),
            });
          } catch (resendErr) {
            console.warn('[contact/route] Resend notification failed:', resendErr);
          }
        }

        // 4. Send Slack notification to designated channel
        void notifySlackContactLead({
          name,
          email,
          phone,
          message: `[${topic}] ${message}`,
        }).catch((slackErr) => {
          console.warn('[contact/route] Slack notification failed:', slackErr);
        });
      }
    } catch (dbErr) {
      console.warn('[contact/route] Real-time CRM ingestion warning:', dbErr);
    }

    if (isFormSubmit) {
      return NextResponse.redirect(
        new URL(`/contact?success=true&name=${encodeURIComponent(name)}`, req.url),
        303
      );
    }

    return NextResponse.json({
      success: true,
      message: `Thank you, ${name}! Your request has been received in real time. We will get back to you shortly.`,
      aiReply: aiGeneratedReply,
      intent: detectedIntent,
      isHotLead: isHotLeadDetected,
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry. Please try again.' },
      { status: 500 }
    );
  }
}
