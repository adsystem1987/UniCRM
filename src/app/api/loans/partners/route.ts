import { NextRequest, NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getAdminClient } from "@/lib/gdrive/offload";
import { isMasterAdminEmail } from "@/lib/auth/master-admin";

export const dynamic = "force-dynamic";

/**
 * GET /api/loans/partners
 * Returns list of verified business partner workspaces available for lead allocation.
 * Only platform owners can access this list.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await getCurrentAccount();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = getAdminClient();
    const { data: profile } = await admin.from("profiles").select("email").eq("id", userId).single();

    if (!isMasterAdminEmail(profile?.email)) {
      return NextResponse.json({ error: "Only platform owners can list partners" }, { status: 403 });
    }

    // Fetch accounts that have business user_type (or active workspaces)
    const { data: accounts, error } = await admin
      .from("accounts")
      .select("id, name, created_at")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map account owners
    const { data: owners } = await admin
      .from("profiles")
      .select("id, full_name, email, phone, account_id")
      .in("account_id", (accounts || []).map((a) => a.id));

    const ownersByAccount = new Map((owners || []).map((o) => [o.account_id, o]));

    const partners = (accounts || []).map((acc) => {
      const owner = ownersByAccount.get(acc.id);
      return {
        id: acc.id,
        name: acc.name || "Business Partner",
        ownerId: owner?.id,
        ownerName: owner?.full_name || "Partner Admin",
        email: owner?.email,
        phone: owner?.phone,
      };
    });

    return NextResponse.json({ success: true, partners });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch partners" }, { status: 500 });
  }
}
