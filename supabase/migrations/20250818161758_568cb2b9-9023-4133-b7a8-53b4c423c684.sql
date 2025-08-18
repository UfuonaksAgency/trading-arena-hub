-- Create explicit restrictive policies for all sensitive tables

-- First, let's see what policies currently exist and ensure we have the right restrictions

-- For mentorship_applications: Add explicit policy to deny all non-admin SELECT access
CREATE POLICY "Deny all non-admin access to applications"
ON public.mentorship_applications
FOR SELECT
USING (false);

-- For consultations: Add explicit policy to deny all non-admin SELECT access  
CREATE POLICY "Deny all non-admin access to consultations"
ON public.consultations
FOR SELECT 
USING (false);

-- Update the admin policies to have higher priority by recreating them
DROP POLICY IF EXISTS "Admins can view all applications" ON public.mentorship_applications;
DROP POLICY IF EXISTS "Admins can view all consultations" ON public.consultations;

-- Recreate admin policies with clear precedence
CREATE POLICY "Admin only access to applications"
ON public.mentorship_applications
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admin only access to consultations" 
ON public.consultations
FOR SELECT
TO authenticated  
USING (is_admin(auth.uid()));

-- Ensure analytics and download tables are also properly restricted
CREATE POLICY "Deny public access to analytics" 
ON public.analytics_events
FOR SELECT
USING (false);

CREATE POLICY "Deny public access to downloads"
ON public.resource_downloads  
FOR SELECT
USING (false);

-- Note: The admin SELECT policies for analytics_events and resource_downloads already exist
-- This just adds explicit denial for non-admin access