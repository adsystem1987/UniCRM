/**
 * Touchpoint 3 (72h): Thoughtful, transparent explanation of Optional DFY Pro service.
 * Clean, personal founder voice. No hype, no pressure, zero emojis.
 */

interface DfyPitchEmailProps {
  name: string;
  upiId?: string;
  contactUrl?: string;
}

export function renderDfyPitchEmailHtml({
  name,
  upiId = "ravibabuche@oksbi",
  contactUrl = "https://dfyunicrm.com/contact",
}: DfyPitchEmailProps): string {
  const safeName = name ? name.split(" ")[0] : "there";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Optional hands-on help with your setup</title>
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
              I wanted to write a brief note to clarify how we work and offer help if you need it.
            </td>
          </tr>

          <tr>
            <td style="font-size: 15px; color: #111827; padding-bottom: 16px;">
              First, the UniCRM software is completely free. We do not charge per-seat fees or lock CRM capabilities behind paywalls. You can self-host or use our platform indefinitely at no cost.
            </td>
          </tr>

          <tr>
            <td style="font-size: 15px; color: #111827; padding-bottom: 16px;">
              However, many teams simply prefer not to spend their weekends dealing with technical setup: Meta developer accounts, business document verification, WhatsApp webhook endpoints, template rejections, or Spintax outreach sequences.
            </td>
          </tr>

          <tr>
            <td style="font-size: 15px; color: #111827; padding-bottom: 16px;">
              For those teams, our engineers provide complete hands-on setup for <strong>Rs. 1,000/month</strong>:
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 20px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 14px; color: #374151; line-height: 1.5;">
                    &bull; End-to-end Meta Business Manager verification & phone registration
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 14px; color: #374151; line-height: 1.5;">
                    &bull; WhatsApp template drafting, policy review, and submission
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 14px; color: #374151; line-height: 1.5;">
                    &bull; Custom AI qualification and automated follow-up sequences
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 14px; color: #374151; line-height: 1.5;">
                    &bull; Direct technical support via WhatsApp whenever something breaks
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="font-size: 15px; color: #111827; padding-bottom: 16px;">
              There is no long-term contract or setup fee—it is month-to-month and can be stopped at any time with a single message.
            </td>
          </tr>

          <tr>
            <td style="padding-bottom: 20px;">
              <div style="font-size: 14px; color: #4b5563;">
                If you would like us to take this off your plate, you can reach out via our <a href="${contactUrl}" style="color: #2563eb; text-decoration: underline;">support page</a> or reply directly to this email with what you are looking to build.
              </div>
            </td>
          </tr>

          <tr>
            <td style="font-size: 15px; color: #111827; padding-top: 10px; padding-bottom: 24px;">
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
