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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const applicationData: MentorshipApplication = await req.json();

    // Insert into database
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
      throw new Error("Failed to save application");
    }

    // Send confirmation email to applicant
    await resend.emails.send({
      from: "Trade with MRK <contact@tradewithmrk.com>",
      to: [applicationData.email],
      subject: "Mentorship Application Received - Trade with MRK",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank you for your mentorship application!</h2>
          
          <p>Hi ${applicationData.name},</p>
          
          <p>We've successfully received your mentorship application. Here's a summary of what you submitted:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Experience Level:</strong> ${applicationData.experienceLevel}</p>
            <p><strong>Trading History:</strong> ${applicationData.tradingHistory}</p>
            <p><strong>Goals:</strong> ${applicationData.goals}</p>
            <p><strong>Availability:</strong> ${applicationData.availability}</p>
            <p><strong>Telegram:</strong> ${applicationData.telegram}</p>
          </div>
          
          <p>Our team will review your application and get back to you within 24-48 hours. If you're selected, we'll reach out via email and Telegram to discuss the next steps.</p>
          
          <p>Thank you for your interest in our mentorship program!</p>
          
          <p>Best regards,<br>
          <strong>Trade with MRK Team</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b;">Application ID: ${application.id}</p>
        </div>
      `,
    });

    // Send notification email to admin
    await resend.emails.send({
      from: "Trade with MRK <contact@tradewithmrk.com>",
      to: ["contact@tradewithmrk.com"],
      subject: "New Mentorship Application Received",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">New Mentorship Application</h2>
          
          <p>A new mentorship application has been submitted:</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Name:</strong> ${applicationData.name}</p>
            <p><strong>Email:</strong> ${applicationData.email}</p>
            <p><strong>Telegram:</strong> ${applicationData.telegram}</p>
            <p><strong>Experience Level:</strong> ${applicationData.experienceLevel}</p>
            <p><strong>Trading History:</strong> ${applicationData.tradingHistory}</p>
            <p><strong>Goals:</strong> ${applicationData.goals}</p>
            <p><strong>Availability:</strong> ${applicationData.availability}</p>
          </div>
          
          <p>Application submitted at: ${new Date().toLocaleString()}</p>
          <p>Application ID: ${application.id}</p>
          
          <p>Review this application in your admin panel.</p>
        </div>
      `,
    });

    console.log("Application processed successfully:", application.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Application submitted successfully",
        applicationId: application.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error processing application:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to process application" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);