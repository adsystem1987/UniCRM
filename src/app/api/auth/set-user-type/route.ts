import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/gdrive/offload";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/set-user-type
 * Updates user profile to either 'customer' or 'business'.
 * If 'customer', also sets phone_verified = true to eliminate activation barrier.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userType } = body; // 'customer' | 'business'

    if (!userType || !["customer", "business"].includes(userType)) {
      return NextResponse.json({ error: "Invalid userType" }, { status: 400 });
    }

    const admin = getAdminClient();

    // If customer, mark phone_verified = true so they immediately enter the app
    const updatePayload: Record<string, any> = {
      user_type: userType,
      updated_at: new Date().toISOString(),
    };

    if (userType === "customer") {
      updatePayload.phone_verified = true;
    }

    const { data, error } = await admin
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("[set-user-type] error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data });
  } catch (err: any) {
    console.error("[set-user-type] catch err:", err);
    return NextResponse.json({ error: err.message || "Failed to update role" }, { status: 500 });
  }
}
