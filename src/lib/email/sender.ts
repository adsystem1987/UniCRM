import { renderWelcomeEmailHtml } from "./templates/welcome";

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
  const unitpostKey = process.env.UNITPOST_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;

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
        const res = await fetch("https://www.unitpost.com/api/v1/email", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${unitpostKey.trim()}`,
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
    subject: `Welcome to UniCRM — Your Free Workspace is Ready 🚀`,
    html,
    text: `Hi ${name},\n\nWelcome to UniCRM! Your free omnichannel workspace is live at https://dfyunicrm.com/dashboard.\n\n3 quick steps to get started:\n1. Connect WhatsApp Cloud API in Settings\n2. Import contacts or use Find Leads\n3. Launch your first automated sequence in Automations.\n\nNeed technical setup assistance? Our Optional Done-For-You (DFY) Pro Help is available at https://dfyunicrm.com/contact.\n\nBest regards,\nThe UniCRM Team`,
  });
}
