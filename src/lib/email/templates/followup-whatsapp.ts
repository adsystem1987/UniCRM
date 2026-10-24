/**
 * Touchpoint 2 (24h): Modern Clean Typography WhatsApp check-in.
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quick check-in regarding WhatsApp setup</title>
</head>
<body style="margin: 0; padding: 36px 20px; background-color: #ffffff; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.65; color: #18181b; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 560px; margin: 0 auto;">
    
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #18181b;">Hi ${safeName},</p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #18181b;">I wanted to check in quickly and see if you had a chance to connect your WhatsApp number to UniCRM.</p>

    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #18181b;">Most users set this up in about three minutes by grabbing the credentials from Meta:</p>

    <p style="margin: 0 0 18px 0; font-size: 14px; color: #27272a; padding-left: 4px;">
      1. Open <a href="https://developers.facebook.com" style="color: #2563eb; text-decoration: underline;">developers.facebook.com</a> and go to your WhatsApp app setup.<br>
      2. Copy your Phone Number ID and temporary Access Token.<br>
      3. Paste them into <a href="${dashboardUrl}" style="color: #2563eb; text-decoration: underline;">Settings &gt; WhatsApp</a> in UniCRM and click save.
    </p>

    <p style="margin: 0 0 18px 0; font-size: 14px; color: #18181b;">Meta's developer portal can sometimes be confusing with permissions or verification steps. If you run into any friction or error messages, feel free to reply directly to this email with details, and I will help you sort it out.</p>

    <p style="margin: 0 0 20px 0; font-size: 13.5px; color: #52525b; line-height: 1.6; border-left: 2px solid #e4e4e7; padding-left: 14px;">
      If you prefer to have our team handle the entire Meta Business verification and number setup for you, you can request our Done-For-You assistance (Rs. 1,000/mo) here: <a href="${supportWhatsAppUrl}" style="color: #2563eb; text-decoration: underline;">${supportWhatsAppUrl}</a>
    </p>

    <p style="margin: 0; font-size: 14px; color: #18181b; line-height: 1.5;">
      Best regards,<br>
      <strong>Ravi</strong><br>
      <span style="color: #71717a; font-size: 13px;">GoToPerson, UniCRM</span><br>
      <a href="https://dfyunicrm.com" style="color: #2563eb; text-decoration: underline; font-size: 13px;">https://dfyunicrm.com</a>
    </p>

  </div>
</body>
</html>`;
}
