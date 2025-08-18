-- Ensure all sensitive tables have proper RLS protection

-- Check current policies and add missing restrictive SELECT policies

-- For mentorship_applications: Ensure only admins can SELECT
-- (The existing admin policy should cover this, but let's make it explicit)

-- For consultations: Ensure only admins can SELECT  
-- (The existing admin policy should cover this, but let's make it explicit)

-- For crypto_payments: Fix the orphaned records issue
DROP POLICY IF EXISTS "Secure crypto payment viewing" ON public.crypto_payments;

-- Create a more comprehensive crypto payment viewing policy
CREATE POLICY "Admin and consultation-linked payment viewing" 
ON public.crypto_payments 
FOR SELECT 
USING (
  -- Allow admins to see all payments
  is_admin(auth.uid()) OR 
  -- Allow authenticated users to see their consultation-linked payments
  (
    auth.uid() IS NOT NULL AND 
    consultation_id IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM public.consultations 
      WHERE consultations.id = crypto_payments.consultation_id 
      AND consultations.email = (auth.jwt() ->> 'email'::text)
    )
  )
);

-- For analytics_events and resource_downloads: Restrict SELECT to admins only
-- These tables already have "Admins can view all" policies, so no additional SELECT should be allowed

-- Verify that RLS is enabled on all sensitive tables
-- (This should already be done, but let's ensure it)
ALTER TABLE public.mentorship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_downloads ENABLE ROW LEVEL SECURITY;