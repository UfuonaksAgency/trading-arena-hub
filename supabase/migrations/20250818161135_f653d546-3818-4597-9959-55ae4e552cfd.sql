-- Fix security vulnerabilities in RLS policies for sensitive data tables

-- Drop the insecure email-based SELECT policies that could be exploited
DROP POLICY IF EXISTS "Users can view their own applications by email" ON public.mentorship_applications;
DROP POLICY IF EXISTS "Users can view their own consultations by email" ON public.consultations;

-- Ensure crypto_payments has proper access restrictions
DROP POLICY IF EXISTS "Anyone can create crypto payments" ON public.crypto_payments;

-- Create more secure policies for crypto_payments
-- Only authenticated users can create payments
CREATE POLICY "Authenticated users can create crypto payments" 
ON public.crypto_payments 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Only allow SELECT for admins or if there's a specific consultation_id match with proper authentication
CREATE POLICY "Users can view their own crypto payments through consultation" 
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

-- The admin policies remain intact for all tables as they are secure:
-- - "Admins can view all applications" on mentorship_applications
-- - "Admins can view all consultations" on consultations  
-- - "Admins can manage all crypto payments" on crypto_payments

-- INSERT policies remain for public form submissions:
-- - "Anyone can submit applications" on mentorship_applications
-- - "Anyone can submit consultation requests" on consultations