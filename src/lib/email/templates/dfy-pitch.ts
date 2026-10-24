/**
 * Touchpoint 3 (72h): Modern Clean Typography Optional DFY Pro Note.
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
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Optional hands-on help with your setup</title>
</head>
<body style="margin: 0; padding: 36px 20px; background-color: #ffffff; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.65; color: #18181b; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 560px; margin: 0 auto;">
    
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #18181b;">Hi ${safeName},</p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #18181b;">I wanted to write a brief note to clarify how we work and offer help if you need it.</p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #18181b;">First, the UniCRM software is completely free. We do not charge per-seat fees or lock CRM capabilities behind paywalls. You can use our platform indefinitely at no cost.</p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #18181b;">However, many teams simply prefer not to spend their time dealing with technical setup: Meta developer accounts, business document verification, WhatsApp webhook endpoints, template rejections, or Spintax outreach sequences.</p>

    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #18181b;">For those teams, our engineers provide complete hands-on setup for Rs. 1,000/month:</p>

    <div style="background-color: #fbfbfa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 14px 16px; margin: 0 0 18px 0; font-size: 13.5px; line-height: 1.6; color: #27272a;">
      &bull; End-to-end Meta Business Manager verification &amp; phone registration<br>
      &bull; WhatsApp template drafting, policy review, and submission<br>
      &bull; Custom AI qualification and automated follow-up sequences<br>
      &bull; Direct technical support via WhatsApp whenever something breaks
    </div>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #18181b;">There is no long-term contract or setup fee—it is month-to-month and can be stopped at any time with a single message.</p>

    <p style="margin: 0 0 24px 0; font-size: 14px; color: #18181b;">
      If you would like us to take this off your plate, you can reach out via our support page at <a href="${contactUrl}" style="color: #2563eb; text-decoration: underline;">${contactUrl}</a> or reply directly to this email with what you are looking to build.
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
