import { refreshGoogleAccessToken } from "@/lib/gdrive/client";
import { SupabaseClient } from "@supabase/supabase-js";

export function extractGoogleSheetId(input: string): string | null {
  const trimmed = input.trim();
  // Check if it's already a clean spreadsheet ID (typically 44 chars alphanumeric with _ and -)
  if (/^[a-zA-Z0-9-_]{20,60}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex to extract from various Google Sheets URL formats
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

export interface GoogleSheetSummary {
  id: string;
  name: string;
  modifiedTime?: string;
}

/**
 * List the user's available Google Spreadsheets from their connected Google Drive
 */
export async function listUserGoogleSheets(accessToken: string): Promise<GoogleSheetSummary[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)&pageSize=25&orderBy=modifiedTime desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json().catch(() => ({}));
  return (data.files || []).map((f: { id: string; name: string; modifiedTime?: string }) => ({
    id: f.id,
    name: f.name,
    modifiedTime: f.modifiedTime,
  }));
}

/**
 * Fetch a Google Sheet directly as CSV text using Google Drive export or public export
 */
export async function fetchGoogleSheetCsv({
  sheetUrlOrId,
  accessToken,
}: {
  sheetUrlOrId: string;
  accessToken?: string | null;
}): Promise<string> {
  const sheetId = extractGoogleSheetId(sheetUrlOrId);
  if (!sheetId) {
    throw new Error("Invalid Google Sheet link or ID. Please provide a valid Google Sheets URL.");
  }

  // 1. If accessToken provided, try official Google Drive export
  if (accessToken) {
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${sheetId}/export?mimeType=text/csv`;
    const res = await fetch(exportUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) {
      return await res.text();
    }
  }

  // 2. Fallback to public export URL (works if sheet is shared or public)
  const publicUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
  const publicRes = await fetch(publicUrl);
  if (publicRes.ok) {
    const text = await publicRes.text();
    // Verify it's actually CSV and not a Google login HTML page
    if (!text.includes("<!DOCTYPE html") && !text.includes("<html")) {
      return text;
    }
  }

  throw new Error(
    "Unable to access Google Sheet. Please ensure Google Drive is connected in Settings -> Integrations, or that your Google Sheet link has 'Anyone with link can view' permission."
  );
}

/**
 * Helper to get the active Google access token for a tenant account
 */
export async function getAccountGoogleAccessToken(
  supabase: SupabaseClient,
  accountId: string
): Promise<string | null> {
  const { data: config } = await supabase
    .from("gdrive_configs")
    .select("refresh_token")
    .eq("account_id", accountId)
    .maybeSingle();

  if (!config?.refresh_token) {
    return null;
  }

  try {
    return await refreshGoogleAccessToken(config.refresh_token);
  } catch (err) {
    console.error("[getAccountGoogleAccessToken] error refreshing token:", err);
    return null;
  }
}
