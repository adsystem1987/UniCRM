import { decrypt } from "@/lib/whatsapp/encryption";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const GOOGLE_DRIVE_API_BASE = "https://www.googleapis.com/drive/v3/files";
const GOOGLE_DRIVE_UPLOAD_BASE = "https://www.googleapis.com/upload/drive/v3/files";

export const GOOGLE_DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

export function getGoogleDriveCredentials(): {
  clientId: string;
  clientSecret: string;
} {
  const clientId =
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.SUPABASE_AUTH_GOOGLE_CLIENT_ID ||
    "";

  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.SUPABASE_AUTH_GOOGLE_SECRET ||
    "";

  return { clientId: clientId.trim(), clientSecret: clientSecret.trim() };
}

export function getGoogleOAuthUrl(state: string, redirectUri: string): string {
  const { clientId } = getGoogleDriveCredentials();
  if (!clientId) {
    throw new Error(
      "GOOGLE_CLIENT_ID is not configured in environment variables. Please add it in your Vercel or environment settings."
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GOOGLE_DRIVE_SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCode(
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
    throw new Error(data.error_description || data.error || "Failed to exchange Google OAuth code");
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || "",
    expiresIn: data.expires_in,
  };
}

export async function refreshGoogleAccessToken(
  encryptedRefreshToken: string
): Promise<string> {
  const { clientId, clientSecret } = getGoogleDriveCredentials();
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing.");
  }

  const refreshToken = decrypt(encryptedRefreshToken);
  if (!refreshToken) {
    throw new Error("Invalid or empty Google refresh token.");
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
    throw new Error(data.error_description || data.error || "Failed to refresh Google access token");
  }

  return data.access_token as string;
}

export async function getGoogleUserEmail(accessToken: string): Promise<string> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    return "Google Drive Account";
  }

  const data = await res.json();
  return data.email || "Google Drive Account";
}

export async function getOrCreateDriveFolder(
  accessToken: string,
  folderName: string = "DFY UniCRM Attachments"
): Promise<string> {
  const cleanName = folderName.replace(/^\/+|\/+$/g, "") || "DFY UniCRM Attachments";

  // 1. Search for existing folder
  const query = `name = '${cleanName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const searchUrl = `${GOOGLE_DRIVE_API_BASE}?q=${encodeURIComponent(query)}&fields=files(id,name)&spaces=drive`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // 2. Create folder if not found
  const createRes = await fetch(GOOGLE_DRIVE_API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: cleanName,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });

  const createData = await createRes.json();
  if (!createRes.ok) {
    throw new Error(createData.error?.message || "Failed to create Google Drive folder");
  }

  return createData.id;
}

export async function uploadBufferToDrive({
  accessToken,
  folderId,
  filename,
  mimeType,
  buffer,
}: {
  accessToken: string;
  folderId?: string;
  filename: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<{ fileId: string; webViewLink?: string }> {
  const metadata: Record<string, unknown> = {
    name: filename,
    mimeType: mimeType || "application/octet-stream",
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = `-------UniCrmBoundary${Date.now().toString(16)}`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const mediaHeader = `${delimiter}Content-Type: ${mimeType || "application/octet-stream"}\r\n\r\n`;

  const payload = Buffer.concat([
    Buffer.from(metadataPart, "utf8"),
    Buffer.from(mediaHeader, "utf8"),
    buffer,
    Buffer.from(closeDelimiter, "utf8"),
  ]);

  const uploadUrl = `${GOOGLE_DRIVE_UPLOAD_BASE}?uploadType=multipart&fields=id,name,webViewLink`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
      "Content-Length": payload.length.toString(),
    },
    body: payload,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Failed to upload file to Google Drive");
  }

  return {
    fileId: data.id,
    webViewLink: data.webViewLink,
  };
}
