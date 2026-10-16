import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  refreshGoogleAccessToken,
  getOrCreateDriveFolder,
  uploadBufferToDrive,
} from "@/lib/gdrive/client";

function getAdminClient() {
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

/**
 * Automatically stream/mirror customer media into their connected Google Drive.
 * Fails gracefully so message processing is never blocked or aborted.
 */
export async function mirrorMediaToGoogleDrive({
  accountId,
  filename,
  mimeType,
  buffer,
}: MirrorMediaArgs): Promise<{ fileId: string; webViewLink?: string } | null> {
  try {
    const supabase = getAdminClient();
    const { data: config, error } = await supabase
      .from("gdrive_configs")
      .select("refresh_token, folder_id, target_folder, mirror_inbound")
      .eq("account_id", accountId)
      .maybeSingle();

    if (error || !config || !config.mirror_inbound || !config.refresh_token) {
      return null;
    }

    const accessToken = await refreshGoogleAccessToken(config.refresh_token);
    let folderId = config.folder_id;

    if (!folderId) {
      folderId = await getOrCreateDriveFolder(accessToken, config.target_folder || "DFY UniCRM Attachments");
      await supabase
        .from("gdrive_configs")
        .update({ folder_id: folderId })
        .eq("account_id", accountId);
    }

    const result = await uploadBufferToDrive({
      accessToken,
      folderId,
      filename,
      mimeType,
      buffer,
    });

    console.log(`[gdrive] Mirrored ${filename} to Drive folder ${folderId}`);
    return result;
  } catch (err) {
    console.error("[gdrive] Offload error (continuing normally):", err);
    return null;
  }
}
