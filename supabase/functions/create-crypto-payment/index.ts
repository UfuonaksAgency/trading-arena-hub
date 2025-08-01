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
        console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Get BTC price with multiple fallbacks
async function getBTCPrice(): Promise<number> {
  const fallbackPrice = 45000; // Fallback price in USD
  
  // Try CoinGecko API first
  try {
    console.log('Attempting to fetch BTC price from CoinGecko...');
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    const price = data.bitcoin?.usd;
    
    if (typeof price === 'number' && price > 0) {
      console.log('Successfully fetched BTC price from CoinGecko:', price);
      return price;
    }
    
    throw new Error('Invalid price data from CoinGecko');
  } catch (error) {
    console.warn('CoinGecko API failed:', error.message);
  }

  // Try CoinDesk API as fallback
  try {
    console.log('Attempting to fetch BTC price from CoinDesk...');
    const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice/USD.json', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`CoinDesk API error: ${response.status}`);
    }
    
    const data = await response.json();
    const priceString = data.bpi?.USD?.rate;
    
    if (priceString) {
      const price = parseFloat(priceString.replace(/,/g, ''));
      if (price > 0) {
        console.log('Successfully fetched BTC price from CoinDesk:', price);
        return price;
      }
    }
    
    throw new Error('Invalid price data from CoinDesk');
  } catch (error) {
    console.warn('CoinDesk API failed:', error.message);
  }

  // Use fallback price
  console.warn(`Using fallback BTC price: $${fallbackPrice}`);
  return fallbackPrice;
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
      console.error('Invalid request body:', error);
      throw new Error('Invalid request body: Expected JSON with consultationId');
    }
    
    console.log('Payment creation request for consultation:', consultationId, 'Amount:', amountUSD);
    
    if (!consultationId || typeof consultationId !== 'string') {
      throw new Error('Consultation ID is required and must be a string');
    }

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const apiKey = Deno.env.get('COINREMITTER_API_KEY');
    const password = Deno.env.get('COINREMITTER_PASSWORD');
    const merchantId = Deno.env.get('COINREMITTER_MERCHANT_ID');

    console.log('Environment variables check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseServiceKey: !!supabaseServiceKey,
      hasApiKey: !!apiKey,
      hasPassword: !!password,
      hasMerchantId: !!merchantId
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    if (!apiKey || !password || !merchantId) {
      throw new Error('Missing CoinRemitter API credentials');
    }

    // Initialize Supabase with service role for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get BTC price with retries and fallbacks
    const btcPriceUSD = await retryWithBackoff(() => getBTCPrice(), 3, 1000);
    const amountBTC = (amountUSD / btcPriceUSD);

    console.log('BTC price calculation:', {
      btcPriceUSD,
      amountBTC,
      amountUSD
    });

    // Create new payment address via CoinRemitter API with retries
    const coinRemitterData = await retryWithBackoff(async () => {
      console.log('Calling CoinRemitter API...');
      
      const webhookUrl = `${supabaseUrl}/functions/v1/coinremitter-webhook`;
      const label = `con-${consultationId.substring(0, 16)}`;
      
      console.log('CoinRemitter request params:', {
        label,
        webhookUrl,
        merchantId
      });

      const response = await fetch('https://coinremitter.com/api/v3/BTC/get-new-address', {
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

      if (!response.ok) {
        throw new Error(`CoinRemitter HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('CoinRemitter API response:', {
        flag: data.flag,
        msg: data.msg,
        hasData: !!data.data,
        hasAddress: !!data.data?.address
      });
      
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
        coin_type: 'BTC',
        amount_usd: amountUSD,
        amount_crypto: amountBTC,
        coinremitter_invoice_id: coinRemitterData.data.invoice_id,
        payment_data: {
          coinremitter_response: coinRemitterData.data,
          btc_price_usd: btcPriceUSD,
        }
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Database error:', paymentError);
      throw new Error('Failed to create payment record');
    }

    console.log('Payment created successfully:', {
      paymentId: paymentData.id,
      address: coinRemitterData.data.address,
      amount: amountBTC
    });

    return new Response(JSON.stringify({
      success: true,
      payment: {
        id: paymentData.id,
        address: coinRemitterData.data.address,
        amount_btc: amountBTC,
        amount_usd: amountUSD,
        expires_at: paymentData.expires_at,
        qr_code: coinRemitterData.data.qr_code,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-crypto-payment:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});