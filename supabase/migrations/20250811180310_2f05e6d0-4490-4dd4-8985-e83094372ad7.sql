-- Restrict public access to sensitive crypto_payments data
-- Ensure RLS is enabled
ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view their crypto payments by consultation" ON public.crypto_payments;

-- Note: Admins retain full access via existing policy
-- "Admins can manage all crypto payments" (FOR ALL USING is_admin(auth.uid()))

-- No further changes needed; clients should use Edge Functions for reads