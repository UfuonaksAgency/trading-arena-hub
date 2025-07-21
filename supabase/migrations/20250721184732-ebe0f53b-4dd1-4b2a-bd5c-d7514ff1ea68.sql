-- Create free_resources table for admin management
CREATE TABLE public.free_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PDF', 'VIDEO', 'TOOL')),
  description TEXT NOT NULL,
  features TEXT[] NOT NULL,
  download_url TEXT,
  icon_name TEXT NOT NULL DEFAULT 'FileText',
  size_info TEXT NOT NULL,
  page_info TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.free_resources ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view active resources" 
ON public.free_resources 
FOR SELECT 
USING (is_active = true);

-- Create admin role enum
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Create user_roles table for admin access
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = $1
      AND role = 'admin'
  )
$$;

-- Admin policies for free_resources
CREATE POLICY "Admins can manage all resources" 
ON public.free_resources 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Policies for user_roles (only admins can manage roles)
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_free_resources_updated_at
BEFORE UPDATE ON public.free_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.free_resources (title, type, description, features, icon_name, size_info, page_info, display_order) VALUES
('Complete Trading Strategy Guide', 'PDF', 'Comprehensive 50-page guide covering risk management, entry/exit strategies, market analysis, and psychology. Perfect for beginners to intermediate traders.', ARRAY['Risk Management Framework', 'Chart Pattern Recognition', 'Entry/Exit Strategies', 'Market Psychology'], 'FileText', '4.2 MB', '50 pages', 1),
('Weekly Market Analysis Webinar', 'VIDEO', 'Live recorded sessions where Mr. K breaks down weekly market trends, identifies opportunities, and shares trade setups.', ARRAY['Live Market Analysis', 'Trade Setup Examples', 'Q&A Sessions', 'Market Outlook'], 'Video', '720p HD', '45 min', 2),
('Risk Management Calculator', 'TOOL', 'Excel spreadsheet tool to calculate position sizes, risk-to-reward ratios, and manage your trading portfolio effectively.', ARRAY['Position Size Calculator', 'R:R Ratio Analysis', 'Portfolio Tracker', 'Stop Loss Calculator'], 'Calculator', '1.1 MB', 'Excel Tool', 3),
('Crypto Trading Cheat Sheet', 'PDF', 'Quick reference guide for crypto trading including key indicators, support/resistance levels, and trading patterns.', ARRAY['Technical Indicators', 'Chart Patterns', 'Crypto-specific Tips', 'Quick Reference'], 'FileText', '2.8 MB', '12 pages', 4),
('Psychology of Trading Course', 'VIDEO', 'Deep dive into the mental aspects of trading, overcoming FOMO, managing emotions, and developing discipline.', ARRAY['Emotional Control', 'FOMO Management', 'Discipline Building', 'Mindset Training'], 'Video', '1080p HD', '2.5 hours', 5),
('Market Scanner Setup Guide', 'PDF', 'Step-by-step guide to setting up market scanners in TradingView and other platforms to find the best trading opportunities.', ARRAY['Scanner Configuration', 'Alert Setup', 'Screening Criteria', 'Platform Guides'], 'FileText', '3.5 MB', '28 pages', 6);