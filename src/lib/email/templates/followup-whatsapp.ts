/**
 * Touchpoint 2 (24h): Natural, helpful 1-on-1 check-in on WhatsApp Cloud API setup.
 * Clean, human voice. No hype, no emojis.
 */

interface WhatsAppFollowupProps {
  name: string;
  dashboardUrl?: string;
  docsUrl?: string;
  supportWhatsAppUrl?: string;
}

export function renderWhatsAppFollowupEmailHtml({
  name,
  dashboardUrl = "https://dfyunicrm.com/dashboard/settings",
  docsUrl = "https://dfyunicrm.com",
  supportWhatsAppUrl = "https://dfyunicrm.com/contact",
}: WhatsAppFollowupProps): string {
  const safeName = name ? name.split(" ")[0] : "there";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quick check-in regarding WhatsApp setup</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; -webkit-font-smoothing: antialiased; line-height: 1.6;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; margin: 0; padding: 32px 16px;">
    <tr>
      <td align="left">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px;">
          
          <tr>
            <td style="font-size: 15px; color: #111827; padding-bottom: 16px;">
              Hi ${safeName},
            </td>
          </tr>

          <tr>
            <td style="font-size: 15px; color: #111827; padding-bottom: 16px;">
              I wanted to check in quickly and see if you had a chance to connect your WhatsApp number to UniCRM.
            </td>
          </tr>

          <tr>
            <td style="font-size: 15px; color: #111827; padding-bottom: 16px;">
              Most users set this up in about three minutes by grabbing the credentials from Meta:
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 20px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding: 6px 0; font-size: 15px; color: #374151; line-height: 1.5;">
                    1. Open developers.facebook.com and go to your WhatsApp app setup.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 15px; color: #374151; line-height: 1.5;">
                    2. Copy your Phone Number ID and temporary Access Token.
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 15px; color: #374151; line-height: 1.5;">
                    3. Paste them into <a href="${dashboardUrl}" style="color: #2563eb; text-decoration: underline;">Settings &gt; WhatsApp</a> in UniCRM and click save.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="font-size: 15px; color: #111827; padding-bottom: 16px;">
              Meta's portal can sometimes be finicky with permissions or verification screens. If you run into any friction or error codes, feel free to reply directly to this email with a screenshot, and I will help you sort it out.
            </td>
          </tr>

          <tr>
            <td style="border-left: 3px solid #e5e7eb; padding-left: 14px; font-size: 14px; color: #4b5563; line-height: 1.5; margin: 16px 0;">
              If you prefer to have us handle the entire Meta Business verification and number setup for you, you can request our <a href="${supportWhatsAppUrl}" style="color: #2563eb; text-decoration: underline;">Done-For-You assistance (Rs. 1,000/mo)</a>.
            </td>
          </tr>

          <tr>
            <td style="font-size: 15px; color: #111827; padding-top: 20px; padding-bottom: 24px;">
              Best regards,<br />
              <strong>Ravi</strong><br />
              <span style="color: #6b7280; font-size: 13px;">Founder, UniCRM</span>
            </td>
          </tr>

          <tr>
            <td style="border-top: 1px solid #f3f4f6; padding-top: 16px; font-size: 12px; color: #9ca3af; line-height: 1.4;">
              UniCRM &bull; <a href="https://dfyunicrm.com" style="color: #9ca3af; text-decoration: none;">dfyunicrm.com</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
