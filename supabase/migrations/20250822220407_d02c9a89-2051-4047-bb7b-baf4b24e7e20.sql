-- Add nowpayments_payment_id column to crypto_payments table
ALTER TABLE public.crypto_payments 
ADD COLUMN nowpayments_payment_id text;