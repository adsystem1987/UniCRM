import { NextResponse } from "next/server";
import { getCurrentAccount, requireRole, toErrorResponse } from "@/lib/auth/account";

export const dynamic = "force-dynamic";

/**
 * GET /api/integrations/gmail/status
 * Check if the account has an active Gmail integration
 */
export async function GET() {
  try {
    const { supabase, accountId } = await getCurrentAccount();

    const { data, error } = await supabase
      .from("gmail_configs")
      .select("connected_email, is_active, updated_at")
      .eq("account_id", accountId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: data.is_active !== false,
      email: data.connected_email,
      is_active: data.is_active,
      updated_at: data.updated_at,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

/**
 * DELETE /api/integrations/gmail/status
 * Disconnect Gmail integration
 */
export async function DELETE() {
  try {
    const { supabase, accountId } = await requireRole("admin");

    const { error } = await supabase
      .from("gmail_configs")
      .delete()
      .eq("account_id", accountId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
