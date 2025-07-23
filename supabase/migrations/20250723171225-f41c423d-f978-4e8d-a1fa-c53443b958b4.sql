-- Create consultations table for booking management
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  telegram TEXT,
  preferred_time TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled', 'paid')),
  calendly_event_uri TEXT,
  calendly_invitee_uri TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resource_downloads table for tracking analytics
CREATE TABLE public.resource_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES public.free_resources(id) ON DELETE CASCADE,
  user_ip TEXT,
  user_agent TEXT,
  session_id TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_downloads ENABLE ROW LEVEL SECURITY;

-- Create policies for consultations
CREATE POLICY "Admins can view all consultations" 
ON public.consultations 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all consultations" 
ON public.consultations 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can submit consultation requests" 
ON public.consultations 
FOR INSERT 
WITH CHECK (true);

-- Create policies for resource downloads
CREATE POLICY "Admins can view all downloads" 
ON public.resource_downloads 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can track downloads" 
ON public.resource_downloads 
FOR INSERT 
WITH CHECK (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_consultations_updated_at
BEFORE UPDATE ON public.consultations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_consultations_status ON public.consultations(status);
CREATE INDEX idx_consultations_created_at ON public.consultations(created_at);
CREATE INDEX idx_resource_downloads_resource_id ON public.resource_downloads(resource_id);
CREATE INDEX idx_resource_downloads_downloaded_at ON public.resource_downloads(downloaded_at);