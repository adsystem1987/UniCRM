import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { exchangeGmailCode, getGmailUserEmail } from "@/lib/gmail/client";
import { encrypt, decrypt } from "@/lib/whatsapp/encryption";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createAdminClient(url, key);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const proto = request.headers.get("x-forwarded-proto") || "https";
  const origin = host ? `${proto}://${host}` : url.origin;

  const errorParam = url.searchParams.get("error");
  if (errorParam) {
    console.error("[gmail/callback] Google error:", errorParam);
    return NextResponse.redirect(
      `${origin}/settings?tab=integrations&subtab=email&gmail_error=${encodeURIComponent(errorParam)}`
    );
  }

  const code = url.searchParams.get("code");
  const rawState = url.searchParams.get("state");

  if (!code || !rawState) {
    return NextResponse.redirect(
      `${origin}/settings?tab=integrations&subtab=email&gmail_error=missing_code_or_state`
    );
  }

  let accountId: string;
  try {
    const decoded = Buffer.from(rawState, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded);
    accountId = parsed.accountId;
    if (!accountId) throw new Error("Missing accountId in state");
  } catch (err) {
    console.error("[gmail/callback] State parse error:", err);
    return NextResponse.redirect(
      `${origin}/settings?tab=integrations&subtab=email&gmail_error=invalid_state`
    );
  }

  try {
    const redirectUri = `${origin}/api/integrations/gmail/callback`;
    const { accessToken, refreshToken } = await exchangeGmailCode(code, redirectUri);

    const email = await getGmailUserEmail(accessToken);
    const supabase = getAdminClient();

    let tokenToStore = refreshToken;
    if (!tokenToStore) {
      const { data: existing } = await supabase
        .from("gmail_configs")
        .select("refresh_token")
        .eq("account_id", accountId)
        .maybeSingle();

      if (existing?.refresh_token) {
        try {
          tokenToStore = decrypt(existing.refresh_token);
        } catch {
          // ignore decrypt error if old format
        }
      }
    }
    if (!tokenToStore) {
      tokenToStore = accessToken;
    }

    const encryptedRefreshToken = encrypt(tokenToStore);
    const { error: dbError } = await supabase.from("gmail_configs").upsert(
      {
        account_id: accountId,
        connected_email: email,
        refresh_token: encryptedRefreshToken,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "account_id" }
    );

    if (dbError) {
      console.error("[gmail/callback] DB upsert error:", dbError);
      return NextResponse.redirect(
        `${origin}/settings?tab=integrations&subtab=email&gmail_error=${encodeURIComponent(dbError.message)}`
      );
    }

    return NextResponse.redirect(
      `${origin}/settings?tab=integrations&subtab=email&gmail=connected`
    );
  } catch (err) {
    console.error("[gmail/callback] Auth exchange error:", err);
    const message = err instanceof Error ? err.message : "Failed to connect Gmail";
    return NextResponse.redirect(
      `${origin}/settings?tab=integrations&subtab=email&gmail_error=${encodeURIComponent(message)}`
    );
  }
}
