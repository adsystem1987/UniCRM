-- 068_messages_channel_support.sql
-- Enables multi-channel messaging in UniCRM Inbox (WhatsApp vs Email)

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'whatsapp',
  ADD COLUMN IF NOT EXISTS subject TEXT;

CREATE INDEX IF NOT EXISTS idx_messages_channel ON public.messages(channel);
