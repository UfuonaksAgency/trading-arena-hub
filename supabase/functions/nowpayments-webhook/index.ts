import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NOWPaymentsWebhook {
  payment_id: string;
  payment_status: string;
  outcome_amount: number;
  outcome_currency: string;
  order_id?: string;
}

// Verify NOWPayments IPN signature using Web Crypto API
async function verifyIPNSignature(body: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
      
    return expectedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Respond to GET requests for webhook validation
  if (req.method === 'GET') {
    return new Response('NOWPayments webhook endpoint is active', {
      headers: corsHeaders,
    });
  }

  try {
    const ipnSecret = Deno.env.get('NOWPAYMENTS_IPN_SECRET');
    if (!ipnSecret) {
      console.error('NOWPAYMENTS_IPN_SECRET not configured');
      return new Response('Webhook not configured', { status: 500 });
    }

    // Get the raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('x-nowpayments-sig');

    if (!signature) {
      console.error('Missing signature header');
      return new Response('Missing signature', { status: 400 });
    }

    // Verify signature
    if (!(await verifyIPNSignature(rawBody, signature, ipnSecret))) {
      console.error('Invalid signature');
      return new Response('Invalid signature', { status: 403 });
    }

    const webhookData: NOWPaymentsWebhook = JSON.parse(rawBody);
    console.log('Received NOWPayments webhook:', webhookData);

    // Initialize Supabase with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find payment record by NOWPayments payment ID
    let paymentRecord = null;
    let consultationRecord = null;

    if (webhookData.payment_id) {
      const { data: payment } = await supabase
        .from('crypto_payments')
        .select('*')
        .eq('nowpayments_payment_id', webhookData.payment_id)
        .single();
      
      paymentRecord = payment;
    }

    // If no payment found by payment_id, try by order_id (consultation_id)
    if (!paymentRecord && webhookData.order_id) {
      const { data: consultation } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', webhookData.order_id)
        .single();
      
      consultationRecord = consultation;

      if (consultation) {
        // Find associated payment
        const { data: payment } = await supabase
          .from('crypto_payments')
          .select('*')
          .eq('consultation_id', consultation.id)
          .single();
        
        paymentRecord = payment;
      }
    }

    if (!paymentRecord && !consultationRecord) {
      console.error('No payment or consultation found for webhook');
      return new Response('Payment not found', { status: 404 });
    }

    // Map NOWPayments status to our internal status
    let newStatus = 'pending';
    let consultationStatus = 'unpaid';
    
    switch (webhookData.payment_status) {
      case 'finished':
      case 'confirmed':
        newStatus = 'completed';
        consultationStatus = 'paid';
        break;
      case 'partially_paid':
        newStatus = 'partial';
        consultationStatus = 'processing';
        break;
      case 'failed':
      case 'expired':
        newStatus = 'expired';
        consultationStatus = 'unpaid';
        break;
      case 'waiting':
      case 'sending':
      default:
        newStatus = 'pending';
        consultationStatus = 'processing';
        break;
    }

    console.log(`Updating payment status to: ${newStatus}, consultation status to: ${consultationStatus}`);

    // Update crypto_payments table if we have a payment record
    if (paymentRecord) {
      await supabase
        .from('crypto_payments')
        .update({
          status: newStatus,
          payment_data: {
            ...paymentRecord.payment_data,
            webhook_received: new Date().toISOString(),
            nowpayments_status: webhookData,
          }
        })
        .eq('id', paymentRecord.id);

      // Update consultation if linked
      if (paymentRecord.consultation_id) {
        await supabase
          .from('consultations')
          .update({
            payment_status: consultationStatus,
            admin_notes: newStatus === 'completed' 
              ? `Payment confirmed via webhook. NOWPayments ID: ${webhookData.payment_id}. Amount: ${webhookData.outcome_amount} ${webhookData.outcome_currency}.`
              : `Payment status updated via webhook: ${webhookData.payment_status}`
          })
          .eq('id', paymentRecord.consultation_id);
      }
    }

    // Update consultation directly if no payment record but we have consultation
    if (!paymentRecord && consultationRecord) {
      await supabase
        .from('consultations')
        .update({
          payment_status: consultationStatus,
          admin_notes: `Payment status updated via webhook: ${webhookData.payment_status}. NOWPayments ID: ${webhookData.payment_id}.`
        })
        .eq('id', consultationRecord.id);
    }

    // Send success email for confirmed payments
    if (newStatus === 'completed' && (paymentRecord?.consultation_id || consultationRecord?.id)) {
      const consultationId = paymentRecord?.consultation_id || consultationRecord?.id;
      
      try {
        await supabase.functions.invoke('send-payment-success-email', {
          body: { consultationId }
        });
        console.log('Payment success email sent');
      } catch (emailError) {
        console.error('Failed to send payment success email:', emailError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Webhook processed successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});