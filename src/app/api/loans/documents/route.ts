import { NextRequest, NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getAdminClient } from "@/lib/gdrive/offload";

export const dynamic = "force-dynamic";

/**
 * GET /api/loans/documents?applicationId=...
 * Lists document requests for a specific loan application.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await getCurrentAccount();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");

    if (!applicationId) {
      return NextResponse.json({ error: "applicationId is required." }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: docs, error } = await admin
      .from("loan_document_requests")
      .select("*")
      .eq("loan_application_id", applicationId)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, documents: docs || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch documents" }, { status: 500 });
  }
}

/**
 * POST /api/loans/documents
 * 1-Click Document Request by DSA or Admin (e.g. 3 Yrs ITR, Bank Statement, Property Deed)
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, accountId } = await getCurrentAccount();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { applicationId, docType, title, description } = body;

    if (!applicationId || !docType || !title) {
      return NextResponse.json(
        { error: "applicationId, docType, and title are required." },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    // Fetch loan app to get borrower user ID
    const { data: app } = await admin
      .from("loan_applications")
      .select("user_id")
      .eq("id", applicationId)
      .single();

    const { data, error } = await admin
      .from("loan_document_requests")
      .insert({
        loan_application_id: applicationId,
        account_id: accountId,
        requested_by_user_id: userId,
        borrower_user_id: app?.user_id || null,
        doc_type: docType,
        title,
        description: description || "",
        status: "requested",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, documentRequest: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create document request" }, { status: 500 });
  }
}
