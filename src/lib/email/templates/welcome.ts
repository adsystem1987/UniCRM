/**
 * Pure Plain-Text-Style Email Template for UniCRM Welcome / Onboarding.
 *
 * Minimalist markup: default body font, clean paragraph breaks, standard text links.
 * Zero cards, zero background wrappers, zero tables, zero emojis.
 * Gmail, Outlook, and Apple Mail render this identically to an authentic 1-on-1 personal email.
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
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #111827; background-color: #ffffff; margin: 0; padding: 20px;">
  <p>Hi ${safeName},</p>

  <p>Thank you for signing up for UniCRM. Your workspace is active and ready to use.</p>

  <p>UniCRM is built to give your team direct WhatsApp messaging, contact management, and AI follow-up sequences without monthly software subscription fees.</p>

  <p>Three quick steps to get started:</p>

  <p>
    1. Connect WhatsApp: Go to <a href="${dashboardUrl}/settings" style="color: #2563eb; text-decoration: underline;">Settings &gt; WhatsApp</a> and enter your Meta Cloud credentials (or test number) to enable two-way chats.<br>
    2. Add Contacts: Upload a CSV list or use <a href="${dashboardUrl}/leads" style="color: #2563eb; text-decoration: underline;">Find Leads</a> to discover verified local business contacts.<br>
    3. Run a Sequence: Head to <a href="${dashboardUrl}/automations" style="color: #2563eb; text-decoration: underline;">Automations</a> to set up a basic outreach or qualifier flow.
  </p>

  <p>You can access your workspace here: <a href="${dashboardUrl}" style="color: #2563eb; text-decoration: underline;">${dashboardUrl}</a></p>

  <p>Optional note: The software itself is completely free. If you ever want our engineers to take care of the technical side—Meta verification, WhatsApp template approvals, and tailored AI campaigns—we offer hands-on assistance for Rs. 1,000/month. You can review the details here: <a href="${supportWhatsAppUrl}" style="color: #2563eb; text-decoration: underline;">${supportWhatsAppUrl}</a></p>

  <p>If you run into any questions or need help setting things up, just reply directly to this email. I read and answer every message personally.</p>

  <p>
    Best regards,<br>
    Ravi<br>
    GoToPerson, UniCRM<br>
    <a href="https://dfyunicrm.com" style="color: #2563eb; text-decoration: underline;">https://dfyunicrm.com</a>
  </p>
</body>
</html>`;
}
