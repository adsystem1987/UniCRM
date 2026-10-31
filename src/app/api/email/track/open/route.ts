import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/gdrive/offload";

export const dynamic = "force-dynamic";

// 1x1 transparent GIF base64
const TRANSPARENT_GIF_BUFFER = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

/**
 * GET /api/email/track/open?token=<workspace_claim_token>&msgId=<optional_message_id>
 * Records when an email is opened and returns an invisible 1x1 GIF.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const msgId = searchParams.get("msgId");

    const admin = getAdminClient();
    const now = new Date().toISOString();

    if (token) {
      // Mark workspace_claim_tokens as opened if not already opened
      await admin
        .from("workspace_claim_tokens")
        .update({
          opened_at: now,
        })
        .eq("token", token)
        .is("opened_at", null);
    }

    if (msgId) {
      // Mark inbox messages as opened
      await admin
        .from("messages")
        .update({
          opened_at: now,
          status: "read",
        })
        .eq("id", msgId)
        .is("opened_at", null);
    }
  } catch (err) {
    console.error("[api/email/track/open] error tracking open event:", err);
  }

  // Always return the 1x1 transparent GIF with cache headers preventing browser caching
  return new NextResponse(TRANSPARENT_GIF_BUFFER, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": TRANSPARENT_GIF_BUFFER.length.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
