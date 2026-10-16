import { decrypt } from "@/lib/whatsapp/encryption";
import { getGoogleDriveCredentials } from "@/lib/gdrive/client";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

export function getGmailOAuthUrl(state: string, redirectUri: string): string {
  const { clientId } = getGoogleDriveCredentials();
  if (!clientId) {
    throw new Error(
      "GOOGLE_CLIENT_ID is not configured in environment variables. Please add it to Vercel."
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GMAIL_SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGmailCode(
  code: string,
  redirectUri: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const { clientId, clientSecret } = getGoogleDriveCredentials();
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing.");
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || "Failed to exchange Gmail OAuth code");
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || "",
    expiresIn: data.expires_in,
  };
}

export async function refreshGmailAccessToken(
  encryptedRefreshToken: string
): Promise<string> {
  const { clientId, clientSecret } = getGoogleDriveCredentials();
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing.");
  }

  const refreshToken = decrypt(encryptedRefreshToken);
  if (!refreshToken) {
    throw new Error("Invalid or empty Gmail refresh token.");
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || "Failed to refresh Gmail access token");
  }

  return data.access_token as string;
}

export async function getGmailUserEmail(accessToken: string): Promise<string> {
  const res = await fetch(`${GMAIL_API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    return "Google Workspace Account";
  }

  const data = await res.json();
  return data.emailAddress || "Google Workspace Account";
}

export interface SendGmailArgs {
  accessToken: string;
  fromEmail: string;
  fromName?: string;
  to: string;
  subject: string;
  bodyHtml: string;
}

export async function sendGmailMessage({
  accessToken,
  fromEmail,
  fromName = "Support",
  to,
  subject,
  bodyHtml,
}: SendGmailArgs): Promise<{ id: string; threadId: string }> {
  // Construct RFC 2822 email format
  const senderHeader = fromName ? `"${fromName.replace(/"/g, "")}" <${fromEmail}>` : fromEmail;
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;

  const rawMessage = [
    `From: ${senderHeader}`,
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: base64`,
    "",
    Buffer.from(bodyHtml, "utf8").toString("base64"),
  ].join("\r\n");

  const base64UrlRaw = Buffer.from(rawMessage, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch(`${GMAIL_API_BASE}/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw: base64UrlRaw,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Failed to send email via Gmail API");
  }

  return {
    id: data.id,
    threadId: data.threadId,
  };
}
