import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  reason: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, reason, message }: ContactRequest = await req.json();

    // Validate required fields
    if (!name || !email || !reason || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email to contact@tradewithmrk.com
    const emailResponse = await resend.emails.send({
      from: "Mr. K Trading Arena <noreply@tradewithmrk.com>",
      to: ["contact@tradewithmrk.com"],
      replyTo: [email], // Allow direct reply to the user
      subject: `Contact Form: ${reason} - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; color: #333;">
          <div style="background: #343a40; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission 📧</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">From your website contact form</p>
          </div>
          
          <div style="padding: 30px;">
            <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 25px; margin-bottom: 20px;">
              <h2 style="color: #343a40; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">Contact Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 12px 0; font-weight: bold; width: 30%;">Name:</td>
                  <td style="padding: 12px 0;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 12px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 12px 0;"><a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #dee2e6;">
                  <td style="padding: 12px 0; font-weight: bold;">Inquiry Type:</td>
                  <td style="padding: 12px 0;">
                    <span style="background: #4f46e5; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px;">
                      ${reason}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; font-weight: bold; vertical-align: top;">Message:</td>
                  <td style="padding: 12px 0;">
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #4f46e5; line-height: 1.6;">
                      ${message.replace(/\n/g, '<br>')}
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; color: #0066cc;"><strong>📝 Action Required:</strong></p>
              <p style="margin: 5px 0 0 0; color: #0066cc;">Please respond to this inquiry promptly. You can reply directly to this email to contact ${name}.</p>
            </div>

            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                Submitted on ${new Date().toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}
              </p>
            </div>
          </div>
        </div>
      `,
    });

    // Send confirmation email to the user
    const confirmationEmailResponse = await resend.emails.send({
      from: "Mr. K Trading Arena <noreply@tradewithmrk.com>",
      to: [email],
      subject: "We received your message - Mr. K Trading Arena",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Message Received! 📬</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Thank you for reaching out to us</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 18px; margin-bottom: 25px;">Hi <strong>${name}</strong>,</p>
            
            <p style="line-height: 1.6; margin-bottom: 25px; color: #e5e5e5;">
              Thank you for contacting Mr. K Trading Arena! We have successfully received your message regarding <strong>"${reason}"</strong> and will get back to you as soon as possible.
            </p>

            <div style="background: #2a2a2a; border: 2px solid #4f46e5; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #4f46e5; margin: 0 0 15px 0; font-size: 20px;">📋 Your Message Summary</h3>
              <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="margin: 0; color: #888; font-size: 14px; margin-bottom: 8px;">Inquiry Type:</p>
                <p style="margin: 0; color: #4f46e5; font-weight: bold;">${reason}</p>
              </div>
              <div style="background: #1a1a1a; padding: 15px; border-radius: 8px;">
                <p style="margin: 0; color: #888; font-size: 14px; margin-bottom: 8px;">Your Message:</p>
                <p style="margin: 0; line-height: 1.6; color: #e5e5e5;">${message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>

            <div style="background: #10b981; color: white; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
              <h3 style="margin: 0 0 10px 0; font-size: 18px;">⏱️ What's Next?</h3>
              <p style="margin: 0; opacity: 0.9; line-height: 1.6;">
                Our team typically responds within 24 hours during business days. We'll get back to you at <strong>${email}</strong> with a detailed response to your inquiry.
              </p>
            </div>

            <div style="background: #374151; border-radius: 10px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #ffffff; margin: 0 0 15px 0; font-size: 16px;">While you wait, check out:</h4>
              <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #d1d5db;">
                <li>Our <a href="https://tradewithmrk.com/free-resources" style="color: #4f46e5;">free trading resources</a></li>
                <li>Latest insights on our <a href="https://tradewithmrk.com/blog" style="color: #4f46e5;">trading blog</a></li>
                <li>Follow us on social media for daily tips</li>
              </ul>
            </div>

            <div style="border-top: 1px solid #444; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin-bottom: 10px;">
                Questions? You can always reach us at <a href="mailto:contact@tradewithmrk.com" style="color: #4f46e5;">contact@tradewithmrk.com</a>
              </p>
              <p style="color: #4f46e5; font-size: 16px; margin: 15px 0 0 0; font-weight: bold;">
                🚀 Thank you for choosing Mr. K Trading Arena!
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Contact emails sent successfully:", { emailResponse, confirmationEmailResponse });

    return new Response(JSON.stringify({ 
      success: true, 
      adminEmailId: emailResponse.id,
      confirmationEmailId: confirmationEmailResponse.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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