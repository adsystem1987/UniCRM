import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  getOrRefreshDriveToken,
  getOrCreateDriveFolder,
  uploadBufferToDrive,
} from "@/lib/gdrive/client";

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createAdminClient(url, key);
}

export interface MirrorMediaArgs {
  accountId: string;
  filename: string;
  mimeType: string;
  buffer: Buffer;
}

export interface MirrorMediaResult {
  fileId: string;
  webViewLink?: string;
  streamUrl: string;
  nodeEmail?: string;
}

/**
 * Multi-Google Drive Storage Pool Engine (9Drive Concept)
 * Automatically checks pooled accounts, selects the active node with available quota,
 * and streams customer media without permanent disk consumption.
 */
export async function mirrorMediaToGoogleDrive({
  accountId,
  filename,
  mimeType,
  buffer,
}: MirrorMediaArgs): Promise<MirrorMediaResult | null> {
  try {
    const supabase = getAdminClient();

    // 1. Try selecting from Multi-Drive Storage Pool (ordered by priority & availability)
    const { data: poolNodes } = await supabase
      .from("gdrive_storage_nodes")
      .select("id, connected_email, refresh_token, folder_id, target_folder, storage_used_bytes, storage_quota_bytes")
      .eq("account_id", accountId)
      .eq("is_active", true)
      .order("priority_order", { ascending: true })
      .order("storage_used_bytes", { ascending: true });

    let activeNode = poolNodes && poolNodes.length > 0 ? poolNodes[0] : null;

    // 2. Fallback to legacy single gdrive_configs if pool table not populated yet
    if (!activeNode) {
      const { data: legacyConfig } = await supabase
        .from("gdrive_configs")
        .select("refresh_token, folder_id, target_folder, connected_email, mirror_inbound")
        .eq("account_id", accountId)
        .maybeSingle();

      if (!legacyConfig || !legacyConfig.refresh_token || !legacyConfig.mirror_inbound) {
        return null;
      }

      activeNode = {
        id: "legacy",
        connected_email: legacyConfig.connected_email,
        refresh_token: legacyConfig.refresh_token,
        folder_id: legacyConfig.folder_id,
        target_folder: legacyConfig.target_folder,
        storage_used_bytes: 0,
        storage_quota_bytes: 16106127360,
      };
    }

    const accessToken = await getOrRefreshDriveToken(accountId, activeNode.refresh_token);
    let folderId = activeNode.folder_id;

    if (!folderId) {
      folderId = await getOrCreateDriveFolder(accessToken, activeNode.target_folder || "DFY UniCRM Attachments");
      if (activeNode.id !== "legacy") {
        await supabase
          .from("gdrive_storage_nodes")
          .update({ folder_id: folderId })
          .eq("id", activeNode.id);
      } else {
        await supabase
          .from("gdrive_configs")
          .update({ folder_id: folderId })
          .eq("account_id", accountId);
      }
    }

    const result = await uploadBufferToDrive({
      accessToken,
      folderId,
      filename,
      mimeType,
      buffer,
    });

    // Update storage usage counter if pooled
    if (activeNode.id !== "legacy") {
      const newUsed = (activeNode.storage_used_bytes || 0) + buffer.length;
      await supabase
        .from("gdrive_storage_nodes")
        .update({ storage_used_bytes: newUsed })
        .eq("id", activeNode.id);
    }

    const streamUrl = `/api/gdrive/media/${result.fileId}?acc=${accountId}`;
    console.log(`[gdrive-pool] Mirrored ${filename} to Drive node (${activeNode.connected_email}) -> ${folderId}`);

    return {
      fileId: result.fileId,
      webViewLink: result.webViewLink,
      streamUrl,
      nodeEmail: activeNode.connected_email,
    };
  } catch (err) {
    console.error("[gdrive-pool] Offload error (continuing normally):", err);
    return null;
  }
}
