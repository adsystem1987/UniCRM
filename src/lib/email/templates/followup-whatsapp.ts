/**
 * Touchpoint 2 (24h): Simple personal text check-in on WhatsApp Cloud API setup.
 *
 * Minimalist markup, pure text feel with standard hyperlinks.
 * Zero cards, zero background wrappers, zero emojis.
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
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #111827; background-color: #ffffff; margin: 0; padding: 20px;">
  <p>Hi ${safeName},</p>

  <p>I wanted to check in quickly and see if you had a chance to connect your WhatsApp number to UniCRM.</p>

  <p>Most users set this up in about three minutes by grabbing the credentials from Meta:</p>

  <p>
    1. Open <a href="https://developers.facebook.com" style="color: #2563eb; text-decoration: underline;">developers.facebook.com</a> and go to your WhatsApp app setup.<br>
    2. Copy your Phone Number ID and temporary Access Token.<br>
    3. Paste them into <a href="${dashboardUrl}" style="color: #2563eb; text-decoration: underline;">Settings &gt; WhatsApp</a> in UniCRM and click save.
  </p>

  <p>Meta's developer portal can sometimes be confusing with permissions or verification steps. If you run into any friction or error messages, feel free to reply directly to this email with details, and I will help you sort it out.</p>

  <p>If you prefer to have our team handle the entire Meta Business verification and number setup for you, you can request our Done-For-You assistance (Rs. 1,000/mo) here: <a href="${supportWhatsAppUrl}" style="color: #2563eb; text-decoration: underline;">${supportWhatsAppUrl}</a></p>

  <p>
    Best regards,<br>
    Ravi<br>
    GoToPerson, UniCRM<br>
    <a href="https://dfyunicrm.com" style="color: #2563eb; text-decoration: underline;">https://dfyunicrm.com</a>
  </p>
</body>
</html>`;
}
