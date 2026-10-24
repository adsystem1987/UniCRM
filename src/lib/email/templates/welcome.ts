/**
 * Human, Plain-Text-Style High-Trust HTML Email Template for UniCRM.
 * Zero marketing fluff, zero emojis/artificial icons, maximum deliverability.
 * Looks like a thoughtful personal email sent directly from Ravi's mailbox.
 */

interface WelcomeEmailProps {
  name: string;
  dashboardUrl?: string;
  supportWhatsAppUrl?: string;
}

export function renderWelcomeEmailHtml({
  name,
  dashboardUrl = "https://dfyunicrm.com/dashboard",
  supportWhatsAppUrl = "https://dfyunicrm.com/contact",
}: WelcomeEmailProps): string {
  const safeName = name ? name.split(" ")[0] : "there";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to UniCRM</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; -webkit-font-smoothing: antialiased; line-height: 1.6;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; margin: 0; padding: 32px 16px;">
    <tr>
      <td align="left">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px;">
          
          <!-- Greeting -->
          <tr>
            <td style="font-size: 15px; color: #111827; padding-bottom: 16px;">
              Hi ${safeName},
            </td>
          </tr>

          <!-- Core Message -->
          <tr>
            <td style="font-size: 15px; color: #111827; padding-bottom: 16px;">
              Thank you for signing up for UniCRM. Your workspace is active and ready to use.
            </td>
          </tr>

          <tr>
            <td style="font-size: 15px; color: #111827; padding-bottom: 20px;">
              UniCRM is built to give your team direct WhatsApp messaging, contact management, and AI follow-up sequences without monthly software subscription fees.
            </td>
          </tr>

          <!-- Steps with Clean Spacing -->
          <tr>
            <td style="font-size: 15px; color: #111827; padding-bottom: 8px;">
              <strong>Three quick steps to get started:</strong>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td valign="top" style="padding-top: 8px; padding-bottom: 8px; font-size: 15px; color: #374151; line-height: 1.5;">
                    <strong>1. Connect WhatsApp:</strong> Go to Settings &gt; WhatsApp and enter your Meta Cloud credentials (or test number) to enable two-way chats.
                  </td>
                </tr>
                <tr>
                  <td valign="top" style="padding-top: 8px; padding-bottom: 8px; font-size: 15px; color: #374151; line-height: 1.5;">
                    <strong>2. Add Contacts:</strong> Upload a CSV list or use Find Leads to discover verified local business contacts.
                  </td>
                </tr>
                <tr>
                  <td valign="top" style="padding-top: 8px; padding-bottom: 8px; font-size: 15px; color: #374151; line-height: 1.5;">
                    <strong>3. Run a Sequence:</strong> Head to Automations to set up a basic outreach or qualifier flow.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Link / CTA -->
          <tr>
            <td style="padding-bottom: 24px;">
              <a href="${dashboardUrl}" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 6px;">
                Open your workspace
              </a>
            </td>
          </tr>

          <!-- Transparent Note on DFY Help -->
          <tr>
            <td style="border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 18px 0; margin-bottom: 20px;">
              <div style="font-size: 14px; color: #4b5563; line-height: 1.55;">
                <strong style="color: #111827;">Optional note:</strong> The software itself is completely free. If you ever want our engineers to take care of the technical side—Meta verification, WhatsApp template approvals, and tailored AI campaigns—we offer hands-on assistance for Rs. 1,000/month. You can check details <a href="${supportWhatsAppUrl}" style="color: #2563eb; text-decoration: underline;">here</a>.
              </div>
            </td>
          </tr>

          <!-- Human Sign-off -->
          <tr>
            <td style="font-size: 15px; color: #111827; padding-top: 20px; padding-bottom: 16px;">
              If you run into any questions or need help setting things up, just reply directly to this email. I read and answer every message personally.
            </td>
          </tr>

          <tr>
            <td style="font-size: 15px; color: #111827; padding-bottom: 24px;">
              Best regards,<br />
              <strong>Ravi</strong><br />
              <span style="color: #6b7280; font-size: 13px;">Founder, UniCRM (dfyunicrm.com)</span>
            </td>
          </tr>

          <!-- Subtle Footer -->
          <tr>
            <td style="border-top: 1px solid #f3f4f6; padding-top: 16px; font-size: 12px; color: #9ca3af; line-height: 1.4;">
              UniCRM &bull; <a href="https://dfyunicrm.com" style="color: #9ca3af; text-decoration: none;">dfyunicrm.com</a> &bull;
              You received this email because you signed up for an account on UniCRM.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
