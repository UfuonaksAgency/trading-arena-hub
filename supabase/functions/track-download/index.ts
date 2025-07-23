import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DownloadTrack {
  resource_id: string;
  user_ip?: string;
  user_agent?: string;
  session_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const downloadData: DownloadTrack = await req.json();
    
    // Get client IP and user agent from headers
    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.log('Tracking download for resource:', downloadData.resource_id);

    // Track the download
    const { error } = await supabase
      .from('resource_downloads')
      .insert([{
        resource_id: downloadData.resource_id,
        user_ip: clientIP,
        user_agent: userAgent,
        session_id: downloadData.session_id || null
      }]);

    if (error) {
      console.error('Error tracking download:', error);
      throw new Error(`Failed to track download: ${error.message}`);
    }

    console.log('Download tracked successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Download tracked successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error tracking download:', error);
    
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