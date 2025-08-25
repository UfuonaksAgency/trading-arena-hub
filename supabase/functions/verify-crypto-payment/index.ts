import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPaymentRequest {
  paymentId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId }: VerifyPaymentRequest = await req.json();
    
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    console.log(`🔍 Verifying payment: ${paymentId}`);

    // Initialize Supabase with service role for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('crypto_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found');
    }

    console.log(`Payment found with status: ${payment.status}`);

    // If already completed, return current status
    if (payment.status === 'completed') {
      return new Response(JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          nowpayments_payment_id: payment.nowpayments_payment_id,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if payment has expired
    const now = new Date();
    const expiresAt = new Date(payment.expires_at);
    if (now > expiresAt && payment.status === 'pending') {
      console.log('Payment expired, updating status');
      await supabase
        .from('crypto_payments')
        .update({ status: 'expired' })
        .eq('id', paymentId);

      return new Response(JSON.stringify({
        success: false,
        payment: {
          id: payment.id,
          status: 'expired',
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If we have a NOWPayments payment ID, check status via API
    if (payment.nowpayments_payment_id) {
      const nowpaymentsApiKey = Deno.env.get('NOWPAYMENTS_API_KEY');
      
      if (!nowpaymentsApiKey) {
        console.error('Missing NOWPAYMENTS_API_KEY');
        throw new Error('Missing NOWPayments API credentials');
      }

      console.log(`Checking NOWPayments API for payment: ${payment.nowpayments_payment_id}`);

      // Check payment status via NOWPayments API
      const nowPaymentsResponse = await fetch(`https://api.nowpayments.io/v1/payment/${payment.nowpayments_payment_id}`, {
        method: 'GET',
        headers: {
          'x-api-key': nowpaymentsApiKey,
        },
      });

      if (nowPaymentsResponse.ok) {
        const nowPaymentsData = await nowPaymentsResponse.json();
        console.log(`NOWPayments API response:`, nowPaymentsData);
        
        // Map NOWPayments status to our internal status
        let newStatus = payment.status;
        
        switch (nowPaymentsData.payment_status) {
          case 'finished':
          case 'confirmed':
            newStatus = 'completed';
            break;
          case 'partially_paid':
            newStatus = 'partial';
            break;
          case 'failed':
          case 'expired':
            newStatus = 'expired';
            break;
          case 'waiting':
          case 'sending':
          default:
            newStatus = 'pending';
            break;
        }

        // Update payment record if status changed
        if (newStatus !== payment.status) {
          console.log(`Updating payment status from ${payment.status} to ${newStatus}`);
          await supabase
            .from('crypto_payments')
            .update({
              status: newStatus,
              payment_data: {
                ...payment.payment_data,
                last_api_check: new Date().toISOString(),
                nowpayments_status: nowPaymentsData,
              }
            })
            .eq('id', paymentId);

          // Also update consultation payment status if linked
          if (payment.consultation_id && newStatus === 'completed') {
            console.log(`Updating consultation payment status to paid for consultation: ${payment.consultation_id}`);
            await supabase
              .from('consultations')
              .update({
                payment_status: 'paid',
                admin_notes: `Payment confirmed via API verification. NOWPayments ID: ${payment.nowpayments_payment_id}. Amount: ${nowPaymentsData.outcome_amount} ${nowPaymentsData.outcome_currency}.`
              })
              .eq('id', payment.consultation_id);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          payment: {
            id: payment.id,
            status: newStatus,
            nowpayments_payment_id: payment.nowpayments_payment_id,
            nowpayments_status: nowPaymentsData.payment_status,
            outcome_amount: nowPaymentsData.outcome_amount,
            outcome_currency: nowPaymentsData.outcome_currency,
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.error('NOWPayments API error:', nowPaymentsResponse.status);
      }
    }

    // Return current status if no API check was possible
    return new Response(JSON.stringify({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        nowpayments_payment_id: payment.nowpayments_payment_id,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});