import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/account";
import { getGoogleOAuthUrl } from "@/lib/gdrive/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { accountId, userId } = await requireRole("admin");

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const origin = host ? `${proto}://${host}` : new URL(request.url).origin;
    const redirectUri = `${origin}/api/integrations/google-drive/callback`;

    // State encodes accountId and userId with a timestamp
    const statePayload = JSON.stringify({
      accountId,
      userId,
      ts: Date.now(),
    });
    const state = Buffer.from(statePayload, "utf8").toString("base64url");

    const oauthUrl = getGoogleOAuthUrl(state, redirectUri);
    return NextResponse.redirect(oauthUrl);
  } catch (err) {
    console.error("[google-drive/auth] error:", err);
    const origin = new URL(request.url).origin;
    const errorMsg = err instanceof Error ? encodeURIComponent(err.message) : "Failed to start Google Drive authentication";
    return NextResponse.redirect(`${origin}/settings?tab=integrations&error=${errorMsg}`);
  }
}
