import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/gdrive/offload";

export const dynamic = "force-dynamic";

/**
 * GET /api/outreach/stats
 * Platform-owner only API to fetch live stats of cold workspace outreach.
 */
export async function GET(req: NextRequest) {
  try {
    const admin = getAdminClient();

    // 1. Fetch count by status
    const { data: tokens, error: tokensErr } = await admin
      .from("workspace_claim_tokens")
      .select("id, token, email, business_name, contact_name, phone, category, city, page_slug, status, created_at, claimed_at, opted_out_at, expires_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (tokensErr) {
      console.error("[api/outreach/stats] error:", tokensErr);
      return NextResponse.json({ error: tokensErr.message }, { status: 500 });
    }

    const { count: suppressionCount } = await admin
      .from("email_suppression_list")
      .select("*", { count: "exact", head: true });

    const totalSent = tokens?.length || 0;
    const claimedCount = tokens?.filter((t) => t.status === "claimed").length || 0;
    const pendingCount = tokens?.filter((t) => t.status === "pending").length || 0;
    const optedOutCount = tokens?.filter((t) => t.status === "opted_out").length || 0;

    return NextResponse.json({
      metrics: {
        totalSent,
        claimedCount,
        pendingCount,
        optedOutCount,
        suppressedTotal: suppressionCount || 0,
        conversionRate: totalSent > 0 ? ((claimedCount / totalSent) * 100).toFixed(1) + "%" : "0%",
      },
      tokens: tokens || [],
    });
  } catch (err: any) {
    console.error("[api/outreach/stats] exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
