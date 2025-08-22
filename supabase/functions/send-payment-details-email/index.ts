import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentDetailsRequest {
  userEmail: string;
  userName: string;
  paymentAddress: string;
  amountTCN: number;
  amountUSD: number;
  expiresAt: string;
  consultationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userEmail, 
      userName, 
      paymentAddress, 
      amountTCN, 
      amountUSD, 
      expiresAt,
      consultationId 
    }: PaymentDetailsRequest = await req.json();

    const expirationTime = new Date(expiresAt).toLocaleString('en-US', {
      timeZone: 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });

    // Email to user with payment details
    const userEmailResponse = await resend.emails.send({
      from: "Mr. K Trading Arena <noreply@tradewithmrk.com>",
      to: [userEmail],
      subject: "Payment Details for Your Trading Consultation 💰",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Payment Details Ready! 🚀</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Complete your payment to secure your consultation</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 18px; margin-bottom: 25px;">Hi <strong>${userName}</strong>,</p>
            
            <p style="line-height: 1.6; margin-bottom: 25px; color: #e5e5e5;">
              Your consultation request has been processed! Please complete the payment using the Test Coin (TCN) details below to confirm your booking.
            </p>

            <div style="background: #2a2a2a; border: 2px solid #4f46e5; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h2 style="color: #4f46e5; margin: 0 0 20px 0; font-size: 22px; text-align: center;">💳 Payment Information</h2>
              
              <div style="margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff;">Payment Address:</p>
                <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; word-break: break-all; border: 1px solid #444;">
                  ${paymentAddress}
                </div>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                  <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff;">Amount (TCN):</p>
                  <div style="background: #1a1a1a; padding: 12px; border-radius: 6px; text-align: center; font-size: 18px; font-weight: bold; color: #4f46e5;">
                    ${amountTCN.toFixed(2)} TCN
                  </div>
                </div>
                <div>
                  <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff;">USD Value:</p>
                  <div style="background: #1a1a1a; padding: 12px; border-radius: 6px; text-align: center; font-size: 18px; font-weight: bold; color: #10b981;">
                    $${amountUSD.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div style="background: #ef4444; color: white; padding: 15px; border-radius: 8px; text-align: center;">
                <p style="margin: 0; font-weight: bold; font-size: 16px;">⏰ Payment Expires: ${expirationTime}</p>
              </div>
            </div>

            <div style="background: #fbbf24; color: #1a1a1a; padding: 20px; border-radius: 10px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                ⚠️ Important Instructions
              </h3>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
                <li><strong>DO NOT refresh or close the payment page</strong> - Your payment details will be lost</li>
                <li>Send the <strong>exact amount</strong> of ${amountTCN.toFixed(2)} TCN to the address above</li>
                <li>Payment confirmation typically takes 2-3 minutes</li>
                <li>Keep this email for your records</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #10b981; font-size: 16px; margin-bottom: 15px;">
                ✅ After payment confirmation, you'll be able to schedule your consultation immediately
              </p>
            </div>

            <div style="border-top: 1px solid #444; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin-bottom: 10px;">
                Need help? Contact us at <a href="mailto:contact@tradewithmrk.com" style="color: #4f46e5;">contact@tradewithmrk.com</a>
              </p>
              <p style="color: #666; font-size: 12px; margin: 0;">
                Consultation ID: ${consultationId}
              </p>
            </div>
          </div>
        </div>
      `,
    });

    // Email to admin notification
    const adminEmailResponse = await resend.emails.send({
      from: "Mr. K Trading Arena <noreply@tradewithmrk.com>",
      to: ["contact@tradewithmrk.com"],
      subject: `New Payment Initiated - ${userName} (${userEmail})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; color: #333;">
          <div style="background: #343a40; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Payment Initiated 💰</h1>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #343a40; margin-bottom: 20px;">Payment Details</h2>
            
            <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 10px 0; font-weight: bold;">Client Name:</td>
                  <td style="padding: 10px 0;">${userName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 10px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 10px 0;">${userEmail}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 10px 0; font-weight: bold;">Payment Address:</td>
                  <td style="padding: 10px 0; font-family: monospace; word-break: break-all;">${paymentAddress}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 10px 0; font-weight: bold;">Amount:</td>
                  <td style="padding: 10px 0;">${amountTCN.toFixed(2)} TCN ($${amountUSD.toFixed(2)})</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 10px 0; font-weight: bold;">Expires:</td>
                  <td style="padding: 10px 0;">${expirationTime}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; font-weight: bold;">Consultation ID:</td>
                  <td style="padding: 10px 0; font-family: monospace;">${consultationId}</td>
                </tr>
              </table>
            </div>

            <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 15px;">
              <p style="margin: 0; color: #0c5460;"><strong>Next Steps:</strong></p>
              <p style="margin: 5px 0 0 0; color: #0c5460;">Monitor payment status in the admin panel. Client will receive confirmation once payment is verified.</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Payment details emails sent successfully:", { userEmailResponse, adminEmailResponse });

    return new Response(JSON.stringify({ 
      success: true, 
      userEmailId: userEmailResponse.id,
      adminEmailId: adminEmailResponse.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-payment-details-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);