import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePaymentRequest {
  consultationId: string;
  amountUSD?: number;
}

// Emergency fallback address generation
function generateFallbackAddress(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `fallback_tcn_${timestamp}_${random}`;
}

async function validateEnvironmentSecrets(): Promise<{
  success: boolean;
  supabaseUrl?: string;
  supabaseServiceKey?: string;
  coinremitterConfig?: {
    apiKey: string;
    password: string;
    merchantId: string;
  };
  errors: string[];
}> {
  console.log('🔍 ENVIRONMENT VALIDATION START');
  const errors: string[] = [];
  
  // Check Supabase config
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  console.log('Supabase Environment Check:');
  console.log(`- SUPABASE_URL: ${supabaseUrl ? 'FOUND' : 'MISSING'}`);
  console.log(`- SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? 'FOUND' : 'MISSING'}`);
  
  if (!supabaseUrl) errors.push('SUPABASE_URL');
  if (!supabaseServiceKey) errors.push('SUPABASE_SERVICE_ROLE_KEY');
  
  // Check CoinRemitter config
  const apiKey = Deno.env.get('COINREMITTER_API_KEY');
  const password = Deno.env.get('COINREMITTER_PASSWORD');
  const merchantId = Deno.env.get('COINREMITTER_MERCHANT_ID');
  
  console.log('CoinRemitter Environment Check:');
  console.log(`- COINREMITTER_API_KEY: ${apiKey ? 'FOUND' : 'MISSING'}`);
  console.log(`- COINREMITTER_PASSWORD: ${password ? 'FOUND' : 'MISSING'}`);
  console.log(`- COINREMITTER_MERCHANT_ID: ${merchantId ? 'FOUND' : 'MISSING'}`);
  
  let coinremitterConfig = undefined;
  if (apiKey && password && merchantId) {
    coinremitterConfig = { apiKey, password, merchantId };
    console.log('✅ CoinRemitter configuration complete');
  } else {
    console.log('⚠️ CoinRemitter configuration incomplete - will use fallback mode');
    const missing = [];
    if (!apiKey) missing.push('COINREMITTER_API_KEY');
    if (!password) missing.push('COINREMITTER_PASSWORD');
    if (!merchantId) missing.push('COINREMITTER_MERCHANT_ID');
    console.log(`Missing: ${missing.join(', ')}`);
  }
  
  const success = errors.length === 0;
  console.log(`🔍 ENVIRONMENT VALIDATION ${success ? 'SUCCESS' : 'FAILED'}`);
  
  return {
    success,
    supabaseUrl,
    supabaseServiceKey,
    coinremitterConfig,
    errors
  };
}

async function createCoinRemitterAddress(
  config: { apiKey: string; password: string; merchantId: string },
  consultationId: string,
  supabaseUrl: string
): Promise<{ address: string; invoice_id?: string; qr_code?: string }> {
  console.log('🌐 COINREMITTER API CALL START');
  
  const webhookUrl = `${supabaseUrl}/functions/v1/coinremitter-webhook`;
  const label = `consultation-${consultationId.substring(0, 16)}`;
  
  console.log(`Making request to CoinRemitter with label: ${label}`);
  
  const requestBody = {
    api_key: config.apiKey,
    password: config.password,
    merchant_id: config.merchantId,
    label,
    webhook_url: webhookUrl,
  };
  
  const response = await fetch('https://coinremitter.com/api/v3/TCN/get-new-address', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  
  console.log(`CoinRemitter API response status: ${response.status}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`CoinRemitter API HTTP error: ${response.status} - ${errorText}`);
    throw new Error(`CoinRemitter HTTP ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  console.log('CoinRemitter API response received');
  
  if (!data.flag || data.flag !== 1) {
    const errorMsg = data.msg || 'Unknown CoinRemitter error';
    console.error(`CoinRemitter API error: ${errorMsg}`);
    throw new Error(`CoinRemitter Error: ${errorMsg}`);
  }
  
  if (!data.data?.address) {
    console.error('CoinRemitter API missing address in response');
    throw new Error('No payment address returned from CoinRemitter');
  }
  
  console.log('✅ COINREMITTER API CALL SUCCESS');
  return {
    address: data.data.address,
    invoice_id: data.data.invoice_id,
    qr_code: data.data.qr_code
  };
}

async function storePaymentRecord(
  supabase: any,
  consultationId: string,
  paymentAddress: string,
  amountUSD: number,
  amountTCN: number,
  coinremitterData?: any
): Promise<any> {
  console.log('💾 DATABASE INSERT START');
  
  const insertData = {
    consultation_id: consultationId,
    payment_address: paymentAddress,
    coin_type: 'TCN',
    amount_usd: amountUSD,
    amount_crypto: amountTCN,
    status: 'pending',
    coinremitter_invoice_id: coinremitterData?.invoice_id || null,
    payment_data: {
      coinremitter_response: coinremitterData || null,
      tcn_price_usd: 1,
      fallback_mode: !coinremitterData
    }
  };
  
  console.log('Inserting payment record into database...');
  
  const result = await supabase
    .from('crypto_payments')
    .insert(insertData)
    .select()
    .single();
  
  if (result.error) {
    console.error('Database insert error:', result.error);
    throw new Error(`Database insert failed: ${result.error.message}`);
  }
  
  console.log('✅ DATABASE INSERT SUCCESS');
  return result.data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚀🚀🚀 EMERGENCY PAYMENT SYSTEM - NEW DEPLOYMENT 🚀🚀🚀');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);

  try {
    // STEP 1: Parse and validate request
    console.log('\n📝 STEP 1: REQUEST VALIDATION');
    
    let requestData: CreatePaymentRequest;
    try {
      requestData = await req.json();
      console.log(`Consultation ID: ${requestData.consultationId}`);
      console.log(`Amount USD: ${requestData.amountUSD || 300}`);
    } catch (error) {
      console.error('Invalid JSON in request body');
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body',
        type: 'validation_error'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!requestData.consultationId) {
      console.error('Missing consultation ID');
      return new Response(JSON.stringify({
        success: false,
        error: 'consultationId is required',
        type: 'validation_error'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const amountUSD = requestData.amountUSD || 300;
    const amountTCN = amountUSD; // 1:1 ratio for testing
    
    console.log('✅ STEP 1 COMPLETE');

    // STEP 2: Validate environment and secrets
    console.log('\n🔐 STEP 2: ENVIRONMENT VALIDATION');
    
    const envCheck = await validateEnvironmentSecrets();
    
    if (!envCheck.success) {
      console.error(`Environment validation failed: ${envCheck.errors.join(', ')}`);
      return new Response(JSON.stringify({
        success: false,
        error: `Missing required environment variables: ${envCheck.errors.join(', ')}`,
        type: 'configuration_error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ STEP 2 COMPLETE');

    // STEP 3: Initialize Supabase
    console.log('\n🗄️ STEP 3: SUPABASE INITIALIZATION');
    
    const supabase = createClient(envCheck.supabaseUrl!, envCheck.supabaseServiceKey!);
    console.log('Supabase client created');
    
    console.log('✅ STEP 3 COMPLETE');

    // STEP 4: Test database connectivity
    console.log('\n🔍 STEP 4: DATABASE CONNECTIVITY TEST');
    
    try {
      const testQuery = await supabase
        .from('consultations')
        .select('id')
        .eq('id', requestData.consultationId)
        .single();
      
      if (testQuery.error) {
        console.error('Database connectivity test failed:', testQuery.error);
        return new Response(JSON.stringify({
          success: false,
          error: 'Database connectivity failed',
          type: 'database_error',
          details: testQuery.error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      console.log('Database connectivity test passed');
    } catch (error) {
      console.error('Database connectivity test exception:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Database connection failed',
        type: 'database_error',
        details: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ STEP 4 COMPLETE');

    // STEP 5: Create payment address (with fallback)
    console.log('\n💰 STEP 5: PAYMENT ADDRESS CREATION');
    
    let paymentAddress: string;
    let coinremitterData: any = null;
    let addressCreationMethod: string;
    
    if (envCheck.coinremitterConfig) {
      console.log('Attempting CoinRemitter address creation...');
      try {
        const coinremitterResult = await createCoinRemitterAddress(
          envCheck.coinremitterConfig,
          requestData.consultationId,
          envCheck.supabaseUrl!
        );
        
        paymentAddress = coinremitterResult.address;
        coinremitterData = coinremitterResult;
        addressCreationMethod = 'coinremitter';
        console.log(`CoinRemitter address created: ${paymentAddress}`);
        
      } catch (coinremitterError) {
        console.error('CoinRemitter failed, using fallback:', coinremitterError);
        paymentAddress = generateFallbackAddress();
        addressCreationMethod = 'fallback';
        console.log(`Fallback address created: ${paymentAddress}`);
      }
    } else {
      console.log('CoinRemitter not configured, using fallback address...');
      paymentAddress = generateFallbackAddress();
      addressCreationMethod = 'fallback';
      console.log(`Fallback address created: ${paymentAddress}`);
    }
    
    console.log('✅ STEP 5 COMPLETE');

    // STEP 6: Store payment record
    console.log('\n💾 STEP 6: STORE PAYMENT RECORD');
    
    let paymentRecord: any;
    try {
      paymentRecord = await storePaymentRecord(
        supabase,
        requestData.consultationId,
        paymentAddress,
        amountUSD,
        amountTCN,
        coinremitterData
      );
      
      console.log(`Payment record stored with ID: ${paymentRecord.id}`);
    } catch (dbError) {
      console.error('Failed to store payment record:', dbError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to store payment record',
        type: 'database_error',
        details: dbError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ STEP 6 COMPLETE');

    // STEP 7: Return success response
    console.log('\n🎉 STEP 7: SUCCESS RESPONSE');
    
    const response = {
      success: true,
      payment: {
        id: paymentRecord.id,
        address: paymentAddress,
        amount_tcn: amountTCN,
        amount_usd: amountUSD,
        expires_at: paymentRecord.expires_at,
        qr_code: coinremitterData?.qr_code || null,
        creation_method: addressCreationMethod
      }
    };
    
    console.log('Payment creation successful!');
    console.log(`Method: ${addressCreationMethod}`);
    console.log(`Address: ${paymentAddress}`);
    console.log(`Amount: ${amountUSD} USD / ${amountTCN} TCN`);
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('🔥 CRITICAL ERROR IN PAYMENT SYSTEM:', error);
    console.error('Stack trace:', error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Critical system error during payment creation',
      type: 'system_error',
      details: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});