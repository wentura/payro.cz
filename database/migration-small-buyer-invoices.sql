-- Migration: Support "small buyer" invoices without client
-- Allows invoices without client_id only when currency is CZK and total is <= 10 000

ALTER TABLE invoices
ALTER COLUMN client_id DROP NOT NULL;

ALTER TABLE invoices
DROP CONSTRAINT IF EXISTS invoices_small_buyer_check;

ALTER TABLE invoices
ADD CONSTRAINT invoices_small_buyer_check
CHECK (
  client_id IS NOT NULL
  OR (currency = 'CZK' AND total_amount <= 10000)
);

