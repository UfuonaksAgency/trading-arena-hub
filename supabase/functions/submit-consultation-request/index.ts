import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';
import { Resend } from 'https://esm.sh/resend@3.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsultationRequest {
  name: string;
  email: string;
  telegram?: string;
  preferred_time: string;
  experience_level: string;
  purpose: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const consultationData: ConsultationRequest = await req.json();

    console.log('Received consultation request:', consultationData);

    // Insert consultation request into database
    const { data: consultation, error: insertError } = await supabase
      .from('consultations')
      .insert([{
        name: consultationData.name,
        email: consultationData.email,
        telegram: consultationData.telegram,
        preferred_time: consultationData.preferredTime, // Map camelCase to snake_case
        experience_level: consultationData.experienceLevel, // Map camelCase to snake_case
        purpose: consultationData.purpose,
        status: 'pending'
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to save consultation request: ${insertError.message}`);
    }

    console.log('Consultation saved successfully:', consultation);

    // Send confirmation email to user
    const confirmationEmail = await resend.emails.send({
      from: 'Mr. K Trading Arena <noreply@tradewithmrk.com>',
      to: consultationData.email,
      subject: 'Request Received - Next Step: Complete Payment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
          <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0369ff; margin: 0; font-size: 28px;">Request Received! ✅</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 16px;">Your trading consultation request has been submitted</p>
            </div>

            <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h2 style="color: #1e40af; margin: 0 0 15px 0;">Hello ${consultationData.name}!</h2>
              <p style="color: #1e40af; margin: 0 0 15px 0;">
                Thank you for your interest in a personalized trading consultation. Your information has been received and processed.
              </p>
              <p style="color: #1e40af; font-weight: bold; margin: 0;">
                Complete your Bitcoin payment to secure your 30-minute session.
              </p>
            </div>

            <div style="background: #f3f4f6; border-radius: 8px; padding: 25px; margin: 25px 0;">
              <h3 style="color: #111827; margin: 0 0 20px 0;">📋 Your Request Details:</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #374151;">Preferred Time Zone:</strong>
                  <span>${consultationData.preferredTime}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #374151;">Experience Level:</strong>
                  <span>${consultationData.experienceLevel}</span>
                </div>
                ${consultationData.telegram ? `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                  <strong style="color: #374151;">Telegram:</strong>
                  <span>${consultationData.telegram}</span>
                </div>
                ` : ''}
                <div style="padding: 8px 0;">
                  <strong style="color: #374151;">Discussion Topics:</strong>
                  <div style="margin-top: 8px; padding: 12px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
                    ${consultationData.purpose}
                  </div>
                </div>
              </div>
            </div>

            <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
              <h3 style="color: #92400e; margin: 0 0 10px 0;">💰 Consultation Fee: $300 USD</h3>
              <p style="color: #92400e; margin: 0; font-size: 14px;">Payment via Bitcoin for security and privacy</p>
            </div>

            <div style="background: #d1fae5; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #065f46; margin: 0 0 15px 0;">🎯 What You'll Get:</h4>
              <ul style="color: #065f46; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Personalized 30-minute trading strategy session</li>
                <li style="margin-bottom: 8px;">Expert market analysis and insights</li>
                <li style="margin-bottom: 8px;">Customized advice based on your experience level</li>
                <li style="margin-bottom: 8px;">Clear action plan for improving your trading</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; margin: 0 0 20px 0;">Continue with the payment process on the booking page:</p>
              <a href="https://tradewithmrk.com/book-consultation" 
                 style="background: #0369ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Complete Payment & Schedule
              </a>
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

    // Send notification email to admin
    const adminEmail = await resend.emails.send({
      from: 'Mr. K Trading Arena <noreply@tradewithmrk.com>',
      to: 'contact@tradewithmrk.com',
      subject: '🔔 New Consultation Request - Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px;">
          <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0; font-size: 24px;">🔔 New Consultation Request</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0;">A potential client has submitted a consultation request</p>
            </div>

            <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #991b1b; margin: 0 0 15px 0;">Request Details:</h3>
              <div style="display: grid; gap: 10px;">
                <div><strong>Name:</strong> ${consultationData.name}</div>
                <div><strong>Email:</strong> ${consultationData.email}</div>
                <div><strong>Telegram:</strong> ${consultationData.telegram || 'Not provided'}</div>
                <div><strong>Preferred Time Zone:</strong> ${consultationData.preferredTime}</div>
                <div><strong>Experience Level:</strong> ${consultationData.experienceLevel}</div>
                <div><strong>Request ID:</strong> ${consultation.id}</div>
              </div>
            </div>

            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #111827; margin: 0 0 15px 0;">Discussion Topics:</h4>
              <div style="background: white; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                ${consultationData.purpose}
              </div>
            </div>

            <div style="background: #dbeafe; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
              <h4 style="color: #1e40af; margin: 0 0 10px 0;">📅 Next Steps:</h4>
              <p style="color: #1e40af; margin: 0; font-size: 14px;">
                The client will proceed to payment. Monitor for payment confirmation to activate scheduling.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Timestamp: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log('Emails sent successfully:', {
      confirmation: confirmationEmail,
      admin: adminEmail
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Consultation request submitted successfully',
        consultationId: consultation.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing consultation request:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});