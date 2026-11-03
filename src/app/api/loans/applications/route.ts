import { NextRequest, NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getAdminClient } from "@/lib/gdrive/offload";
import { isMasterAdminEmail } from "@/lib/auth/master-admin";
import { maskPhoneNumber, maskEmailAddress } from "@/lib/dsa/monetization";

export const dynamic = "force-dynamic";

/**
 * GET /api/loans/applications
 * Returns loan applications:
 * - Platform owners see all applications with assigned DSA status.
 * - DSAs see only leads assigned to them (masked until accepted).
 * - Borrowers see only their own applications.
 */
export async function GET(req: NextRequest) {
  try {
    const { supabase, accountId, userId } = await getCurrentAccount();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = getAdminClient();
    const { data: profile } = await admin.from("profiles").select("email").eq("id", userId).single();
    const isPlatformOwner = isMasterAdminEmail(profile?.email);

    let query = admin.from("loan_applications").select("*").order("created_at", { ascending: false });

    if (!isPlatformOwner) {
      // Check if user is a DSA agent with assigned leads or borrower
      query = query.or(`assigned_to_dsa_id.eq.${userId},user_id.eq.${userId}`);
    }

    const { data: applications, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Apply lead anti-theft privacy masking for DSAs if lead is NOT yet accepted
    const sanitized = (applications || []).map((app: any) => {
      const isOwnerOrApplicant = isPlatformOwner || app.user_id === userId;
      const isAcceptedDSA = app.assigned_to_dsa_id === userId && app.status !== "assigned" && app.status !== "rejected";

      if (!isOwnerOrApplicant && !isAcceptedDSA) {
        return {
          ...app,
          phone: maskPhoneNumber(app.phone),
          email: maskEmailAddress(app.email),
          isMasked: true,
        };
      }

      return {
        ...app,
        isMasked: false,
      };
    });

    return NextResponse.json({ success: true, applications: sanitized });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch loan applications" }, { status: 500 });
  }
}

/**
 * POST /api/loans/applications
 * Borrower creates/finalizes a formal loan application.
 */
export async function POST(req: NextRequest) {
  try {
    const { supabase, accountId, userId } = await getCurrentAccount();
    const body = await req.json();
    const admin = getAdminClient();

    const {
      businessName,
      applicantName,
      phone,
      email,
      city,
      loanCategory,
      amountRequested,
      monthlyTurnover,
      additionalNotes,
    } = body;

    if (!businessName || !phone || !amountRequested) {
      return NextResponse.json(
        { error: "Business name, phone, and loan amount are required." },
        { status: 400 }
      );
    }

    const { data, error } = await admin
      .from("loan_applications")
      .insert({
        account_id: accountId,
        user_id: userId,
        business_name: businessName,
        applicant_name: applicantName || businessName,
        phone,
        email: email || "",
        city: city || "India",
        loan_category: loanCategory || "business",
        amount_requested: parseFloat(String(amountRequested).replace(/[^0-9.]/g, "")) || 500000,
        monthly_turnover: monthlyTurnover || "",
        additional_notes: additionalNotes || "",
        status: "submitted",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, application: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create application" }, { status: 500 });
  }
}
