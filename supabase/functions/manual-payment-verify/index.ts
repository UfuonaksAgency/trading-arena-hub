import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManualVerifyRequest {
  consultationId: string;
  adminKey: string;
  paymentDetails?: {
    transactionHash?: string;
    amount?: number;
    currency?: string;
    notes?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { consultationId, adminKey, paymentDetails }: ManualVerifyRequest = await req.json();
    
    // Simple admin key check (in production, use proper authentication)
    const expectedAdminKey = Deno.env.get('ADMIN_MANUAL_VERIFY_KEY') || 'admin123';
    if (adminKey !== expectedAdminKey) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!consultationId) {
      return new Response('Consultation ID is required', { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if consultation exists
    const { data: consultation, error: fetchError } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .single();

    if (fetchError || !consultation) {
      return new Response('Consultation not found', { status: 404 });
    }

    // Update consultation payment status
    const adminNotes = `Payment manually verified by admin. ${paymentDetails?.notes || ''} ${
      paymentDetails?.transactionHash ? `Transaction: ${paymentDetails.transactionHash}` : ''
    } ${paymentDetails?.amount && paymentDetails?.currency ? `Amount: ${paymentDetails.amount} ${paymentDetails.currency}` : ''}`.trim();

    const { error: updateError } = await supabase
      .from('consultations')
      .update({
        payment_status: 'paid',
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', consultationId);

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ Payment manually verified for consultation ${consultationId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment status updated successfully',
        consultationId 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Manual verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});