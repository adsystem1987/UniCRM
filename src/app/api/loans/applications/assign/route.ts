import { NextRequest, NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getAdminClient } from "@/lib/gdrive/offload";
import { isMasterAdminEmail } from "@/lib/auth/master-admin";

export const dynamic = "force-dynamic";

/**
 * POST /api/loans/applications/assign
 * Platform owner assigns a borrower application to a verified DSA partner workspace.
 * Automatically moves the Deal in the Lending Pipeline from Stage 1 to Stage 2.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await getCurrentAccount();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = getAdminClient();
    const { data: profile } = await admin.from("profiles").select("email").eq("id", userId).single();

    if (!isMasterAdminEmail(profile?.email)) {
      return NextResponse.json({ error: "Only platform owners can assign leads." }, { status: 403 });
    }

    const body = await req.json();
    const { applicationId, partnerUserId, partnerAccountId } = body;

    if (!applicationId || !partnerUserId) {
      return NextResponse.json(
        { error: "applicationId and partnerUserId are required." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // 1. Update loan application with assignment
    const { data: updatedApp, error: appErr } = await admin
      .from("loan_applications")
      .update({
        assigned_to_dsa_id: partnerUserId,
        status: "assigned",
        assigned_at: now,
      })
      .eq("id", applicationId)
      .select()
      .single();

    if (appErr) {
      return NextResponse.json({ error: appErr.message }, { status: 500 });
    }

    // 2. Move Deal in Pipeline to Stage 2 (Assigned to DSA)
    try {
      // Find the Lending Desk pipeline
      const { data: pipeline } = await admin
        .from("pipelines")
        .select("id")
        .eq("name", "Lending & Capital Desk")
        .limit(1)
        .maybeSingle();

      if (pipeline?.id) {
        // Find Stage 2
        const { data: stage2 } = await admin
          .from("pipeline_stages")
          .select("id")
          .eq("pipeline_id", pipeline.id)
          .eq("position", 1)
          .maybeSingle();

        if (stage2?.id && updatedApp.phone) {
          // Find contact matching borrower phone
          const { data: contact } = await admin
            .from("contacts")
            .select("id")
            .eq("phone", updatedApp.phone)
            .limit(1)
            .maybeSingle();

          if (contact?.id) {
            await admin
              .from("deals")
              .update({ stage_id: stage2.id, status: "open" })
              .eq("pipeline_id", pipeline.id)
              .eq("contact_id", contact.id);

            // 3. Handover Conversation & Chat History to the Partner's Inbox
            // Transfer open conversation to partner workspace so their agents can immediately read
            // the AI pre-screening transcript and continue chatting with the borrower!
            const { data: partnerProfile } = await admin
              .from("profiles")
              .select("account_id")
              .eq("id", partnerUserId)
              .maybeSingle();

            if (partnerProfile?.account_id) {
              await admin
                .from("conversations")
                .update({
                  account_id: partnerProfile.account_id,
                  assigned_agent_id: partnerUserId,
                })
                .eq("contact_id", contact.id);
            }
          }
        }
      }
    } catch (pipelineErr) {
      console.warn("[loans/assign] Failed to advance pipeline stage:", pipelineErr);
    }

    return NextResponse.json({ success: true, application: updatedApp });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to assign lead" }, { status: 500 });
  }
}
