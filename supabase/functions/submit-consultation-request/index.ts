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
      from: 'Mr. K Trading <noreply@tradewithmrk.com>',
      to: consultationData.email,
      subject: 'Consultation Request Received - Mr. K Trading',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0369ff;">Consultation Request Received</h1>
          <p>Hi ${consultationData.name},</p>
          <p>Thank you for requesting a consultation with Mr. K. We've received your request and will get back to you within 24 hours with available time slots.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Request Details:</h3>
            <p><strong>Preferred Time:</strong> ${consultationData.preferredTime}</p>
            <p><strong>Experience Level:</strong> ${consultationData.experienceLevel}</p>
            <p><strong>Discussion Topics:</strong> ${consultationData.purpose}</p>
            ${consultationData.telegram ? `<p><strong>Telegram:</strong> ${consultationData.telegram}</p>` : ''}
          </div>
          
          <p>Once we confirm your time slot, you'll receive a Calendly link to finalize the booking and payment.</p>
          <p>The consultation fee is $50 USD for a 30-minute session.</p>
          
          <p>Best regards,<br>Mr. K Trading Team</p>
        </div>
      `,
    });

    // Send notification email to admin
    const adminEmail = await resend.emails.send({
      from: 'Mr. K Trading <noreply@tradewithmrk.com>',
      to: 'contact@tradewithmrk.com', // Replace with actual admin email
      subject: 'New Consultation Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0369ff;">New Consultation Request</h1>
          <p>A new consultation request has been submitted:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${consultationData.name}</p>
            <p><strong>Email:</strong> ${consultationData.email}</p>
            <p><strong>Telegram:</strong> ${consultationData.telegram || 'Not provided'}</p>
            <p><strong>Preferred Time:</strong> ${consultationData.preferredTime}</p>
            <p><strong>Experience Level:</strong> ${consultationData.experienceLevel}</p>
            <p><strong>Discussion Topics:</strong> ${consultationData.purpose}</p>
            <p><strong>Request ID:</strong> ${consultation.id}</p>
          </div>
          
          <p>Please review and respond to this request within 24 hours.</p>
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