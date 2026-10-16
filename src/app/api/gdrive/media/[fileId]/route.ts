import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/gdrive/offload";
import { getOrRefreshDriveToken } from "@/lib/gdrive/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/gdrive/media/[fileId]?acc=<accountId>
 *
 * Direct high-performance streaming proxy for Google Drive media attachments.
 * - Streams chunks directly with 0 MB server disk/RAM storage footprint.
 * - Supports HTTP 206 Partial Content (Range requests) so audio voice notes
 *   and videos can seek immediately without buffering the whole file.
 * - Publicly fetchable by Meta WhatsApp Cloud API when sending outbound media.
 * - Eliminates customer storage consumption from Supabase free-tier DB/bucket!
 */
export async function GET(
  request: Request,
  props: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await props.params;

    if (!fileId) {
      return new Response("Missing file ID", { status: 400 });
    }

    const url = new URL(request.url);
    let accountId = url.searchParams.get("acc");

    // 1. If accountId not provided in query, attempt to resolve from user session
    if (!accountId) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("account_id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (profile?.account_id) {
            accountId = profile.account_id;
          }
        }
      } catch {
        // Unauthenticated external request (e.g. Meta Cloud API fetch or img tag)
      }
    }

    // 2. Fetch the corresponding Google Drive configuration
    const adminSupabase = getAdminClient();
    let query = adminSupabase
      .from("gdrive_configs")
      .select("account_id, refresh_token");

    if (accountId) {
      query = query.eq("account_id", accountId);
    }

    const { data: configs, error: configError } = await query.limit(1);

    if (configError || !configs || configs.length === 0) {
      return new Response("Google Drive storage not configured", {
        status: 404,
      });
    }

    const config = configs[0];
    const resolvedAccountId = config.account_id;
    const accessToken = await getOrRefreshDriveToken(
      resolvedAccountId,
      config.refresh_token
    );

    // 3. Prepare upstream Google Drive request with Range headers
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      fileId
    )}?alt=media`;

    const upstreamHeaders: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };

    const rangeHeader = request.headers.get("range");
    if (rangeHeader) {
      upstreamHeaders["Range"] = rangeHeader;
    }

    const driveRes = await fetch(driveUrl, {
      method: "GET",
      headers: upstreamHeaders,
    });

    if (!driveRes.ok && driveRes.status !== 206) {
      const errText = await driveRes.text().catch(() => "");
      console.warn(`[gdrive/media] Drive fetch failed (${driveRes.status}):`, errText);
      return new Response("Media not found or inaccessible in Google Drive", {
        status: driveRes.status === 404 ? 404 : 502,
      });
    }

    // 4. Construct streaming response with Range and Caching headers
    const responseHeaders = new Headers();

    const contentType =
      driveRes.headers.get("content-type") || "application/octet-stream";
    responseHeaders.set("Content-Type", contentType);

    const contentLength = driveRes.headers.get("content-length");
    if (contentLength) {
      responseHeaders.set("Content-Length", contentLength);
    }

    const contentRange = driveRes.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    const acceptRanges = driveRes.headers.get("accept-ranges");
    responseHeaders.set("Accept-Ranges", acceptRanges || "bytes");

    // Cache immutable media in browser / CDN
    responseHeaders.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    // Allow cross-origin media rendering if needed
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    return new Response(driveRes.body, {
      status: driveRes.status, // 200 or 206
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("[gdrive/media] Streaming error:", err);
    return new Response("Internal Media Stream Error", { status: 500 });
  }
}
