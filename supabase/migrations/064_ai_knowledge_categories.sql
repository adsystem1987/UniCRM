-- 064_ai_knowledge_categories.sql
-- Add folder/category hierarchy to AI knowledge base (inspired by AppFlowy document trees)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_knowledge_documents' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.ai_knowledge_documents ADD COLUMN category TEXT DEFAULT 'General';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_knowledge_documents' AND column_name = 'icon'
  ) THEN
    ALTER TABLE public.ai_knowledge_documents ADD COLUMN icon TEXT DEFAULT 'FileText';
  END IF;
END $$;
