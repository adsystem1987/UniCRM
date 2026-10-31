export interface RenderInviteEmailParams {
  businessName: string;
  contactName?: string;
  category?: string;
  city?: string;
  pageUrl: string;
  claimUrl: string;
  optOutUrl: string;
  token?: string;
}

const CATEGORY_MAP: Record<string, string> = {
  loan_provider: "financial and loan",
  loans: "loan and credit",
  real_estate: "real estate and property",
  property: "property consultancy",
  insurance: "insurance consultancy",
  legal: "legal and advisory",
  tax: "accounting and tax",
  coaching: "coaching and education",
  education: "educational",
  marketing: "digital marketing",
  healthcare: "healthcare and clinic",
  salon: "salon and wellness",
  travel: "travel and tour",
  solar: "solar energy installation",
  contractor: "renovation and contracting",
};

export function renderWorkspaceInviteEmailHtml(params: RenderInviteEmailParams): string {
  const greeting = params.contactName ? `Hi ${params.contactName},` : "Hello,";
  const rawCategory = params.category?.toLowerCase() || "general";
  const categoryLabel = CATEGORY_MAP[rawCategory] || params.category?.replace(/_/g, " ") || "professional";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Free UniCRM Workspace is Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 36px; text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
                UniCRM Core
              </h1>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">
                100% Free Lead Capture & WhatsApp Inbox Platform
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 36px 24px 36px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
                ${greeting}
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #334155;">
                We noticed <strong>${params.businessName}</strong> provides ${categoryLabel} services${params.city ? ` in ${params.city}` : ""}. 
                To help you stop losing customer inquiries in scattered personal chats, we have pre-configured a <strong>100% free DFY UniCRM workspace</strong> reserved exclusively for your business.
              </p>

              <!-- Why DFY UniCRM is Useful Section -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #0f172a;">
                  Why DFY UniCRM helps your business grow:
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; line-height: 22px; color: #475569;">
                  <li><strong>All Leads in One Inbox:</strong> Capture inquiries from WhatsApp, your website, Google, and Meta ads into a single organized desk.</li>
                  <li><strong>Multi-Agent Team Access:</strong> Assign incoming customer chats to team members with zero seat charges or monthly fees.</li>
                  <li><strong>Instant Auto-Followups:</strong> Automatically greet prospects and reply 24/7 so hot leads never go cold.</li>
                  <li><strong>Free Verified Micro-Page:</strong> A ready-made digital showcase to share with clients for direct WhatsApp bookings.</li>
                </ul>
              </div>

              <!-- Workspace Details Card -->
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569;">
                  🏢 <strong>Reserved Workspace:</strong> ${params.businessName}
                </p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #475569;">
                  🌐 <strong>Your Live Micro-Page:</strong> <a href="${params.pageUrl}" style="color: #2563eb; text-decoration: none;" target="_blank">${params.pageUrl}</a>
                </p>
                <p style="margin: 0; font-size: 14px; color: #475569;">
                  🎁 <strong>Pricing:</strong> 100% Free Forever (No subscription, no credit card required)
                </p>
              </div>

              <!-- Primary CTA: Claim Workspace -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${params.claimUrl}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);">
                      👉 Claim & Activate Your Free Workspace
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 20px; color: #64748b;">
                * Claiming takes less than 30 seconds: simply set your private password to start managing client leads.
              </p>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 20px 0;">

              <!-- Secondary Opt-Out Notice -->
              <p style="margin: 0; font-size: 12px; line-height: 18px; color: #94a3b8; text-align: center;">
                Not interested or prefer your business profile removed?<br>
                Click below to immediately delete this listing and permanently unsubscribe:
              </p>
              <p style="margin: 8px 0 0 0; text-align: center;">
                <a href="${params.optOutUrl}" style="color: #ef4444; font-size: 12px; text-decoration: underline;">
                  Delete My Profile & Opt-Out
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 36px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                UniCRM Platform • Bangalore, India • <a href="https://dfyunicrm.com" style="color: #64748b; text-decoration: none;">dfyunicrm.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  ${params.token ? `<img src="https://dfyunicrm.com/api/email/track/open?token=${encodeURIComponent(params.token)}" width="1" height="1" alt="" style="display:none;width:1px;height:1px;max-height:1px;max-width:1px;opacity:0;border:none;" />` : ""}
</body>
</html>
  `.trim();
}
