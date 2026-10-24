/**
 * High-converting, responsive HTML Welcome Email template for UniCRM.
 * Built for universal client compatibility (Apple Mail, Gmail, Outlook, Mobile/Desktop).
 */

interface WelcomeEmailProps {
  name: string;
  dashboardUrl?: string;
  supportWhatsAppUrl?: string;
}

export function renderWelcomeEmailHtml({
  name,
  dashboardUrl = "https://dfyunicrm.com/dashboard",
  supportWhatsAppUrl = "https://wa.me/919876543210?text=Hi%20UniCRM%20Team,%20I%20just%20signed%20up%20and%20need%20assistance",
}: WelcomeEmailProps): string {
  const safeName = name ? name.split(" ")[0] : "there";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to UniCRM</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0d0d0d;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #eaeaea;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background-color: #141414;
      border: 1px solid #262626;
      border-radius: 20px;
      padding: 36px 32px;
    }
    .logo-badge {
      display: inline-block;
      background-color: #1f1f1f;
      border: 1px solid #333333;
      border-radius: 12px;
      padding: 8px 14px;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin-bottom: 24px;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin: 0 0 16px 0;
      line-height: 1.25;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #a0a0a0;
      margin: 0 0 18px 0;
    }
    .highlight {
      color: #ffffff;
      font-weight: 600;
    }
    .step-box {
      background-color: #191919;
      border: 1px solid #292929;
      border-radius: 14px;
      padding: 16px 18px;
      margin-bottom: 12px;
    }
    .step-num {
      display: inline-block;
      background-color: #262626;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 20px;
      margin-right: 8px;
    }
    .step-title {
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
    }
    .step-desc {
      font-size: 13px;
      color: #8e8e8e;
      margin: 6px 0 0 0;
      line-height: 1.45;
    }
    .cta-btn {
      display: inline-block;
      background-color: #ffffff;
      color: #000000 !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      padding: 14px 28px;
      border-radius: 30px;
      margin: 24px 0 12px 0;
      text-align: center;
    }
    .dfy-box {
      margin-top: 28px;
      padding: 20px 22px;
      background-color: #121714;
      border: 1px solid #1f3629;
      border-radius: 16px;
    }
    .dfy-tag {
      display: inline-block;
      background-color: #163825;
      color: #42b991;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 10px;
      border-radius: 20px;
      margin-bottom: 10px;
    }
    .dfy-title {
      font-size: 15px;
      font-weight: 700;
      color: #e6f7ef;
      margin: 0 0 6px 0;
    }
    .dfy-desc {
      font-size: 13px;
      color: #92bfa9;
      line-height: 1.5;
      margin: 0;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      font-size: 12px;
      color: #666666;
      line-height: 1.6;
    }
    .footer a {
      color: #888888;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo-badge">⚡ UniCRM</div>
      
      <h1>Welcome aboard, ${safeName}! 🚀</h1>
      <p>
        Thank you for creating your workspace on <span class="highlight">UniCRM</span>. Your account is active, verified, and ready for you and your team.
      </p>
      <p>
        UniCRM gives you all-in-one WhatsApp messaging, verified calling, contact management, and autonomous AI sequences with <strong>zero software subscriptions</strong>.
      </p>

      <div style="margin: 24px 0 16px 0;">
        <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #888888; margin-bottom: 12px;">
          3 Quick Steps to Get Started:
        </div>

        <div class="step-box">
          <div><span class="step-num">01</span><span class="step-title">Connect WhatsApp Cloud API</span></div>
          <p class="step-desc">Head to <strong>Settings → WhatsApp</strong> and add your Meta Cloud credentials (or use your test number) to enable live two-way chats.</p>
        </div>

        <div class="step-box">
          <div><span class="step-num">02</span><span class="step-title">Import Contacts or Find Leads</span></div>
          <p class="step-desc">Upload your customer list via CSV or discover high-intent local business contacts using our integrated <strong>Find Leads</strong> tool.</p>
        </div>

        <div class="step-box">
          <div><span class="step-num">03</span><span class="step-title">Activate Your First AI Sequence</span></div>
          <p class="step-desc">Visit <strong>Automations</strong> and launch the <em>UniCRM Omnichannel Drip & AI Agent Qualifier</em> to engage leads automatically.</p>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="cta-btn" target="_blank">Open My Workspace &rarr;</a>
      </div>

      <!-- Optional Done-For-You Pro Assistance Box -->
      <div class="dfy-box">
        <span class="dfy-tag">100% Optional Service</span>
        <div class="dfy-title">Prefer our team to handle the technical setup?</div>
        <p class="dfy-desc">
          UniCRM software is 100% free forever. If you want our engineers to handle your Meta Developer account, business verification, WhatsApp template approvals, and custom sequences, you can request our <strong>Optional Done-For-You (DFY) Pro Help for ₹1,000/month</strong>.
        </p>
        <div style="margin-top: 10px;">
          <a href="https://dfyunicrm.com/contact" style="color: #42b991; font-weight: 700; font-size: 13px; text-decoration: underline;" target="_blank">
            Learn more about Optional DFY Setup &rarr;
          </a>
        </div>
      </div>

      <p style="margin-top: 24px; font-size: 14px; color: #888888;">
        Need any help or have a question? Simply reply directly to this email—our founders read and respond to every message.
      </p>

      <p style="margin: 0; font-size: 14px; color: #ffffff; font-weight: 600;">
        — The UniCRM Team
      </p>
    </div>

    <div class="footer">
      <p>
        Sent with ❤️ by <strong>UniCRM</strong> • Open Omnichannel CRM & Automation Platform<br>
        <a href="${dashboardUrl}">Dashboard</a> • <a href="https://dfyunicrm.com">Website</a> • <a href="https://dfyunicrm.com/contact">Support</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
