/**
 * Touchpoint 3 (72h): Simple personal text explaining Optional DFY Pro service.
 *
 * Minimalist markup, pure text feel with standard hyperlinks.
 * Zero cards, zero background wrappers, zero emojis.
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

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #111827; background-color: #ffffff; margin: 0; padding: 20px;">
  <p>Hi ${safeName},</p>

  <p>I wanted to write a brief note to clarify how we work and offer help if you need it.</p>

  <p>First, the UniCRM software is completely free. We do not charge per-seat fees or lock CRM capabilities behind paywalls. You can use our platform indefinitely at no cost.</p>

  <p>However, many teams simply prefer not to spend their time dealing with technical setup: Meta developer accounts, business document verification, WhatsApp webhook endpoints, template rejections, or Spintax outreach sequences.</p>

  <p>For those teams, our engineers provide complete hands-on setup for Rs. 1,000/month:</p>

  <p>
    - End-to-end Meta Business Manager verification &amp; phone registration<br>
    - WhatsApp template drafting, policy review, and submission<br>
    - Custom AI qualification and automated follow-up sequences<br>
    - Direct technical support via WhatsApp whenever something breaks
  </p>

  <p>There is no long-term contract or setup fee—it is month-to-month and can be stopped at any time with a single message.</p>

  <p>If you would like us to take this off your plate, you can reach out via our support page at <a href="${contactUrl}" style="color: #2563eb; text-decoration: underline;">${contactUrl}</a> or reply directly to this email with what you are looking to build.</p>

  <p>
    Best regards,<br>
    Ravi<br>
    GoToPerson, UniCRM<br>
    <a href="https://dfyunicrm.com" style="color: #2563eb; text-decoration: underline;">https://dfyunicrm.com</a>
  </p>
</body>
</html>`;
}
