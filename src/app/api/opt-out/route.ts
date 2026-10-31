import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/gdrive/offload";

export const dynamic = "force-dynamic";

/**
 * POST /api/opt-out
 * One-click handler to:
 * 1. Mark claim token as opted_out
 * 2. Add email to email_suppression_list
 * 3. Delete / unpublish their pre-generated business page
 */
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json().catch(() => ({}));
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const admin = getAdminClient();

    // 1. Fetch token record
    const { data: claimRecord } = await admin
      .from("workspace_claim_tokens")
      .select("id, email, page_slug, status")
      .eq("token", token)
      .maybeSingle();

    if (!claimRecord) {
      return NextResponse.json({ error: "Invalid invitation token." }, { status: 404 });
    }

    const email = claimRecord.email.toLowerCase();

    // 2. Add to permanent anti-spam suppression list
    await admin.from("email_suppression_list").upsert({
      email,
      reason: "opt_out",
      created_at: new Date().toISOString(),
    });

    // 3. Mark token as opted_out
    await admin
      .from("workspace_claim_tokens")
      .update({
        status: "opted_out",
        opted_out_at: new Date().toISOString(),
      })
      .eq("token", token);

    // 4. Delete or unpublish the business page if created
    if (claimRecord.page_slug) {
      await admin
        .from("business_pages")
        .delete()
        .eq("slug", claimRecord.page_slug);
    }

    return NextResponse.json({
      success: true,
      message: "Your profile has been permanently removed.",
    });
  } catch (err: any) {
    console.error("[api/opt-out] Error processing opt out:", err);
    return NextResponse.json({ error: err.message || "Failed to process opt out" }, { status: 500 });
  }
}
