import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookData = await req.json();

    // Initialize Supabase with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find payment by address
    const { data: payment, error: paymentError } = await supabase
      .from('crypto_payments')
      .select(`
        *,
        consultations (
          id,
          name,
          email
        )
      `)
      .eq('payment_address', webhookData.address)
      .single();

    if (paymentError || !payment) {
      return new Response('Payment not found', { status: 404 });
    }

    // Skip if already completed
    if (payment.status === 'completed') {
      return new Response('Payment already completed', { status: 200 });
    }

    // Update payment status based on webhook data
    let newStatus = 'pending';
    
    if (webhookData.confirmations >= 1 && 
        parseFloat(webhookData.amount) >= payment.amount_crypto) {
      newStatus = 'completed';
    } else if (parseFloat(webhookData.amount) > 0) {
      newStatus = 'partial';
    }

    // Update payment record
    const { error: updateError } = await supabase
      .from('crypto_payments')
      .update({
        status: newStatus,
        confirmations: webhookData.confirmations || 0,
        transaction_hash: webhookData.txid,
        payment_data: {
          ...payment.payment_data,
          webhook_data: webhookData,
          updated_via_webhook: true,
          webhook_received_at: new Date().toISOString(),
        }
      })
      .eq('id', payment.id);

    if (updateError) {
      throw updateError;
    }

    // Send email notification if payment is completed
    if (newStatus === 'completed' && payment.consultations?.[0]?.email) {
      try {
        const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
        
        await resend.emails.send({
          from: 'Trading Consultations <noreply@yourdomain.com>',
          to: [payment.consultations[0].email],
          subject: 'Payment Confirmed - Your Trading Consultation',
          html: `
            <h1>Payment Confirmed!</h1>
            <p>Hello ${payment.consultations[0].name},</p>
            
            <p>Your Bitcoin payment of $300 USD has been confirmed. You can now proceed to schedule your trading consultation.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Payment Details:</h3>
              <p><strong>Amount:</strong> ${payment.amount_crypto} BTC ($300 USD)</p>
              <p><strong>Transaction:</strong> ${webhookData.txid}</p>
              <p><strong>Confirmations:</strong> ${webhookData.confirmations}</p>
            </div>
            
            <p>Please return to the consultation booking page to schedule your session with the Calendly widget.</p>
            
            <p>Thank you for your payment!</p>
          `,
        });

      } catch (emailError) {
        // Don't fail the webhook for email errors
      }
    }


    return new Response('Webhook processed successfully', { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});