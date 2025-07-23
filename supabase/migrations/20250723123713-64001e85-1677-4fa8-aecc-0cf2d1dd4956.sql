-- Create mentorship_applications table
CREATE TABLE public.mentorship_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  telegram TEXT NOT NULL,
  experience TEXT NOT NULL,
  trading_history TEXT NOT NULL,
  goals TEXT NOT NULL,
  availability TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mentorship_applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all applications" 
ON public.mentorship_applications 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all applications" 
ON public.mentorship_applications 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can submit applications" 
ON public.mentorship_applications 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mentorship_applications_updated_at
BEFORE UPDATE ON public.mentorship_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();