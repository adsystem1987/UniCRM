-- ============================================================
-- 052_gdrive_mirror_outbound.sql — Google Drive Outbound Media Streaming
-- ============================================================

-- Add mirror_outbound column to gdrive_configs to allow direct zero-storage
-- offloading of outbound media (voice notes, attachments, documents)
ALTER TABLE gdrive_configs
ADD COLUMN IF NOT EXISTS mirror_outbound BOOLEAN NOT NULL DEFAULT true;
