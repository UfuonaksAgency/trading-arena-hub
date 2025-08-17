-- Create RLS policies to allow users to view their own consultation and mentorship application data
-- This addresses the security concern where users cannot access their own submitted data

-- Add RLS policy for consultations - allow users to view their own consultations by email
CREATE POLICY "Users can view their own consultations by email" 
ON public.consultations 
FOR SELECT 
USING (
  auth.jwt() ->> 'email' = email OR 
  (auth.jwt() ->> 'email' IS NOT NULL AND email IS NOT NULL AND auth.jwt() ->> 'email' = email)
);

-- Add RLS policy for mentorship applications - allow users to view their own applications by email  
CREATE POLICY "Users can view their own applications by email"
ON public.mentorship_applications
FOR SELECT
USING (
  auth.jwt() ->> 'email' = email OR
  (auth.jwt() ->> 'email' IS NOT NULL AND email IS NOT NULL AND auth.jwt() ->> 'email' = email)
);