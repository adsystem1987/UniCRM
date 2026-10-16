import { uploadAccountMedia, CHAT_MEDIA_BUCKET } from "@/lib/storage/upload-media";

export interface SmartUploadResult {
  publicUrl: string;
  path: string;
  isDrive: boolean;
}

/**
 * Smart media uploader:
 * 1. Attempts to stream upload directly into Google Drive (BYOS) via /api/integrations/google-drive/upload
 * 2. If Google Drive is not connected or mirror_outbound is disabled, seamlessly falls back to Supabase Storage.
 */
export async function uploadSmartMedia(file: File): Promise<SmartUploadResult> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/integrations/google-drive/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.connected && data.mediaUrl) {
        return {
          publicUrl: data.mediaUrl,
          path: `gdrive:${data.fileId}`,
          isDrive: true,
        };
      }
    }
  } catch (err) {
    console.warn("[uploadSmartMedia] Google Drive upload attempt skipped:", err);
  }

  // Fall back to Supabase Storage
  const { publicUrl, path } = await uploadAccountMedia(CHAT_MEDIA_BUCKET, file);
  return {
    publicUrl,
    path,
    isDrive: false,
  };
}
