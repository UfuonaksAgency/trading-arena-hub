import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

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
  console.log('🌐 NOWPAYMENTS API CALL START');
  
  // Validate API key format
  if (!apiKey || apiKey.length < 10) {
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

  console.log("Creating NOWPayments invoice request...");
  console.log("API Key length:", apiKey.length);
  console.log("API Key first 10 chars:", apiKey.substring(0, 10) + "...");
  
  const response = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(invoiceData),
  });

  console.log(`NOWPayments API response status: ${response.status}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("NOWPayments API error:", errorText);
    
    // Parse error and provide specific error messages
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.code === 'INVALID_API_KEY') {
        throw new Error('invalid_api_key');
      } else if (errorData.code === 'FORBIDDEN') {
        throw new Error('api_forbidden');
      } else {
        throw new Error(`nowpayments_error: ${errorData.message || errorText}`);
      }
    } catch (parseError) {
      throw new Error(`nowpayments_error: ${errorText}`);
    }
  }

  const invoiceResponse: NOWPaymentsInvoiceResponse = await response.json();
  
  // Validate response structure
  if (!invoiceResponse.id || !invoiceResponse.invoice_url) {
    console.error("Invalid NOWPayments invoice response:", invoiceResponse);
    throw new Error('Invalid invoice response from NOWPayments');
  }
  
  console.log("NOWPayments invoice created successfully");
  console.log(`Invoice ID: ${invoiceResponse.id}`);
  console.log(`Invoice URL: ${invoiceResponse.invoice_url}`);
  console.log(`Amount: ${invoiceResponse.price_amount} ${invoiceResponse.price_currency}`);
  
  return invoiceResponse;
}

async function storePaymentRecord(
  supabase: any,
  consultationId: string,
  invoiceResponse: NOWPaymentsInvoiceResponse
): Promise<any> {
  console.log('💾 DATABASE INSERT START');
  
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

const handler = async (req: Request): Promise<Response> => {
  console.log("\n🚀🚀🚀 NOWPAYMENTS PAYMENT SYSTEM 🚀🚀🚀");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("\n📝 STEP 1: REQUEST VALIDATION");
    console.log(`Method: ${req.method}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);

    const { consultationId, amountUSD }: CreatePaymentRequest = await req.json();
    
    if (!consultationId || !amountUSD) {
      throw new Error('Missing required fields: consultationId and amountUSD');
    }
    
    console.log(`Consultation ID: ${consultationId}`);
    console.log(`Amount USD: ${amountUSD}`);
    console.log("✅ STEP 1 COMPLETE");

    console.log("\n🔐 STEP 2: ENVIRONMENT VALIDATION");
    
    const NOWPAYMENTS_API_KEY = Deno.env.get('NOWPAYMENTS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!NOWPAYMENTS_API_KEY) {
      throw new Error('NOWPAYMENTS_API_KEY environment variable is required');
    }
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables are required');
    }
    
    console.log("- NOWPAYMENTS_API_KEY: FOUND");
    console.log("- SUPABASE_URL: FOUND");
    console.log("- SUPABASE_SERVICE_ROLE_KEY: FOUND");
    console.log("✅ STEP 2 COMPLETE");

    console.log("\n🗄️ STEP 3: SUPABASE INITIALIZATION");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log("Supabase client created");
    console.log("✅ STEP 3 COMPLETE");

    console.log("\n🔍 STEP 4: DATABASE CONNECTIVITY TEST");
    
    // Verify consultation exists
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select('id, email')
      .eq('id', consultationId)
      .single();

    if (consultationError || !consultation) {
      throw new Error(`Consultation not found: ${consultationId}`);
    }

    console.log("Database connectivity test passed");
    console.log("Consultation found:", consultation.id);
    console.log("✅ STEP 4 COMPLETE");

    console.log("\n💰 STEP 5: NOWPAYMENTS INVOICE CREATION");
    
    const invoiceResponse = await createNOWInvoice(
      NOWPAYMENTS_API_KEY,
      consultationId,
      amountUSD,
      consultation,
      SUPABASE_URL
    );
    
    console.log("✅ STEP 5 COMPLETE");

    console.log("\n💾 STEP 6: STORE PAYMENT RECORD");
    
    const paymentRecord = await storePaymentRecord(
      supabase,
      consultationId,
      invoiceResponse
    );

    console.log(`Payment record stored with ID: ${paymentRecord.id}`);
    console.log("✅ STEP 6 COMPLETE");

    console.log("\n🎉 STEP 7: SUCCESS RESPONSE");
    console.log("Invoice creation successful!");
    console.log(`Invoice ID: ${invoiceResponse.id}`);
    console.log(`Invoice URL: ${invoiceResponse.invoice_url}`);
    console.log(`Amount: ${invoiceResponse.price_amount} ${invoiceResponse.price_currency}`);

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

  } catch (error: any) {
    console.error('\n❌ CRITICAL ERROR IN PAYMENT CREATION');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);

    // Categorize errors for better frontend handling
    let errorType = 'payment_creation_failed';
    let statusCode = 500;
    
    if (error.message === 'invalid_api_key') {
      errorType = 'api_configuration_error';
      statusCode = 503; // Service Unavailable
    } else if (error.message === 'api_forbidden') {
      errorType = 'api_access_denied';
      statusCode = 503;
    } else if (error.message.startsWith('nowpayments_error')) {
      errorType = 'nowpayments_error';
      statusCode = 502; // Bad Gateway
    } else if (error.message.includes('Database insert failed')) {
      errorType = 'database_error';
      statusCode = 500;
    }

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Payment creation failed',
      error_type: errorType,
      details: errorType === 'api_configuration_error' 
        ? 'API configuration issue. Please check NOWPayments API key.'
        : 'Check function logs for more information'
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