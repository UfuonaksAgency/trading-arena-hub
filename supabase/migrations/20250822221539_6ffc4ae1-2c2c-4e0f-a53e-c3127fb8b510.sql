-- Remove Coinremitter column from crypto_payments table
ALTER TABLE public.crypto_payments 
DROP COLUMN IF EXISTS coinremitter_invoice_id;