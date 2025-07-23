import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MentorshipApplication {
  name: string;
  email: string;
  telegram: string;
  experienceLevel: string;
  tradingHistory: string;
  goals: string;
  availability: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const applicationData: MentorshipApplication = await req.json();

    // Insert application into database
    const { data: application, error: dbError } = await supabase
      .from("mentorship_applications")
      .insert({
        name: applicationData.name,
        email: applicationData.email,
        telegram: applicationData.telegram,
        experience_level: applicationData.experienceLevel,
        trading_history: applicationData.tradingHistory,
        goals: applicationData.goals,
        availability: applicationData.availability,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Send confirmation email to applicant
    const confirmationEmailResponse = await resend.emails.send({
      from: "TradeWithMRK <contact@tradewithmrk.com>",
      to: [applicationData.email],
      subject: "Mentorship Application Received - TradeWithMRK",
      html: `
        <h1>Thank you for your mentorship application!</h1>
        <p>Hi ${applicationData.name},</p>
        <p>We have received your mentorship application and will review it carefully. Here's a summary of what you submitted:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Application Details:</h3>
          <p><strong>Name:</strong> ${applicationData.name}</p>
          <p><strong>Email:</strong> ${applicationData.email}</p>
          <p><strong>Telegram:</strong> ${applicationData.telegram}</p>
          <p><strong>Experience Level:</strong> ${applicationData.experienceLevel}</p>
          <p><strong>Trading History:</strong> ${applicationData.tradingHistory}</p>
          <p><strong>Goals:</strong> ${applicationData.goals}</p>
          <p><strong>Availability:</strong> ${applicationData.availability}</p>
        </div>
        
        <p>We will get back to you within 2-3 business days regarding the next steps in the application process.</p>
        
        <p>If you have any questions in the meantime, feel free to reach out to us.</p>
        
        <p>Best regards,<br>
        The TradeWithMRK Team</p>
      `,
    });

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "TradeWithMRK <contact@tradewithmrk.com>",
      to: ["contact@tradewithmrk.com"],
      subject: "New Mentorship Application Received",
      html: `
        <h1>New Mentorship Application</h1>
        <p>A new mentorship application has been submitted. Here are the details:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Applicant Details:</h3>
          <p><strong>Name:</strong> ${applicationData.name}</p>
          <p><strong>Email:</strong> ${applicationData.email}</p>
          <p><strong>Telegram:</strong> ${applicationData.telegram}</p>
          <p><strong>Experience Level:</strong> ${applicationData.experienceLevel}</p>
          <p><strong>Trading History:</strong> ${applicationData.tradingHistory}</p>
          <p><strong>Goals:</strong> ${applicationData.goals}</p>
          <p><strong>Availability:</strong> ${applicationData.availability}</p>
          <p><strong>Application ID:</strong> ${application.id}</p>
          <p><strong>Submitted:</strong> ${new Date(application.created_at).toLocaleString()}</p>
        </div>
        
        <p>Please review the application and respond to the applicant accordingly.</p>
      `,
    });

    console.log("Emails sent successfully:", {
      confirmation: confirmationEmailResponse,
      admin: adminEmailResponse,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Application submitted successfully",
        applicationId: application.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-mentorship-application function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);