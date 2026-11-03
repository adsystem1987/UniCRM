import { NextRequest, NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getAdminClient } from "@/lib/gdrive/offload";
import { isMasterAdminEmail } from "@/lib/auth/master-admin";
import { recordLeadUnlock } from "@/lib/dsa/monetization";

export const dynamic = "force-dynamic";

/**
 * POST /api/loans/applications/accept
 * DSA agent accepts an assigned lead:
 * 1. Verifies that this lead is assigned to them.
 * 2. Updates status from 'assigned' to 'accepted' with timestamp.
 * 3. Unmasks the borrower's phone and email for direct WhatsApp outreach.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await getCurrentAccount();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = getAdminClient();
    const { data: profile } = await admin.from("profiles").select("email").eq("id", userId).single();
    const isPlatformOwner = isMasterAdminEmail(profile?.email);

    const body = await req.json();
    const { applicationId, action } = body; // action: 'accept' | 'reject'

    if (!applicationId) {
      return NextResponse.json({ error: "applicationId is required." }, { status: 400 });
    }

    // Fetch application
    const { data: app, error: fetchErr } = await admin
      .from("loan_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (fetchErr || !app) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    // Verify assignment permission
    if (!isPlatformOwner && app.assigned_to_dsa_id !== userId) {
      return NextResponse.json({ error: "This lead is not assigned to your desk." }, { status: 403 });
    }

    const now = new Date().toISOString();

    if (action === "reject") {
      const { data: updated, error: updateErr } = await admin
        .from("loan_applications")
        .update({
          status: "rejected",
          rejected_at: now,
          rejection_reason: body.reason || "Declined by agent",
        })
        .eq("id", applicationId)
        .select()
        .single();

      if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });
      return NextResponse.json({ success: true, status: "rejected" });
    }

    // Default: Accept lead
    const { data: updated, error: updateErr } = await admin
      .from("loan_applications")
      .update({
        status: "accepted",
        accepted_at: now,
      })
      .eq("id", applicationId)
      .select()
      .single();

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    // Record audit unlock in background
    recordLeadUnlock(userId, applicationId).catch((err) =>
      console.warn("[loans/accept] recordLeadUnlock failed:", err)
    );

    // Returns unmasked details now that lead is formally accepted
    return NextResponse.json({
      success: true,
      status: "accepted",
      unmaskedContact: {
        phone: updated.phone,
        email: updated.email,
        businessName: updated.business_name,
        applicantName: updated.applicant_name,
        amount: updated.amount_requested,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process lead acceptance" }, { status: 500 });
  }
}
