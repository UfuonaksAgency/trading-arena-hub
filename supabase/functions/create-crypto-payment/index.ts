import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

// NOWPAYMENTS Payment Creation Function - Updated 2025-08-25T16:11:00Z
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePaymentRequest {
  consultationId: string;
  amountUSD: number;
}

interface NOWPaymentsInvoiceResponse {
  id: string;
  order_id: string;
  order_description: string;
  price_amount: number;
  price_currency: string;
  pay_currency?: string;
  invoice_url: string;
  success_url: string;
  cancel_url: string;
  created_at: string;
  ipn_callback_url: string;
}

async function createNOWInvoice(
  apiKey: string,
  consultationId: string,
  amountUSD: number,
  consultation: any,
  supabaseUrl: string
): Promise<NOWPaymentsInvoiceResponse> {
  const invoiceStartTime = Date.now();
  console.log(`🌐 NOWPAYMENTS API CALL START - ${new Date().toISOString()}`);
  
  // Enhanced API key validation
  console.log("🔐 API Key Validation:");
  console.log(`  * Length: ${apiKey.length} characters`);
  console.log(`  * Format: ${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 3)}`);
  console.log(`  * Contains dashes: ${apiKey.includes('-')}`);
  console.log(`  * All uppercase: ${apiKey === apiKey.toUpperCase()}`);
  
  if (!apiKey || apiKey.length < 10) {
    console.error(`❌ Invalid API key format - Length: ${apiKey?.length || 0}`);
    throw new Error('Invalid NOWPayments API key format');
  }
  
  const invoiceData = {
    price_amount: amountUSD,
    price_currency: "USD",
    order_id: consultationId,
    order_description: `Trading Consultation Payment - ${consultation.email}`,
    ipn_callback_url: `${supabaseUrl}/functions/v1/nowpayments-webhook`,
    success_url: `https://tradewithmrk.com/book-consultation?payment=success`,
    cancel_url: `https://tradewithmrk.com/book-consultation?payment=cancelled`
  };

  console.log("📋 Invoice Request Data:");
  console.log(JSON.stringify(invoiceData, null, 2));
  console.log(`🎯 Target URL: https://api.nowpayments.io/v1/invoice`);
  console.log(`🔑 Using API Key: ${apiKey.substring(0, 10)}...`);
  
  const fetchStartTime = Date.now();
  
  try {
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(invoiceData),
    });

    const fetchDuration = Date.now() - fetchStartTime;
    console.log(`⏱️ NOWPayments API call completed in ${fetchDuration}ms`);
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ NOWPayments API Error Response:`);
      console.error(`   Status: ${response.status} ${response.statusText}`);
      console.error(`   Headers:`, Object.fromEntries(response.headers.entries()));
      console.error(`   Body: ${errorText}`);
      
      // Enhanced error parsing
      try {
        const errorData = JSON.parse(errorText);
        console.error(`   Parsed Error:`, errorData);
        
        if (errorData.code === 'INVALID_API_KEY') {
          console.error("🚨 API Key is invalid - check your NOWPayments account");
          throw new Error('invalid_api_key');
        } else if (errorData.code === 'FORBIDDEN') {
          console.error("🚨 API access forbidden - check account verification");
          throw new Error('api_forbidden');
        } else {
          console.error(`🚨 NOWPayments API error: ${errorData.message || 'Unknown error'}`);
          throw new Error(`nowpayments_error: ${errorData.message || errorText}`);
        }
      } catch (parseError) {
        console.error("❌ Failed to parse error response:", parseError);
        throw new Error(`nowpayments_error: ${errorText}`);
      }
    }

    const invoiceResponse: NOWPaymentsInvoiceResponse = await response.json();
    console.log("✅ NOWPayments Response Received:");
    console.log(JSON.stringify(invoiceResponse, null, 2));
    
    // Enhanced response validation
    if (!invoiceResponse.id || !invoiceResponse.invoice_url) {
      console.error("❌ Invalid NOWPayments invoice response structure:");
      console.error(`   Missing ID: ${!invoiceResponse.id}`);
      console.error(`   Missing URL: ${!invoiceResponse.invoice_url}`);
      console.error(`   Full response:`, invoiceResponse);
      throw new Error('Invalid invoice response from NOWPayments');
    }
    
    const totalDuration = Date.now() - invoiceStartTime;
    console.log("✅ NOWPayments invoice created successfully");
    console.log(`   Invoice ID: ${invoiceResponse.id}`);
    console.log(`   Invoice URL: ${invoiceResponse.invoice_url}`);
    console.log(`   Amount: ${invoiceResponse.price_amount} ${invoiceResponse.price_currency}`);
    console.log(`   Order ID: ${invoiceResponse.order_id}`);
    console.log(`⏱️ Total NOWPayments operation duration: ${totalDuration}ms`);
    
    return invoiceResponse;
    
  } catch (networkError: any) {
    console.error("❌ Network/Connection Error:", networkError);
    console.error("Error name:", networkError.name);
    console.error("Error message:", networkError.message);
    if (networkError.cause) {
      console.error("Error cause:", networkError.cause);
    }
    throw networkError;
  }
}

async function storePaymentRecord(
  supabase: any,
  consultationId: string,
  invoiceResponse: NOWPaymentsInvoiceResponse
): Promise<any> {
  const dbStartTime = Date.now();
  console.log(`💾 DATABASE INSERT START - ${new Date().toISOString()}`);
  
  const insertData = {
    consultation_id: consultationId,
    nowpayments_payment_id: invoiceResponse.id,
    payment_address: invoiceResponse.invoice_url,
    coin_type: 'MULTI', // Invoice supports multiple currencies
    amount_usd: invoiceResponse.price_amount,
    amount_crypto: invoiceResponse.price_amount, // Will be determined by user's currency choice
    status: 'pending',
    payment_data: invoiceResponse,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  };
  
  console.log("📋 Payment Record Data to Insert:");
  console.log(JSON.stringify(insertData, null, 2));
  console.log(`🎯 Target Table: crypto_payments`);
  console.log(`🔑 Consultation ID: ${consultationId}`);
  console.log(`💰 Amount USD: ${insertData.amount_usd}`);
  console.log(`📅 Expires At: ${insertData.expires_at}`);
  
  try {
    const result = await supabase
      .from('crypto_payments')
      .insert(insertData)
      .select()
      .single();
    
    const dbDuration = Date.now() - dbStartTime;
    console.log(`⏱️ Database insert completed in ${dbDuration}ms`);
    
    if (result.error) {
      console.error("❌ Database insert error details:");
      console.error("   Error code:", result.error.code);
      console.error("   Error message:", result.error.message);
      console.error("   Error details:", result.error.details);
      console.error("   Error hint:", result.error.hint);
      console.error("   Full error object:", result.error);
      
      // Check for common database errors
      if (result.error.code === '23505') {
        console.error("🚨 Duplicate key error - payment record already exists");
      } else if (result.error.code === '23503') {
        console.error("🚨 Foreign key constraint violation");
      } else if (result.error.code === '42703') {
        console.error("🚨 Column does not exist");
      } else if (result.error.code === '42P01') {
        console.error("🚨 Table does not exist");
      }
      
      throw new Error(`Database insert failed: ${result.error.message}`);
    }
    
    console.log("✅ DATABASE INSERT SUCCESS");
    console.log(`   Record ID: ${result.data.id}`);
    console.log(`   Status: ${result.data.status}`);
    console.log(`   Created At: ${result.data.created_at}`);
    console.log(`⏱️ Total database operation duration: ${dbDuration}ms`);
    
    return result.data;
    
  } catch (dbError: any) {
    console.error("❌ Database operation failed:");
    console.error("   Error name:", dbError.name);
    console.error("   Error message:", dbError.message);
    console.error("   Error stack:", dbError.stack);
    console.error(`⏱️ Failed after: ${Date.now() - dbStartTime}ms`);
    throw dbError;
  }
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const startTime = Date.now();
  
  console.log(`\n🚀🚀🚀 NOWPAYMENTS PAYMENT SYSTEM v2.1 [${requestId}] 🚀🚀🚀`);
  console.log(`🕐 Request Start Time: ${new Date().toISOString()}`);
  console.log(`🌍 Deno Version: ${Deno.version.deno}`);
  console.log(`💾 Memory Usage: ${JSON.stringify(Deno.memoryUsage())}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("✅ CORS Preflight Request - Returning Options Response");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`\n📝 STEP 1: REQUEST VALIDATION [${requestId}]`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);
    console.log(`User-Agent: ${req.headers.get('user-agent') || 'unknown'}`);
    console.log(`Content-Type: ${req.headers.get('content-type') || 'unknown'}`);
    console.log(`Origin: ${req.headers.get('origin') || 'unknown'}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    let rawBody: string;
    let requestData: CreatePaymentRequest;
    
    try {
      rawBody = await req.text();
      console.log(`📦 Raw Request Body: ${rawBody}`);
      requestData = JSON.parse(rawBody);
      console.log(`📋 Parsed Request Data:`, JSON.stringify(requestData, null, 2));
    } catch (parseError) {
      console.error(`❌ Request parsing failed:`, parseError);
      throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }

    const { consultationId, amountUSD } = requestData;
    
    if (!consultationId || !amountUSD) {
      console.error(`❌ Missing fields - consultationId: ${consultationId}, amountUSD: ${amountUSD}`);
      throw new Error('Missing required fields: consultationId and amountUSD');
    }
    
    console.log(`✅ Consultation ID: ${consultationId}`);
    console.log(`✅ Amount USD: ${amountUSD}`);
    console.log(`⏱️ Step 1 Duration: ${Date.now() - startTime}ms`);
    console.log("✅ STEP 1 COMPLETE");

    console.log(`\n🔐 STEP 2: ENVIRONMENT VALIDATION [${requestId}] - Enhanced Debug`);
    const step2Start = Date.now();
    
    // Debug: List all available environment variables
    const allEnvVars = Deno.env.toObject();
    const envKeys = Object.keys(allEnvVars);
    console.log(`🔍 Total environment variables available: ${envKeys.length}`);
    console.log(`🔍 Environment variables containing 'NOWPAYMENTS':`, envKeys.filter(key => key.includes('NOWPAYMENTS')));
    console.log(`🔍 Environment variables containing 'API':`, envKeys.filter(key => key.includes('API')));
    
    // Get all environment variables
    const NOWPAYMENTS_API_KEY = Deno.env.get('NOWPAYMENTS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Log detailed environment variable status
    console.log("🔍 Environment Variables Detailed Check:");
    console.log(`- NOWPAYMENTS_API_KEY: ${NOWPAYMENTS_API_KEY ? 'FOUND' : 'MISSING'}`);
    if (NOWPAYMENTS_API_KEY) {
      console.log(`  * Length: ${NOWPAYMENTS_API_KEY.length} characters`);
      console.log(`  * Format: ${NOWPAYMENTS_API_KEY.substring(0, 3)}...${NOWPAYMENTS_API_KEY.substring(NOWPAYMENTS_API_KEY.length - 3)}`);
      console.log(`  * Contains dashes: ${NOWPAYMENTS_API_KEY.includes('-')}`);
      console.log(`  * All uppercase: ${NOWPAYMENTS_API_KEY === NOWPAYMENTS_API_KEY.toUpperCase()}`);
    } else {
      console.error("🚨 CRITICAL: NOWPAYMENTS_API_KEY is completely missing!");
      console.error("🔍 Checking for alternative key names...");
      const altKeys = ['NOWPAYMENTS_API_KEY', 'nowpayments_api_key', 'NOW_PAYMENTS_API_KEY', 'NOWPAYMENTS_KEY'];
      altKeys.forEach(key => {
        const value = Deno.env.get(key);
        console.error(`  - ${key}: ${value ? 'FOUND' : 'NOT FOUND'}`);
      });
    }
    
    console.log(`- SUPABASE_URL: ${SUPABASE_URL ? 'FOUND' : 'MISSING'}`);
    if (SUPABASE_URL) {
      console.log(`  * Value: ${SUPABASE_URL}`);
    }
    
    console.log(`- SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? 'FOUND' : 'MISSING'}`);
    if (SUPABASE_SERVICE_ROLE_KEY) {
      console.log(`  * Length: ${SUPABASE_SERVICE_ROLE_KEY.length} characters`);
      console.log(`  * Format: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...${SUPABASE_SERVICE_ROLE_KEY.substring(SUPABASE_SERVICE_ROLE_KEY.length - 10)}`);
    }

    // Enhanced validation with specific error messages and better debugging
    if (!NOWPAYMENTS_API_KEY || NOWPAYMENTS_API_KEY.trim() === '') {
      console.error("❌ CRITICAL: NOWPAYMENTS_API_KEY is missing or empty from environment variables");
      console.error("🔍 This could mean:");
      console.error("  1. The secret was not set in Supabase Edge Functions settings");
      console.error("  2. The secret name doesn't match exactly");
      console.error("  3. The secret hasn't propagated to this edge function instance yet");
      console.error("  4. There's a caching issue with the edge function deployment");
      console.error("  5. The secret value is empty or contains only whitespace");
      
      // More user-friendly error message
      throw new Error('Service configuration error. Please try again later.');
    }
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ CRITICAL: Supabase environment variables missing");
      console.error(`SUPABASE_URL: ${SUPABASE_URL ? 'OK' : 'MISSING'}`);
      console.error(`SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING'}`);
      throw new Error('Supabase environment variables are required');
    }
    
    // Test API key format
    if (NOWPAYMENTS_API_KEY.length < 10) {
      console.error(`❌ NOWPAYMENTS_API_KEY appears to be invalid - too short: ${NOWPAYMENTS_API_KEY.length} characters`);
      throw new Error('NOWPAYMENTS_API_KEY appears to be invalid format');
    }
    
    console.log("✅ All environment variables validated successfully");
    console.log(`⏱️ Step 2 Duration: ${Date.now() - step2Start}ms`);
    console.log("✅ STEP 2 COMPLETE");

    console.log(`\n🗄️ STEP 3: SUPABASE INITIALIZATION [${requestId}]`);
    const step3Start = Date.now();
    
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      console.log("✅ Supabase client created successfully");
      console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);
      console.log(`🔑 Service Role Key Length: ${SUPABASE_SERVICE_ROLE_KEY.length} characters`);
      console.log(`⏱️ Step 3 Duration: ${Date.now() - step3Start}ms`);
      console.log("✅ STEP 3 COMPLETE");

      console.log(`\n🔍 STEP 4: DATABASE CONNECTIVITY TEST [${requestId}]`);
      const step4Start = Date.now();
      
      console.log(`🔍 Searching for consultation with ID: ${consultationId}`);
      console.log(`📊 Query: SELECT id, email FROM consultations WHERE id = '${consultationId}'`);
      
      // Verify consultation exists
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .select('id, email')
        .eq('id', consultationId)
        .single();

      console.log(`🔍 Database query completed in ${Date.now() - step4Start}ms`);
      
      if (consultationError) {
        console.error("❌ Database query error:", consultationError);
        console.error("Error code:", consultationError.code);
        console.error("Error message:", consultationError.message);
        console.error("Error details:", consultationError.details);
        console.error("Error hint:", consultationError.hint);
        throw new Error(`Database query failed: ${consultationError.message}`);
      }

      if (!consultation) {
        console.error(`❌ Consultation not found with ID: ${consultationId}`);
        console.log("🔍 This could mean:");
        console.log("  - The consultation was not saved properly");
        console.log("  - The consultation ID is incorrect");
        console.log("  - There's a database connectivity issue");
        throw new Error(`Consultation not found: ${consultationId}`);
      }

      console.log("✅ Database connectivity test passed");
      console.log(`✅ Consultation found - ID: ${consultation.id}, Email: ${consultation.email}`);
      console.log(`⏱️ Step 4 Duration: ${Date.now() - step4Start}ms`);
      console.log("✅ STEP 4 COMPLETE");

      console.log(`\n💰 STEP 5: NOWPAYMENTS INVOICE CREATION [${requestId}]`);
      const step5Start = Date.now();
      
      const invoiceResponse = await createNOWInvoice(
        NOWPAYMENTS_API_KEY,
        consultationId,
        amountUSD,
        consultation,
        SUPABASE_URL
      );
      
      console.log(`⏱️ Step 5 Duration: ${Date.now() - step5Start}ms`);
      console.log("✅ STEP 5 COMPLETE");

      console.log(`\n💾 STEP 6: STORE PAYMENT RECORD [${requestId}]`);
      const step6Start = Date.now();
      
      const paymentRecord = await storePaymentRecord(
        supabase,
        consultationId,
        invoiceResponse
      );

      console.log(`✅ Payment record stored with ID: ${paymentRecord.id}`);
      console.log(`⏱️ Step 6 Duration: ${Date.now() - step6Start}ms`);
      console.log("✅ STEP 6 COMPLETE");

      console.log(`\n🎉 STEP 7: SUCCESS RESPONSE [${requestId}]`);
      console.log("🎊 Invoice creation successful!");
      console.log(`   Invoice ID: ${invoiceResponse.id}`);
      console.log(`   Invoice URL: ${invoiceResponse.invoice_url}`);
      console.log(`   Amount: ${invoiceResponse.price_amount} ${invoiceResponse.price_currency}`);
      console.log(`   Payment Record ID: ${paymentRecord.id}`);
      console.log(`⏱️ Total Request Duration: ${Date.now() - startTime}ms`);

      return new Response(JSON.stringify({
        success: true,
        payment: {
          id: paymentRecord.id,
          invoice_id: invoiceResponse.id,
          invoice_url: invoiceResponse.invoice_url,
          amount_usd: invoiceResponse.price_amount,
          status: 'pending',
          expires_at: paymentRecord.expires_at,
          order_id: invoiceResponse.order_id,
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });

    } catch (supabaseError: any) {
      console.error("❌ SUPABASE/DATABASE ERROR:", supabaseError);
      throw supabaseError;
    }

  } catch (error: any) {
    const errorDuration = Date.now() - startTime;
    console.error(`\n💥 CRITICAL ERROR IN PAYMENT CREATION [${requestId}]`);
    console.error(`⏱️ Error occurred after: ${errorDuration}ms`);
    console.error("🔍 Error type:", typeof error);
    console.error("🔍 Error name:", error.name || 'Unknown');
    console.error("🔍 Error message:", error.message || 'No message');
    console.error("🔍 Error stack:", error.stack || 'No stack trace');
    console.error("🔍 Error cause:", error.cause || 'No cause');
    console.error("🔍 Full error object:", error);

    // Enhanced error categorization
    let errorType = 'payment_creation_failed';
    let statusCode = 500;
    let userMessage = error.message || 'Payment creation failed';
    
    if (error.message === 'invalid_api_key') {
      errorType = 'api_configuration_error';
      statusCode = 503; // Service Unavailable
      userMessage = 'Payment service configuration error. Please try again later.';
    } else if (error.message === 'api_forbidden') {
      errorType = 'api_access_denied';
      statusCode = 503;
      userMessage = 'Payment service access denied. Please try again later.';
    } else if (error.message.startsWith('nowpayments_error')) {
      errorType = 'nowpayments_error';
      statusCode = 502; // Bad Gateway
      userMessage = 'Payment provider error. Please try again later.';
    } else if (error.message.includes('Database') || error.message.includes('consultation')) {
      errorType = 'database_error';
      statusCode = 500;
      userMessage = 'Database error. Please try again later.';
    } else if (error.message.includes('environment variable')) {
      errorType = 'configuration_error';
      statusCode = 503;
      userMessage = 'Service configuration error. Please try again later.';
    } else if (error.message.includes('Invalid JSON')) {
      errorType = 'request_error';
      statusCode = 400;
      userMessage = 'Invalid request format.';
    } else if (error.message.includes('Missing required fields')) {
      errorType = 'validation_error';
      statusCode = 400;
      userMessage = error.message;
    }

    console.error(`🏷️  Categorized as: ${errorType} (HTTP ${statusCode})`);
    console.error(`👤 User message: ${userMessage}`);

    return new Response(JSON.stringify({
      success: false,
      error: userMessage,
      error_type: errorType,
      request_id: requestId,
      debug_info: {
        duration_ms: errorDuration,
        timestamp: new Date().toISOString(),
        error_name: error.name
      }
    }), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

serve(handler);