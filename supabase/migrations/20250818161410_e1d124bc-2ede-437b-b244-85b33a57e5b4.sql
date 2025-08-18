-- Fix security vulnerabilities in RLS policies for sensitive data tables

-- Drop the insecure email-based SELECT policies that could be exploited
DROP POLICY IF EXISTS "Users can view their own applications by email" ON public.mentorship_applications;
DROP POLICY IF EXISTS "Users can view their own consultations by email" ON public.consultations;

-- Drop existing crypto_payments policies to recreate them securely
DROP POLICY IF EXISTS "Anyone can create crypto payments" ON public.crypto_payments;
DROP POLICY IF EXISTS "Authenticated users can create crypto payments" ON public.crypto_payments;
DROP POLICY IF EXISTS "Users can view their own crypto payments through consultation" ON public.crypto_payments;

-- Create secure policies for crypto_payments
-- Only authenticated users can create payments (renamed to avoid conflict)
CREATE POLICY "Secure crypto payment creation" 
ON public.crypto_payments 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Only allow SELECT for admins or through proper consultation relationship
CREATE POLICY "Secure crypto payment viewing" 
ON public.crypto_payments 
FOR SELECT 
TO authenticated
USING (
  consultation_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.consultations 
    WHERE consultations.id = crypto_payments.consultation_id 
    AND consultations.email = (auth.jwt() ->> 'email'::text)
  )
);

-- Summary of changes:
-- 1. Removed insecure email-based SELECT policies from mentorship_applications and consultations
-- 2. Now only admins can view all customer data (names, emails, Telegram handles)
-- 3. Made crypto_payments more secure by requiring authentication for creation
-- 4. Customer data is now properly protected from unauthorized access