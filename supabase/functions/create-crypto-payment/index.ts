import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsultationRequest {
  consultationId: string;
  amountUSD?: number;
}

// Retry helper function
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Get TCN price (Test Coin) - using fixed test price
async function getTCNPrice(): Promise<number> {
  // For test environment, use a fixed conversion rate
  return 1; // 1 USD = 1 TCN (simplified for testing)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request body
    let consultationId: string;
    let amountUSD: number = 300; // Default amount
    try {
      const body = await req.json();
      consultationId = body.consultationId;
      amountUSD = body.amountUSD || 300;
    } catch (error) {
      throw new Error('Invalid request body: Expected JSON with consultationId');
    }
    
    if (!consultationId || typeof consultationId !== 'string') {
      throw new Error('Consultation ID is required and must be a string');
    }

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const apiKey = Deno.env.get('COINREMITTER_API_KEY');
    const password = Deno.env.get('COINREMITTER_PASSWORD');
    const merchantId = Deno.env.get('COINREMITTER_MERCHANT_ID');

    console.log('Environment variables check:');
    console.log('- SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Present' : 'Missing');
    console.log('- COINREMITTER_API_KEY:', apiKey ? 'Present' : 'Missing');
    console.log('- COINREMITTER_PASSWORD:', password ? 'Present' : 'Missing');
    console.log('- COINREMITTER_MERCHANT_ID:', merchantId ? 'Present' : 'Missing');

    if (!supabaseUrl || !supabaseServiceKey) {
      const missingSupabase = [];
      if (!supabaseUrl) missingSupabase.push('SUPABASE_URL');
      if (!supabaseServiceKey) missingSupabase.push('SUPABASE_SERVICE_ROLE_KEY');
      throw new Error(`Missing Supabase configuration: ${missingSupabase.join(', ')}`);
    }

    if (!apiKey || !password || !merchantId) {
      const missingCreds = [];
      if (!apiKey) missingCreds.push('COINREMITTER_API_KEY');
      if (!password) missingCreds.push('COINREMITTER_PASSWORD');
      if (!merchantId) missingCreds.push('COINREMITTER_MERCHANT_ID');
      throw new Error(`Missing CoinRemitter credentials: ${missingCreds.join(', ')}`);
    }

    // Initialize Supabase with service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get TCN price with retries and fallbacks
    const tcnPriceUSD = await retryWithBackoff(() => getTCNPrice(), 3, 1000);
    const amountTCN = (amountUSD / tcnPriceUSD);

    // Create new payment address via CoinRemitter API with retries
    const coinRemitterData = await retryWithBackoff(async () => {
      const webhookUrl = `${supabaseUrl}/functions/v1/coinremitter-webhook`;
      const label = `con-${consultationId.substring(0, 16)}`;

      console.log('CoinRemitter API request details:');
      console.log('- URL: https://coinremitter.com/api/v3/TCN/get-new-address');
      console.log('- Webhook URL:', webhookUrl);
      console.log('- Label:', label);
      console.log('- Merchant ID (first 4 chars):', merchantId?.substring(0, 4) + '***');

      const response = await fetch('https://coinremitter.com/api/v3/TCN/get-new-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          password: password,
          merchant_id: merchantId,
          label: label,
          webhook_url: webhookUrl,
        }),
      });

      console.log('CoinRemitter API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('CoinRemitter API error response:', errorText);
        throw new Error(`CoinRemitter HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('CoinRemitter API response data:', JSON.stringify(data, null, 2));
      
      if (!data.flag || data.flag !== 1) {
        throw new Error(`CoinRemitter API Error: ${data.msg || 'Failed to create payment address'}`);
      }

      if (!data.data?.address) {
        throw new Error('CoinRemitter API did not return a payment address');
      }

      return data;
    }, 3, 2000);

    // Store payment record in database
    const { data: paymentData, error: paymentError } = await supabase
      .from('crypto_payments')
      .insert({
        consultation_id: consultationId,
        payment_address: coinRemitterData.data.address,
        coin_type: 'TCN',
        amount_usd: amountUSD,
        amount_crypto: amountTCN,
        coinremitter_invoice_id: coinRemitterData.data.invoice_id,
        payment_data: {
          coinremitter_response: coinRemitterData.data,
          tcn_price_usd: tcnPriceUSD,
        }
      })
      .select(`
        *,
        consultations (
          name,
          email
        )
      `)
      .single();

    if (paymentError) {
      throw new Error('Failed to create payment record');
    }

    // Send payment details email if consultation data is available
    if (paymentData.consultations?.[0]?.email && paymentData.consultations?.[0]?.name) {
      try {
        await supabase.functions.invoke('send-payment-details-email', {
          body: {
            name: paymentData.consultations[0].name,
            email: paymentData.consultations[0].email,
            paymentAddress: coinRemitterData.data.address,
            amountTCN: amountTCN,
            amountUSD: amountUSD,
            expiresAt: paymentData.expires_at,
            qrCodeUrl: coinRemitterData.data.qr_code || null,
            consultationId: consultationId
          }
        });
      } catch (emailError) {
        // Don't fail payment creation for email errors
        console.error('Failed to send payment details email:', emailError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      payment: {
        id: paymentData.id,
        address: coinRemitterData.data.address,
        amount_tcn: amountTCN,
        amount_usd: amountUSD,
        expires_at: paymentData.expires_at,
        qr_code: coinRemitterData.data.qr_code,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});