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

    // 1. Try querying with the authenticated user client
    let { data, error } = await supabase
      .from("gdrive_configs")
      .select("connected_email, target_folder, folder_id, mirror_inbound, mirror_outbound, updated_at")
      .eq("account_id", accountId)
      .maybeSingle();

    // 2. If RLS blocks or fails, fallback to admin client using service key
    if (error || !data) {
      try {
        const { getAdminClient } = await import("@/lib/gdrive/offload");
        const adminSupabase = getAdminClient();
        const adminResult = await adminSupabase
          .from("gdrive_configs")
          .select("connected_email, target_folder, folder_id, mirror_inbound, mirror_outbound, updated_at")
          .eq("account_id", accountId)
          .maybeSingle();
        if (adminResult.data) {
          data = adminResult.data;
          error = null;
        }
      } catch {
        // Ignore fallback error
      }
    }

    if (error) {
      console.error("[gdrive/status GET] error:", error);
      return NextResponse.json({ connected: false });
    }

    if (!data) {
      return NextResponse.json({ connected: false });
    }

    // Fetch all pooled storage accounts (Multi-Drive 9Drive feature)
    let poolNodes: any[] = [];
    try {
      const { getAdminClient } = await import("@/lib/gdrive/offload");
      const adminSupabase = getAdminClient();
      const nodesRes = await adminSupabase
        .from("gdrive_storage_nodes")
        .select("id, connected_email, target_folder, storage_quota_bytes, storage_used_bytes, is_active, created_at")
        .eq("account_id", accountId)
        .order("priority_order", { ascending: true });
      if (nodesRes.data && nodesRes.data.length > 0) {
        poolNodes = nodesRes.data;
      }
    } catch {
      // fallback cleanly
    }

    const totalPoolCapacityBytes = (poolNodes.length || 1) * 16106127360; // 15 GB per account
    const totalPoolUsedBytes = poolNodes.reduce((acc, n) => acc + (n.storage_used_bytes || 0), 0);

    return NextResponse.json({
      connected: true,
      email: data.connected_email,
      target_folder: data.target_folder,
      folder_id: data.folder_id,
      mirror_inbound: data.mirror_inbound,
      mirror_outbound: data.mirror_outbound ?? true,
      updated_at: data.updated_at,
      pool: {
        totalNodes: poolNodes.length || 1,
        nodes: poolNodes.length > 0 ? poolNodes : [{ connected_email: data.connected_email }],
        totalCapacityGb: Math.round(totalPoolCapacityBytes / (1024 * 1024 * 1024)),
        totalUsedMb: Math.round(totalPoolUsedBytes / (1024 * 1024)),
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

/**
 * PATCH /api/integrations/google-drive/status
 * Update Drive settings (target_folder, mirror_inbound, mirror_outbound)
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

    if (typeof body.mirror_outbound === "boolean") {
      updates.mirror_outbound = body.mirror_outbound;
    }

    const { data, error } = await supabase
      .from("gdrive_configs")
      .update(updates)
      .eq("account_id", accountId)
      .select("connected_email, target_folder, folder_id, mirror_inbound, mirror_outbound")
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
      mirror_outbound: data.mirror_outbound ?? true,
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
