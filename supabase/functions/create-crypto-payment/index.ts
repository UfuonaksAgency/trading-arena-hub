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

  console.log('🚀 CREATE CRYPTO PAYMENT - START');
  console.log('Request method:', req.method);
  console.log('Timestamp:', new Date().toISOString());

  try {
    // Step 1: Validate request body
    console.log('📝 Step 1: Validating request body');
    let consultationId: string;
    let amountUSD: number = 300;
    
    try {
      const body = await req.json();
      console.log('Request body received:', { consultationId: body.consultationId, amountUSD: body.amountUSD });
      consultationId = body.consultationId;
      amountUSD = body.amountUSD || 300;
    } catch (bodyError) {
      console.error('❌ Invalid request body:', bodyError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid request body: Expected JSON with consultationId',
        details: bodyError.message
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!consultationId || typeof consultationId !== 'string') {
      console.error('❌ Invalid consultation ID:', consultationId);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Consultation ID is required and must be a string'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Request validation passed');

    // Step 2: Load and validate environment variables
    console.log('🔐 Step 2: Loading environment variables');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const apiKey = Deno.env.get('COINREMITTER_API_KEY');
    const password = Deno.env.get('COINREMITTER_PASSWORD');
    const merchantId = Deno.env.get('COINREMITTER_MERCHANT_ID');

    console.log('Environment variables status:');
    console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Present' : '❌ Missing');
    console.log('- COINREMITTER_API_KEY:', apiKey ? `✅ Present (${apiKey?.substring(0, 8)}***)` : '❌ Missing');
    console.log('- COINREMITTER_PASSWORD:', password ? `✅ Present (${password?.substring(0, 4)}***)` : '❌ Missing');
    console.log('- COINREMITTER_MERCHANT_ID:', merchantId ? `✅ Present (${merchantId?.substring(0, 4)}***)` : '❌ Missing');

    if (!supabaseUrl || !supabaseServiceKey) {
      const missing = [];
      if (!supabaseUrl) missing.push('SUPABASE_URL');
      if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      const error = `Missing Supabase configuration: ${missing.join(', ')}`;
      console.error('❌', error);
      return new Response(JSON.stringify({ 
        success: false,
        error,
        type: 'configuration_error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!apiKey || !password || !merchantId) {
      const missing = [];
      if (!apiKey) missing.push('COINREMITTER_API_KEY');
      if (!password) missing.push('COINREMITTER_PASSWORD');
      if (!merchantId) missing.push('COINREMITTER_MERCHANT_ID');
      const error = `Missing CoinRemitter credentials: ${missing.join(', ')}`;
      console.error('❌', error);
      return new Response(JSON.stringify({ 
        success: false,
        error,
        type: 'credentials_error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Environment variables validated');

    // Step 3: Initialize Supabase client
    console.log('🗄️ Step 3: Initializing Supabase client');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase client initialized');

    // Step 4: Get TCN price
    console.log('💰 Step 4: Getting TCN price');
    let tcnPriceUSD: number;
    try {
      tcnPriceUSD = await retryWithBackoff(() => getTCNPrice(), 3, 1000);
      console.log('✅ TCN price retrieved:', tcnPriceUSD);
    } catch (priceError) {
      console.error('❌ Failed to get TCN price:', priceError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to get cryptocurrency price',
        type: 'price_error',
        details: priceError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const amountTCN = (amountUSD / tcnPriceUSD);
    console.log('💰 Calculated amounts - USD:', amountUSD, 'TCN:', amountTCN);

    // Step 5: Create payment address via CoinRemitter API
    console.log('🔗 Step 5: Creating payment address via CoinRemitter');
    let coinRemitterData: any;
    
    try {
      coinRemitterData = await retryWithBackoff(async () => {
        const webhookUrl = `${supabaseUrl}/functions/v1/coinremitter-webhook`;
        const label = `con-${consultationId.substring(0, 16)}`;

        console.log('📡 Making CoinRemitter API request:');
        console.log('- URL: https://coinremitter.com/api/v3/TCN/get-new-address');
        console.log('- Webhook URL:', webhookUrl);
        console.log('- Label:', label);
        console.log('- Using API Key:', apiKey?.substring(0, 8) + '***');
        console.log('- Using Password:', password?.substring(0, 4) + '***');
        console.log('- Merchant ID:', merchantId?.substring(0, 4) + '***');

        const requestBody = {
          api_key: apiKey,
          password: password,
          merchant_id: merchantId,
          label: label,
          webhook_url: webhookUrl,
        };

        console.log('📤 Request body prepared (without sensitive data)');

        const response = await fetch('https://coinremitter.com/api/v3/TCN/get-new-address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('📥 CoinRemitter API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.log('❌ CoinRemitter API error response:', errorText);
          throw new Error(`CoinRemitter HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('📦 CoinRemitter API response:', JSON.stringify(data, null, 2));
        
        if (!data.flag || data.flag !== 1) {
          const errorMsg = data.msg || 'Unknown CoinRemitter error';
          console.error('❌ CoinRemitter API flag error:', errorMsg);
          throw new Error(`CoinRemitter API Error: ${errorMsg}`);
        }

        if (!data.data?.address) {
          console.error('❌ CoinRemitter API missing address');
          throw new Error('CoinRemitter API did not return a payment address');
        }

        console.log('✅ Payment address created:', data.data.address);
        return data;
      }, 3, 2000);
    } catch (coinRemitterError) {
      console.error('❌ CoinRemitter API failed after retries:', coinRemitterError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to create payment address',
        type: 'coinremitter_error',
        details: coinRemitterError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 6: Store payment record in database
    console.log('💾 Step 6: Storing payment record in database');
    let paymentData: any;
    
    try {
      const insertResult = await supabase
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
        .select()
        .single();

      if (insertResult.error) {
        console.error('❌ Database insert error:', insertResult.error);
        throw new Error(`Database error: ${insertResult.error.message}`);
      }

      paymentData = insertResult.data;
      console.log('✅ Payment record stored with ID:', paymentData.id);

      // Step 7: Get consultation data for email (separate query)
      console.log('👤 Step 7: Fetching consultation data for email');
      const consultationResult = await supabase
        .from('consultations')
        .select('name, email')
        .eq('id', consultationId)
        .single();

      if (consultationResult.error) {
        console.error('⚠️ Could not fetch consultation data:', consultationResult.error);
      } else {
        console.log('✅ Consultation data retrieved for email');
        
        // Step 8: Send email in background (don't block success)
        try {
          console.log('📧 Step 8: Sending payment details email...');
          await supabase.functions.invoke('send-payment-details-email', {
            body: {
              userName: consultationResult.data.name,
              userEmail: consultationResult.data.email,
              paymentAddress: coinRemitterData.data.address,
              amountTCN: amountTCN,
              amountUSD: amountUSD,
              expiresAt: paymentData.expires_at,
              consultationId: consultationId
            }
          });
          console.log('✅ Payment details email sent successfully');
        } catch (emailError) {
          console.error('⚠️ Email sending failed (not blocking payment):', emailError);
        }
      }
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to store payment record',
        type: 'database_error',
        details: dbError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 9: Return success response
    console.log('🎉 Payment creation completed successfully');
    const successResponse = {
      success: true,
      payment: {
        id: paymentData.id,
        address: coinRemitterData.data.address,
        amount_tcn: amountTCN,
        amount_usd: amountUSD,
        expires_at: paymentData.expires_at,
        qr_code: coinRemitterData.data.qr_code,
      }
    };
    
    console.log('📤 Returning success response:', JSON.stringify(successResponse, null, 2));
    
    return new Response(JSON.stringify(successResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 UNEXPECTED ERROR in create-crypto-payment:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Payment creation failed',
      type: 'unexpected_error',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});