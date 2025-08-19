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
          from: 'Mr. K Trading Arena <noreply@tradewithmrk.com>',
          to: [payment.consultations[0].email],
          subject: '🎉 Payment Confirmed - Schedule Your Trading Consultation',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
              <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #059669; margin: 0; font-size: 32px;">🎉 Payment Confirmed!</h1>
                  <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 18px;">Your trading consultation is ready to be scheduled</p>
                </div>

                <div style="background: #d1fae5; border: 2px solid #059669; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
                  <h2 style="color: #065f46; margin: 0 0 15px 0;">Hello ${payment.consultations[0].name}!</h2>
                  <p style="color: #065f46; font-size: 16px; margin: 0 0 15px 0;">
                    Your Bitcoin payment has been successfully confirmed and verified on the blockchain.
                  </p>
                  <p style="color: #065f46; font-size: 16px; font-weight: bold; margin: 0;">
                    You can now schedule your 30-minute trading strategy session!
                  </p>
                </div>

                <div style="background: #f3f4f6; border-radius: 8px; padding: 25px; margin: 25px 0;">
                  <h3 style="color: #111827; margin: 0 0 20px 0;">✅ Payment Details Confirmed:</h3>
                  <div style="display: grid; gap: 12px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong style="color: #374151;">Amount:</strong>
                      <span>${payment.amount_crypto} BTC ($300 USD)</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong style="color: #374151;">Transaction ID:</strong>
                      <span style="font-family: monospace; font-size: 12px;">${webhookData.txid}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                      <strong style="color: #374151;">Confirmations:</strong>
                      <span style="color: #059669; font-weight: bold;">${webhookData.confirmations} ✓</span>
                    </div>
                  </div>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://tradewithmrk.com/book-consultation" 
                     style="background: #059669; color: white; padding: 18px 36px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">
                    Schedule Your Session Now
                  </a>
                </div>

                <div style="background: #dbeafe; border-radius: 8px; padding: 20px; margin: 25px 0;">
                  <h4 style="color: #1e40af; margin: 0 0 15px 0;">📅 Next Steps:</h4>
                  <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Click the button above to access the scheduling page</li>
                    <li style="margin-bottom: 8px;">Select your preferred time slot using Calendly</li>
                    <li style="margin-bottom: 8px;">You'll receive a meeting confirmation with the video call link</li>
                    <li style="margin-bottom: 8px;">Prepare any specific questions about your trading strategy</li>
                  </ul>
                </div>

                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                    Questions? Contact us at <a href="mailto:support@tradewithmrk.com" style="color: #0369ff;">support@tradewithmrk.com</a>
                  </p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    Follow us: 
                    <a href="https://t.me/Mrk_trading" style="color: #0369ff; margin: 0 5px;">Telegram</a> |
                    <a href="https://x.com/kelvinc003" style="color: #0369ff; margin: 0 5px;">X (Twitter)</a> |
                    <a href="https://www.instagram.com/mrktradingarena?igsh=bjI4ZGRsZmI2cWdo&utm_source=qr" style="color: #0369ff; margin: 0 5px;">Instagram</a>
                  </p>
                </div>
              </div>
            </div>
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