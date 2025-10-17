-- Migration: Update invoice number format from YYYY-NNNNN to YYYY-NNNN
-- This migration updates the generate_invoice_number function to use 4-digit sequence numbers
-- 
-- Note: Existing invoices with 5-digit numbers will continue to work normally.
-- The new format only applies to newly generated invoice numbers.

-- Drop the trigger first, then the function
DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON invoices;
DROP FUNCTION IF EXISTS generate_invoice_number();

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  current_year INTEGER;
  next_sequence INTEGER;
  new_invoice_number TEXT;
BEGIN
  -- Only generate number when status changes to 'sent' (id = 2)
  IF NEW.status_id = 2 AND (OLD.status_id IS NULL OR OLD.status_id != 2) AND NEW.invoice_number IS NULL THEN
    current_year := EXTRACT(YEAR FROM NEW.issue_date);
    
    -- Get the next sequence number for this user and year
    SELECT COALESCE(MAX(
      CASE 
        WHEN invoice_number ~ '^[0-9]{4}-[0-9]{4}$' 
        THEN CAST(SPLIT_PART(invoice_number, '-', 2) AS INTEGER)
        ELSE 0
      END
    ), 0) + 1
    INTO next_sequence
    FROM invoices
    WHERE user_id = NEW.user_id
      AND invoice_number LIKE current_year || '-%';
    
    -- Generate the invoice number (YYYY-NNNN)
    new_invoice_number := current_year || '-' || LPAD(next_sequence::TEXT, 4, '0');
    NEW.invoice_number := new_invoice_number;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_generate_invoice_number
BEFORE INSERT OR UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION generate_invoice_number();

-- Add comment for documentation
COMMENT ON FUNCTION generate_invoice_number() IS 'Generates invoice numbers in format YYYY-NNNN (e.g., 2025-0001)';
