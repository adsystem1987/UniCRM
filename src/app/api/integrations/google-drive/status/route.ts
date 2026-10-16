import { NextResponse } from "next/server";
import { getCurrentAccount, requireRole, toErrorResponse } from "@/lib/auth/account";

export const dynamic = "force-dynamic";

/**
 * GET /api/integrations/google-drive/status
 * Check if the account has an active Google Drive connection
 */
export async function GET() {
  try {
    const { supabase, accountId } = await getCurrentAccount();

    const { data, error } = await supabase
      .from("gdrive_configs")
      .select("connected_email, target_folder, folder_id, mirror_inbound, updated_at")
      .eq("account_id", accountId)
      .maybeSingle();

    if (error) {
      console.error("[gdrive/status GET] error:", error);
      return NextResponse.json({ connected: false });
    }

    if (!data) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: true,
      email: data.connected_email,
      target_folder: data.target_folder,
      folder_id: data.folder_id,
      mirror_inbound: data.mirror_inbound,
      updated_at: data.updated_at,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

/**
 * PATCH /api/integrations/google-drive/status
 * Update Drive settings (target_folder, mirror_inbound)
 */
export async function PATCH(request: Request) {
  try {
    const { supabase, accountId } = await requireRole("admin");
    const body = await request.json().catch(() => ({}));

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.target_folder === "string" && body.target_folder.trim()) {
      updates.target_folder = body.target_folder.trim();
    }

    if (typeof body.mirror_inbound === "boolean") {
      updates.mirror_inbound = body.mirror_inbound;
    }

    const { data, error } = await supabase
      .from("gdrive_configs")
      .update(updates)
      .eq("account_id", accountId)
      .select("connected_email, target_folder, folder_id, mirror_inbound")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      email: data.connected_email,
      target_folder: data.target_folder,
      folder_id: data.folder_id,
      mirror_inbound: data.mirror_inbound,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

/**
 * DELETE /api/integrations/google-drive/status
 * Disconnect Google Drive
 */
export async function DELETE() {
  try {
    const { supabase, accountId } = await requireRole("admin");

    const { error } = await supabase
      .from("gdrive_configs")
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
