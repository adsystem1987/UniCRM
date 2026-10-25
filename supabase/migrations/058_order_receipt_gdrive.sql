-- Migration 058: Add Google Drive Payment Receipt tracking to orders table

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS receipt_number TEXT,
ADD COLUMN IF NOT EXISTS receipt_gdrive_file_id TEXT,
ADD COLUMN IF NOT EXISTS receipt_gdrive_url TEXT,
ADD COLUMN IF NOT EXISTS receipt_generated_at TIMESTAMPTZ;

-- Create an index on receipt_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_receipt_number ON public.orders(receipt_number);

-- Auto-generate a readable receipt_number sequence if not already present
-- Format: REC-YYYYMM-XXXX
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
  month_prefix TEXT;
  seq_num INT;
BEGIN
  IF NEW.receipt_number IS NULL AND NEW.status = 'paid' THEN
    month_prefix := 'REC-' || to_char(NOW(), 'YYYYMM') || '-';
    -- Count receipts generated this month to form sequential suffix
    SELECT COUNT(*) + 1 INTO seq_num
    FROM public.orders
    WHERE receipt_number LIKE month_prefix || '%';
    
    NEW.receipt_number := month_prefix || LPAD(seq_num::TEXT, 4, '0');
    IF NEW.receipt_generated_at IS NULL THEN
      NEW.receipt_generated_at := NOW();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_receipt_number ON public.orders;
CREATE TRIGGER trigger_generate_receipt_number
BEFORE INSERT OR UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_receipt_number();
