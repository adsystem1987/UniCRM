import { NextRequest, NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getAdminClient } from "@/lib/gdrive/offload";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/set-user-type
 * Updates user profile to either 'customer' or 'business'.
 * If 'customer', they bypass mandatory agency BYOD setup.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await getCurrentAccount();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userType } = body; // 'customer' | 'business'

    if (!userType || !["customer", "business"].includes(userType)) {
      return NextResponse.json({ error: "Invalid userType" }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .update({
        user_type: userType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update role" }, { status: 500 });
  }
}
