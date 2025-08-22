import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentSuccessRequest {
  userEmail: string;
  userName: string;
  paymentAddress: string;
  amountTCN: number;
  amountUSD: number;
  transactionHash?: string;
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
      transactionHash,
      consultationId 
    }: PaymentSuccessRequest = await req.json();

    // Email to user with payment success
    const userEmailResponse = await resend.emails.send({
      from: "Mr. K Trading Arena <noreply@tradewithmrk.com>",
      to: [userEmail],
      subject: "Payment Confirmed! Schedule Your Consultation Now 🎉",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold;">Payment Confirmed! 🎉</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Your consultation is ready to be scheduled</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 18px; margin-bottom: 25px;">Congratulations <strong>${userName}</strong>! 🚀</p>
            
            <p style="line-height: 1.6; margin-bottom: 25px; color: #e5e5e5;">
              Your payment has been successfully verified and your consultation booking is now confirmed. You can proceed to schedule your session at your convenience.
            </p>

            <div style="background: #10b981; color: white; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
              <h2 style="margin: 0 0 15px 0; font-size: 24px;">✅ Payment Verified</h2>
              <p style="margin: 0; font-size: 18px; opacity: 0.9;">Your ${amountTCN.toFixed(2)} TCN payment has been confirmed</p>
            </div>

            <div style="background: #2a2a2a; border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #10b981; margin: 0 0 20px 0; font-size: 20px; text-align: center;">📋 Payment Summary</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div>
                  <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff;">Amount Paid:</p>
                  <div style="background: #1a1a1a; padding: 12px; border-radius: 6px; text-align: center; font-size: 16px; color: #10b981;">
                    ${amountTCN.toFixed(2)} TCN
                  </div>
                </div>
                <div>
                  <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff;">USD Value:</p>
                  <div style="background: #1a1a1a; padding: 12px; border-radius: 6px; text-align: center; font-size: 16px; color: #10b981;">
                    $${amountUSD.toFixed(2)}
                  </div>
                </div>
              </div>
              
              ${transactionHash ? `
                <div style="margin-top: 15px;">
                  <p style="margin: 0 0 8px 0; font-weight: bold; color: #ffffff;">Transaction Hash:</p>
                  <div style="background: #1a1a1a; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; word-break: break-all; font-size: 12px; color: #888;">
                    ${transactionHash}
                  </div>
                </div>
              ` : ''}
            </div>

            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
              <h3 style="margin: 0 0 15px 0; font-size: 22px;">🗓️ Next Step: Schedule Your Session</h3>
              <p style="margin: 0 0 20px 0; opacity: 0.9; line-height: 1.6;">
                You can now schedule your 30-minute trading consultation. The scheduling link is available on the payment page, or you can contact us directly.
              </p>
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                  💡 <strong>Pro Tip:</strong> Come prepared with your specific trading questions to maximize the value of your consultation.
                </p>
              </div>
            </div>

            <div style="background: #374151; border-radius: 10px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #ffffff; margin: 0 0 15px 0; font-size: 18px;">What to Expect in Your Consultation:</h4>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #d1d5db;">
                <li>Personalized trading strategy review</li>
                <li>Risk management techniques</li>
                <li>Market analysis insights</li>
                <li>Q&A session tailored to your needs</li>
                <li>Actionable next steps for your trading journey</li>
              </ul>
            </div>

            <div style="border-top: 1px solid #444; padding-top: 25px; margin-top: 30px; text-align: center;">
              <p style="color: #10b981; font-size: 16px; margin-bottom: 15px; font-weight: bold;">
                🎯 Ready to take your trading to the next level? Let's get started!
              </p>
              <p style="color: #888; font-size: 14px; margin-bottom: 10px;">
                Questions? Contact us at <a href="mailto:contact@tradewithmrk.com" style="color: #4f46e5;">contact@tradewithmrk.com</a>
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
      subject: `Payment Confirmed - ${userName} Ready to Schedule`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; color: #333;">
          <div style="background: #28a745; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Payment Confirmed ✅</h1>
            <p style="margin: 5px 0 0 0;">Client ready to schedule consultation</p>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #28a745; margin-bottom: 20px;">Successful Payment Details</h2>
            
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
                  <td style="padding: 10px 0; font-weight: bold;">Amount Paid:</td>
                  <td style="padding: 10px 0; color: #28a745; font-weight: bold;">${amountTCN.toFixed(2)} TCN ($${amountUSD.toFixed(2)})</td>
                </tr>
                ${transactionHash ? `
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 10px 0; font-weight: bold;">Transaction Hash:</td>
                  <td style="padding: 10px 0; font-family: monospace; font-size: 12px; word-break: break-all;">${transactionHash}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px 0; font-weight: bold;">Consultation ID:</td>
                  <td style="padding: 10px 0; font-family: monospace;">${consultationId}</td>
                </tr>
              </table>
            </div>

            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px;">
              <p style="margin: 0; color: #155724;"><strong>Status Update:</strong></p>
              <p style="margin: 5px 0 0 0; color: #155724;">Client has been notified of successful payment and can now schedule their consultation. Monitor the admin panel for scheduling updates.</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Payment success emails sent successfully:", { userEmailResponse, adminEmailResponse });

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
    console.error("Error in send-payment-success-email function:", error);
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