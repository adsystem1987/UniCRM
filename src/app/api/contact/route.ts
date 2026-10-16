import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/gdrive/offload';
import { refreshGmailAccessToken, sendGmailMessage } from '@/lib/gmail/client';

export const dynamic = 'force-dynamic';

const DESTINATION_EMAIL = 'ravibabuche@dfydude.online';

export async function POST(req: Request) {
  try {
    let name = '';
    let email = '';
    let phone = '';
    let topic = 'General Inquiry';
    let message = '';
    const isFormSubmit = !req.headers.get('content-type')?.includes('application/json');

    if (isFormSubmit) {
      const formData = await req.formData();
      name = (formData.get('name') as string)?.trim() || '';
      email = (formData.get('email') as string)?.trim() || '';
      phone = (formData.get('phone') as string)?.trim() || '';
      topic = (formData.get('topic') as string)?.trim() || 'General Inquiry';
      message = (formData.get('message') as string)?.trim() || '';
    } else {
      const body = await req.json().catch(() => ({}));
      name = body.name?.trim() || '';
      email = body.email?.trim() || '';
      phone = body.phone?.trim() || '';
      topic = body.topic || 'General Inquiry';
      message = body.message?.trim() || '';
    }

    if (!name || !email || !message) {
      if (isFormSubmit) {
        return NextResponse.redirect(
          new URL('/contact?error=missing_fields', req.url),
          303
        );
      }
      return NextResponse.json(
        { error: 'Please provide your name, email, and message.' },
        { status: 400 }
      );
    }

    const payload = {
      to: DESTINATION_EMAIL,
      from: email,
      name,
      phone: phone || 'Not provided',
      topic,
      message,
      submittedAt: new Date().toISOString(),
    };

    console.log('[Contact Support Submission]', JSON.stringify(payload, null, 2));

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

        // Check if contact exists
        let contactId: string | null = null;
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
              email,
              phone: phone || '',
            })
            .select('id')
            .single();
          if (newContact) contactId = newContact.id;
        }

        if (contactId) {
          // Find or create conversation
          let conversationId: string | null = null;
          const { data: existingConv } = await supabase
            .from('conversations')
            .select('id')
            .eq('account_id', accountId)
            .eq('contact_id', contactId)
            .maybeSingle();

          if (existingConv) {
            conversationId = existingConv.id;
            await supabase
              .from('conversations')
              .update({
                last_message_at: new Date().toISOString(),
                unread_count: 1,
              })
              .eq('id', conversationId);
          } else {
            const { data: newConv } = await supabase
              .from('conversations')
              .insert({
                account_id: accountId,
                user_id: userId,
                contact_id: contactId,
                last_message_at: new Date().toISOString(),
                unread_count: 1,
              })
              .select('id')
              .single();
            if (newConv) conversationId = newConv.id;
          }

          if (conversationId) {
            // Realtime Inbound Message
            await supabase.from('messages').insert({
              account_id: accountId,
              conversation_id: conversationId,
              direction: 'inbound',
              sender_type: 'contact',
              content_text: `📬 Web Contact Inquiry\n\n📌 Topic: ${topic}\n👤 Name: ${name}\n📧 Email: ${email}\n📱 Phone: ${phone || 'Not provided'}\n\n💬 Message:\n${message}`,
              status: 'delivered',
            });
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
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry. Please try again.' },
      { status: 500 }
    );
  }
}
