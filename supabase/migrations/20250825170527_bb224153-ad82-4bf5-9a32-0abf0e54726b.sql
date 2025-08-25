-- Enable real-time updates for consultations table
ALTER TABLE public.consultations REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.consultations;

-- Enable real-time updates for crypto_payments table  
ALTER TABLE public.crypto_payments REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.crypto_payments;