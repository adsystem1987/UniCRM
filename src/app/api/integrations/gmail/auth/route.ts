import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/account";
import { getGmailOAuthUrl } from "@/lib/gmail/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { accountId, userId } = await requireRole("admin");

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const origin = host ? `${proto}://${host}` : new URL(request.url).origin;
    const redirectUri = `${origin}/api/integrations/gmail/callback`;

    const statePayload = JSON.stringify({
      accountId,
      userId,
      ts: Date.now(),
    });
    const state = Buffer.from(statePayload, "utf8").toString("base64url");

    const oauthUrl = getGmailOAuthUrl(state, redirectUri);
    return NextResponse.redirect(oauthUrl);
  } catch (err) {
    console.error("[gmail/auth] error:", err);
    const origin = new URL(request.url).origin;
    const errorMsg = err instanceof Error ? encodeURIComponent(err.message) : "Failed to start Gmail authentication";
    return NextResponse.redirect(`${origin}/settings?tab=integrations&subtab=email&gmail_error=${errorMsg}`);
  }
}
