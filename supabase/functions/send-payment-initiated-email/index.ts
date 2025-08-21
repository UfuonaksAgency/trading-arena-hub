import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentInitiatedRequest {
  email: string;
  name: string;
  paymentAddress: string;
  amountTCN: number;
  amountUSD: number;
  expiresAt: string;
  qrCode?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const requestData: PaymentInitiatedRequest = await req.json();

    const formatTCN = (amount: number) => amount.toFixed(8);
    const expirationTime = new Date(requestData.expiresAt).toLocaleString();

    await resend.emails.send({
      from: 'Mr. K Trading Arena <noreply@tradewithmrk.com>',
      to: [requestData.email],
      subject: 'Payment Details - Complete Your Test Coin Payment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
          <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0369ff; margin: 0; font-size: 28px;">Payment Details Ready! 💰</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Complete your Test Coin payment to secure your consultation</p>
            </div>

            <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <h3 style="color: #92400e; margin: 0 0 10px 0;">⏰ Payment Expires In:</h3>
              <p style="color: #92400e; font-size: 18px; font-weight: bold; margin: 0;">${expirationTime}</p>
            </div>

            <div style="background: #f3f4f6; border-radius: 8px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #111827; margin: 0 0 20px 0;">Payment Information:</h3>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Amount (USD):</strong>
                <div style="background: white; padding: 12px; border-radius: 6px; font-size: 20px; font-weight: bold; color: #0369ff; margin-top: 5px;">
                  $${requestData.amountUSD}
                </div>
              </div>

              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Amount (TCN):</strong>
                <div style="background: white; padding: 12px; border-radius: 6px; font-family: monospace; margin-top: 5px; word-break: break-all;">
                  ${formatTCN(requestData.amountTCN)} TCN
                </div>
              </div>

              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Test Coin Address:</strong>
                <div style="background: white; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 12px; word-break: break-all; margin-top: 5px;">
                  ${requestData.paymentAddress}
                </div>
              </div>
            </div>

            <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #1e40af; margin: 0 0 15px 0;">📋 Payment Instructions:</h4>
              <ol style="color: #1e40af; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Send exactly <strong>${formatTCN(requestData.amountTCN)} TCN</strong> to the address above</li>
                <li style="margin-bottom: 8px;">Payment will be confirmed automatically within 10-15 minutes</li>
                <li style="margin-bottom: 8px;">Once confirmed, you'll receive another email and can schedule your consultation</li>
                <li style="margin-bottom: 8px;">Do not send from an exchange - use a personal wallet</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://tradewithmrk.com/book-consultation" 
                 style="background: #0369ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Return to Payment Page
              </a>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Having issues? Contact us at <a href="mailto:support@tradewithmrk.com" style="color: #0369ff;">support@tradewithmrk.com</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
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

    return new Response('Payment initiated email sent successfully', { 
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