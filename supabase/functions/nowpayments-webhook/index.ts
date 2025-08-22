import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NOWPaymentsWebhook {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  outcome_amount: number;
  outcome_currency: string;
}

async function verifyIPNSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    const hmacBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(hmacBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying IPN signature:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle validation requests (GET or POST without body)
  if (req.method === 'GET') {
    console.log('Webhook validation request received');
    return new Response('NOWPayments webhook endpoint is active', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('\n🔔 NOWPAYMENTS WEBHOOK RECEIVED');
    
    const rawBody = await req.text();
    
    if (!rawBody || rawBody.trim() === '') {
      console.log('Empty webhook request - likely validation');
      return new Response('NOWPayments webhook endpoint is active', { 
        status: 200,
        headers: corsHeaders 
      });
    }

    // Verify IPN signature if provided
    const ipnSecret = Deno.env.get('NOWPAYMENTS_IPN_SECRET');
    const signature = req.headers.get('x-nowpayments-sig');
    
    if (ipnSecret && signature) {
      console.log('Verifying IPN signature...');
      if (!(await verifyIPNSignature(rawBody, signature, ipnSecret))) {
        console.error('IPN signature verification failed');
        return new Response('Invalid signature', { status: 401 });
      }
      console.log('✅ IPN signature verified');
    } else {
      console.log('⚠️ No IPN signature verification (missing secret or signature)');
    }

    const webhookData: NOWPaymentsWebhook = JSON.parse(rawBody);
    console.log('Webhook data received:', {
      payment_id: webhookData.payment_id,
      payment_status: webhookData.payment_status,
      pay_address: webhookData.pay_address,
      outcome_amount: webhookData.outcome_amount,
    });

    // Initialize Supabase with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find payment by NOWPayments payment ID
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
      .eq('nowpayments_payment_id', webhookData.payment_id)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', webhookData.payment_id);
      return new Response('Payment not found', { status: 404 });
    }

    console.log('Payment found:', payment.id);

    // Skip if already completed
    if (payment.status === 'completed') {
      console.log('Payment already completed');
      return new Response('Payment already completed', { status: 200 });
    }

    // Map NOWPayments status to our internal status
    let newStatus = 'pending';
    
    switch (webhookData.payment_status) {
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

    console.log(`Updating payment status from ${payment.status} to ${newStatus}`);

    // Update payment record
    const { error: updateError } = await supabase
      .from('crypto_payments')
      .update({
        status: newStatus,
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

    console.log('✅ Payment status updated successfully');

    // Send email notification if payment is completed
    if (newStatus === 'completed' && payment.consultations?.[0]?.email) {
      try {
        console.log('Sending completion email...');
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
                    Your ${webhookData.pay_currency.toUpperCase()} payment has been successfully confirmed and verified on the blockchain.
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
                      <span>${webhookData.outcome_amount} ${webhookData.outcome_currency.toUpperCase()} ($${webhookData.price_amount} USD)</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong style="color: #374151;">Payment ID:</strong>
                      <span style="font-family: monospace; font-size: 12px;">${webhookData.payment_id}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                      <strong style="color: #374151;">Status:</strong>
                      <span style="color: #059669; font-weight: bold;">${webhookData.payment_status.toUpperCase()} ✓</span>
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

        console.log('✅ Email sent successfully');

      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the webhook for email errors
      }
    }

    return new Response('Webhook processed successfully', { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});