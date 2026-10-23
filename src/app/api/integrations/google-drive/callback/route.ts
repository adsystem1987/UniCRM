import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  exchangeGoogleCode,
  getGoogleUserEmail,
  getOrCreateDriveFolder,
} from "@/lib/gdrive/client";
import { encrypt } from "@/lib/whatsapp/encryption";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createAdminClient(url, key);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const headerOrigin = host ? `${proto}://${host}` : url.origin;
  const origin = envOrigin || headerOrigin;

  const errorParam = url.searchParams.get("error");
  if (errorParam) {
    console.error("[google-drive/callback] Google error:", errorParam);
    return NextResponse.redirect(
      `${origin}/settings?tab=integrations&subtab=gdrive&gdrive_error=${encodeURIComponent(errorParam)}`
    );
  }

  const code = url.searchParams.get("code");
  const rawState = url.searchParams.get("state");

  if (!code || !rawState) {
    return NextResponse.redirect(
      `${origin}/settings?tab=integrations&subtab=gdrive&gdrive_error=missing_code_or_state`
    );
  }

  let accountId: string;
  try {
    const decoded = Buffer.from(rawState, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded);
    accountId = parsed.accountId;
    if (!accountId) throw new Error("Missing accountId in state");
  } catch (err) {
    console.error("[google-drive/callback] State parse error:", err);
    return NextResponse.redirect(
      `${origin}/settings?tab=integrations&subtab=gdrive&gdrive_error=invalid_state`
    );
  }

  try {
    const redirectUri = `${origin}/api/integrations/google-drive/callback`;
    const { accessToken, refreshToken } = await exchangeGoogleCode(code, redirectUri);

    if (!refreshToken) {
      console.warn("[google-drive/callback] Google did not return a refresh_token");
    }

    const email = await getGoogleUserEmail(accessToken);
    const folderId = await getOrCreateDriveFolder(accessToken, "DFY UniCRM Attachments");
    const encryptedRefreshToken = encrypt(refreshToken || accessToken);

    const supabase = getAdminClient();
    const { error: dbError } = await supabase.from("gdrive_configs").upsert(
      {
        account_id: accountId,
        connected_email: email,
        refresh_token: encryptedRefreshToken,
        target_folder: "/DFY UniCRM Attachments",
        folder_id: folderId,
        mirror_inbound: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "account_id" }
    );

    if (dbError) {
      console.error("[google-drive/callback] DB upsert error:", dbError);
      return NextResponse.redirect(
        `${origin}/settings?tab=integrations&subtab=gdrive&gdrive_error=${encodeURIComponent(dbError.message || dbError.details || "Database save failed")}`
      );
    }

    return NextResponse.redirect(
      `${origin}/settings?tab=integrations&subtab=gdrive&gdrive=connected`
    );
  } catch (err) {
    console.error("[google-drive/callback] Auth exchange error:", err);
    const message = err instanceof Error ? err.message : "Failed to connect Google Drive";
    return NextResponse.redirect(
      `${origin}/settings?tab=integrations&subtab=gdrive&gdrive_error=${encodeURIComponent(message)}`
    );
  }
}
