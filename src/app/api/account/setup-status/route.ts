import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/account";
import { getAccountGoogleAccessToken } from "@/lib/gdrive/sheets";

export const dynamic = "force-dynamic";

/**
 * GET /api/account/setup-status
 * Checks if the current account has completed the compulsory setup:
 * 1. Google Drive (Storage / BYOS)
 * 2. Personal Supabase (Database / BYOD)
 */
export async function GET() {
  try {
    const { supabase, accountId } = await getCurrentAccount();

    // 1. Check Google Drive Connection
    const googleToken = await getAccountGoogleAccessToken(supabase, accountId).catch(() => null);
    const googleDriveConnected = !!googleToken;

    // 2. Check BYOD Supabase Connection
    const { data: byodConfig } = await supabase
      .from("byod_configs")
      .select("id, is_active, supabase_url")
      .eq("account_id", accountId)
      .eq("is_active", true)
      .maybeSingle()
      .catch(() => ({ data: null }));

    const supabaseConnected = !!(byodConfig && byodConfig.supabase_url);

    return NextResponse.json({
      googleDriveConnected,
      supabaseConnected,
      isFullyConfigured: googleDriveConnected && supabaseConnected,
    });
  } catch (err) {
    console.error("[account/setup-status] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to check setup status" },
      { status: 500 }
    );
  }
}
