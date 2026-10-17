// ============================================================
// Slack Notification Service
//
// Sends real-time alerts to a Slack channel via Slack Bot Token.
// Used for:
//   - New user registrations / signups
//   - Inbound contact form leads
//   - Critical system events
// ============================================================

interface SlackMessagePayload {
  text: string;
  blocks?: Array<Record<string, unknown>>;
  channel?: string;
}

interface SignupNotificationParams {
  name?: string | null;
  email?: string | null;
  provider?: string;
  userId?: string;
  inviteToken?: string | null;
}

interface ContactLeadNotificationParams {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}

/**
 * Send an arbitrary message or block layout to Slack.
 */
export async function sendSlackMessage({
  text,
  blocks,
  channel,
}: SlackMessagePayload): Promise<boolean> {
  const token = process.env.SLACK_BOT_TOKEN;
  const targetChannel = channel || process.env.SLACK_CHANNEL;

  if (!token) {
    console.warn("[Slack] SLACK_BOT_TOKEN is not configured. Notification skipped.");
    return false;
  }

  if (!targetChannel) {
    console.warn("[Slack] SLACK_CHANNEL is not configured. Notification skipped.");
    return false;
  }

  try {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        channel: targetChannel,
        text,
        ...(blocks ? { blocks } : {}),
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!data.ok) {
      console.error("[Slack] chat.postMessage failed:", data.error || data);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Slack] Network error posting to Slack:", err);
    return false;
  }
}

/**
 * Notify Slack when a new user completes signup on UniCRM.
 */
export async function notifySlackNewSignup({
  name,
  email,
  provider = "Google OAuth",
  userId,
  inviteToken,
}: SignupNotificationParams): Promise<boolean> {
  const displayName = name?.trim() || "New User";
  const displayEmail = email || "No email provided";
  const signupType = inviteToken ? "Team Invite" : "Direct Registration";

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🎉 New UniCRM User Signup",
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Name:*\n${displayName}`,
        },
        {
          type: "mrkdwn",
          text: `*Email:*\n<mailto:${displayEmail}|${displayEmail}>`,
        },
        {
          type: "mrkdwn",
          text: `*Auth Provider:*\n${provider}`,
        },
        {
          type: "mrkdwn",
          text: `*Signup Type:*\n${signupType}`,
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `⚡ *UniCRM System Alert* | User ID: \`${userId || "unknown"}\` | ${new Date().toISOString()}`,
        },
      ],
    },
  ];

  return sendSlackMessage({
    text: `🎉 New User Signup: ${displayName} (${displayEmail}) via ${provider}`,
    blocks,
  });
}

/**
 * Notify Slack when a visitor submits a contact/demo request on the landing page.
 */
export async function notifySlackContactLead({
  name,
  email,
  phone,
  message,
}: ContactLeadNotificationParams): Promise<boolean> {
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "📥 New Landing Page Contact Lead",
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Name:*\n${name}`,
        },
        {
          type: "mrkdwn",
          text: `*Email:*\n<mailto:${email}|${email}>`,
        },
        {
          type: "mrkdwn",
          text: `*Phone:*\n${phone || "Not provided"}`,
        },
        {
          type: "mrkdwn",
          text: `*Submitted:*\n${new Date().toLocaleTimeString()}`,
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Message:*\n>${message.replace(/\n/g, "\n>")}`,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "💬 *Landing Page Form Ingestion* | Added to CRM Inbox",
        },
      ],
    },
  ];

  return sendSlackMessage({
    text: `📥 New Contact Form Lead: ${name} (${email}) - "${message.slice(0, 80)}"`,
    blocks,
  });
}

export interface OrderNotificationParams {
  orderNumber: string;
  itemName: string;
  amount: number;
  currency?: string;
  utrNumber?: string | null;
  whatsappPhone: string;
  niche?: string;
  city?: string;
  userEmail?: string | null;
}

/**
 * Send an alert to Slack when an order is submitted with UPI / UTR.
 */
export async function sendOrderNotification({
  orderNumber,
  itemName,
  amount,
  currency = "INR",
  utrNumber,
  whatsappPhone,
  niche,
  city,
  userEmail,
}: OrderNotificationParams): Promise<boolean> {
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "💰 New Payment Received (Zero-Gateway UPI)",
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Order:* \`${orderNumber}\``,
        },
        {
          type: "mrkdwn",
          text: `*Amount:* *₹${amount}* (${currency})`,
        },
        {
          type: "mrkdwn",
          text: `*Item:* ${itemName}`,
        },
        {
          type: "mrkdwn",
          text: `*UTR / Ref:* \`${utrNumber || "NOT PROVIDED"}\``,
        },
        {
          type: "mrkdwn",
          text: `*Customer WhatsApp:* ${whatsappPhone}`,
        },
        {
          type: "mrkdwn",
          text: `*Target:* ${niche || "All"} (${city || "All India"})`,
        },
      ],
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `👤 Ordered by: ${userEmail || "Anonymous"} | Status: *Pending Bank Verification*`,
        },
      ],
    },
  ];

  return sendSlackMessage({
    text: `💰 Payment Alert: ${orderNumber} - ₹${amount} for ${itemName} (UTR: ${utrNumber || "N/A"}) from ${whatsappPhone}`,
    blocks,
  });
}

