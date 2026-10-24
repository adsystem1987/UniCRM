/**
 * Modern Clean Typography Email Template for UniCRM.
 *
 * Typography & Styling Spec:
 * - Font: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
 * - Sizing: 14px / 1.65 line-height for crisp reading
 * - Colors: #18181b (dark zinc / high readability), muted text #71717a
 * - Links: subtle blue #2563eb with gentle underline
 * - Layout: single column, max 560px, comfortable whitespace
 * - Strict zero emojis, zero badges, zero cards
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to UniCRM</title>
</head>
<body style="margin: 0; padding: 36px 20px; background-color: #ffffff; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.65; color: #18181b; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 560px; margin: 0 auto;">
    
    <p style="margin: 0 0 16px 0; font-size: 14px; color: #18181b;">Hi ${safeName},</p>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #18181b;">Thank you for signing up for UniCRM. Your workspace is active and ready to use.</p>

    <p style="margin: 0 0 18px 0; font-size: 14px; color: #18181b;">UniCRM is designed to give your team direct WhatsApp messaging, contact management, and AI follow-up sequences without monthly software subscription fees.</p>

    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #18181b;">Three quick steps to get started:</p>

    <p style="margin: 0 0 18px 0; font-size: 14px; color: #27272a; padding-left: 4px;">
      1. Connect WhatsApp: Go to <a href="${dashboardUrl}/settings" style="color: #2563eb; text-decoration: underline;">Settings &gt; WhatsApp</a> and enter your Meta Cloud credentials (or test number) to enable two-way chats.<br>
      2. Add Contacts: Upload a CSV list or use <a href="${dashboardUrl}/leads" style="color: #2563eb; text-decoration: underline;">Find Leads</a> to discover verified local business contacts.<br>
      3. Run a Sequence: Head to <a href="${dashboardUrl}/automations" style="color: #2563eb; text-decoration: underline;">Automations</a> to set up a basic outreach or qualifier flow.
    </p>

    <p style="margin: 0 0 20px 0; font-size: 14px; color: #18181b;">
      You can access your workspace here: <a href="${dashboardUrl}" style="color: #2563eb; text-decoration: underline; font-weight: 500;">${dashboardUrl}</a>
    </p>

    <p style="margin: 0 0 20px 0; font-size: 13.5px; color: #52525b; line-height: 1.6; border-left: 2px solid #e4e4e7; padding-left: 14px;">
      <strong style="color: #18181b;">Optional note:</strong> The software itself is completely free. If you ever want our engineers to take care of the technical side—Meta verification, WhatsApp template approvals, and tailored AI campaigns—we offer hands-on assistance for Rs. 1,000/month. You can review the details here: <a href="${supportWhatsAppUrl}" style="color: #2563eb; text-decoration: underline;">${supportWhatsAppUrl}</a>
    </p>

    <p style="margin: 0 0 24px 0; font-size: 14px; color: #18181b;">
      If you run into any questions or need help setting things up, just reply directly to this email. I read and answer every message personally.
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
