import { renderWelcomeEmailHtml } from "./templates/welcome";
import { renderWhatsAppFollowupEmailHtml } from "./templates/followup-whatsapp";
import { renderDfyPitchEmailHtml } from "./templates/dfy-pitch";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResponse {
  success: boolean;
  id?: string;
  error?: string;
  provider?: "unitpost" | "resend" | "none";
}

/**
 * Universal transactional email sender for UniCRM.
 * Routes through Unitpost (verified domain mail.dfyunicrm.com) or Resend fallback.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResponse> {
  const unitpostKey =
    process.env.UNITPOST_API_KEY?.trim() ||
    process.env.UNITPOST_KEY?.trim() ||
    process.env.UNIT_POST_API_KEY?.trim();
  const resendKey = process.env.RESEND_API_KEY?.trim();

  const defaultFrom =
    opts.from ||
    process.env.UNITPOST_FROM ||
    process.env.RESEND_FROM ||
    "UniCRM <hello@mail.dfyunicrm.com>";

  const recipients = Array.isArray(opts.to) ? opts.to : [opts.to];

  // 1. Primary: Unitpost API (mail.dfyunicrm.com)
  if (unitpostKey) {
    try {
      let lastId = "";
      for (const recipient of recipients) {
        console.log(`[Email/Unitpost] Sending to ${recipient} from ${defaultFrom}...`);
        const res = await fetch("https://www.unitpost.com/api/v1/email", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${unitpostKey}`,
            "Content-Type": "application/json",
            "User-Agent": "UniCRM-App/1.0",
          },
          body: JSON.stringify({
            from: defaultFrom,
            to: recipient,
            subject: opts.subject,
            html: opts.html,
            ...(opts.text ? { text: opts.text } : {}),
            ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error(`[Email/Unitpost] Error (${res.status}):`, errText);
          return { success: false, error: `Unitpost HTTP ${res.status}: ${errText}`, provider: "unitpost" };
        }

        const data = await res.json().catch(() => ({}));
        lastId = (data.id || data.message_id || "") as string;
        console.log(`[Email/Unitpost] Successfully delivered to ${recipient}! ID: ${lastId}`);
      }
      return { success: true, id: lastId, provider: "unitpost" };
    } catch (err: any) {
      console.error("[Email/Unitpost] Network error:", err);
      // Fall through to secondary provider if available
    }
  }

  // 2. Secondary: Resend API
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: defaultFrom,
          to: recipients,
          subject: opts.subject,
          html: opts.html,
          ...(opts.text ? { text: opts.text } : {}),
          ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Email/Resend] Error (${res.status}):`, errText);
        return { success: false, error: `Resend HTTP ${res.status}: ${errText}`, provider: "resend" };
      }

      const data = await res.json().catch(() => ({}));
      return { success: true, id: data.id, provider: "resend" };
    } catch (err: any) {
      console.error("[Email/Resend] Network error:", err);
      return { success: false, error: err.message, provider: "resend" };
    }
  }

  console.warn("[Email] No email provider configured (missing UNITPOST_API_KEY and RESEND_API_KEY)");
  return { success: false, error: "No email provider configured", provider: "none" };
}

/**
 * Sends the branded Welcome & Onboarding Email to a newly registered user.
 */
export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}): Promise<SendEmailResponse> {
  const html = renderWelcomeEmailHtml({
    name,
    dashboardUrl: "https://dfyunicrm.com/dashboard",
  });

  return sendEmail({
    to,
    subject: `Welcome to UniCRM — your workspace is ready`,
    html,
    text: `Hi ${name},\n\nThank you for signing up for UniCRM. Your workspace is active and ready to use at https://dfyunicrm.com/dashboard.\n\nThree quick steps to get started:\n1. Connect WhatsApp in Settings > WhatsApp\n2. Add contacts via CSV or Find Leads\n3. Set up an outreach sequence in Automations\n\nIf you have any questions or want our team to handle the technical setup (Rs. 1,000/mo), feel free to reply directly to this email.\n\nBest regards,\nRavi\nFounder, UniCRM`,
  });
}

/**
 * Sends Touchpoint 2: WhatsApp Cloud API connection guide (24h follow-up).
 */
export async function sendWhatsAppFollowupEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}): Promise<SendEmailResponse> {
  const html = renderWhatsAppFollowupEmailHtml({
    name,
    dashboardUrl: "https://dfyunicrm.com/dashboard/settings",
    supportWhatsAppUrl: "https://dfyunicrm.com/contact",
  });

  return sendEmail({
    to,
    subject: `Quick check-in regarding WhatsApp setup on UniCRM`,
    html,
    text: `Hi ${name},\n\nI wanted to check in quickly and see if you had a chance to connect your WhatsApp number to UniCRM.\n\nMost users set this up in about three minutes in Settings > WhatsApp using Meta Developer credentials.\n\nIf you run into any friction or error codes, just reply to this email and I will help you sort it out.\n\nBest regards,\nRavi\nFounder, UniCRM`,
  });
}

/**
 * Sends Touchpoint 3: Done-For-You (DFY) Pro Setup pitch (72h follow-up).
 */
export async function sendDfyPitchEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}): Promise<SendEmailResponse> {
  const html = renderDfyPitchEmailHtml({
    name,
    upiId: "ravibabuche@oksbi",
    contactUrl: "https://dfyunicrm.com/contact",
  });

  return sendEmail({
    to,
    subject: `Optional hands-on help with your UniCRM setup`,
    html,
    text: `Hi ${name},\n\nI wanted to write a brief note to clarify how we work and offer help if you need it.\n\nUniCRM software is 100% free forever. If your team would prefer not to spend time on Meta verification, WhatsApp template approvals, or AI sequence setup, our engineers handle everything for Rs. 1,000/month.\n\nCancel anytime with zero lock-in.\n\nIf you would like us to take this off your plate, learn more at https://dfyunicrm.com/contact or reply directly to this email.\n\nBest regards,\nRavi\nFounder, UniCRM`,
  });
}

