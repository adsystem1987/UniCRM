import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import {
  getOrRefreshDriveToken,
  getOrCreateDriveFolder,
  uploadBufferToDrive,
} from "@/lib/gdrive/client";

export const dynamic = "force-dynamic";

/**
 * POST /api/integrations/google-drive/upload
 *
 * Stream customer outbound media (composer attachments, audio voice notes, documents)
 * directly into the account's connected Google Drive (BYOS).
 *
 * If Google Drive is not connected or mirror_outbound is disabled, returns `{ connected: false }`
 * so the client can fall back cleanly to Supabase Storage.
 */
export async function POST(request: Request) {
  try {
    const { supabase, accountId } = await getCurrentAccount();

    const { data: config, error: configError } = await supabase
      .from("gdrive_configs")
      .select("refresh_token, folder_id, target_folder, mirror_outbound")
      .eq("account_id", accountId)
      .maybeSingle();

    if (
      configError ||
      !config ||
      !config.refresh_token ||
      config.mirror_outbound === false
    ) {
      return NextResponse.json({ connected: false });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided for upload" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const accessToken = await getOrRefreshDriveToken(
      accountId,
      config.refresh_token
    );

    let folderId = config.folder_id;
    if (!folderId) {
      folderId = await getOrCreateDriveFolder(
        accessToken,
        config.target_folder || "DFY UniCRM Attachments"
      );
      await supabase
        .from("gdrive_configs")
        .update({ folder_id: folderId })
        .eq("account_id", accountId);
    }

    const uploadResult = await uploadBufferToDrive({
      accessToken,
      folderId,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      buffer,
    });

    const mediaUrl = `/api/gdrive/media/${uploadResult.fileId}?acc=${accountId}`;

    return NextResponse.json({
      connected: true,
      fileId: uploadResult.fileId,
      mediaUrl,
      filename: file.name,
      webViewLink: uploadResult.webViewLink,
    });
  } catch (err) {
    console.error("[gdrive/upload] Upload error:", err);
    return toErrorResponse(err);
  }
}
