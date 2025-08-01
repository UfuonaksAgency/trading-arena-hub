import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsultationRequest {
  consultationId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { consultationId }: ConsultationRequest = await req.json();
    
    console.log('Payment creation request for consultation:', consultationId);
    
    if (!consultationId) {
      throw new Error('Consultation ID is required');
    }

    // Initialize Supabase with service role for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get CoinRemitter credentials
    const apiKey = Deno.env.get('COINREMITTER_API_KEY');
    const password = Deno.env.get('COINREMITTER_PASSWORD');
    const merchantId = Deno.env.get('COINREMITTER_MERCHANT_ID');

    console.log('API credentials check:', {
      hasApiKey: !!apiKey,
      hasPassword: !!password,
      hasMerchantId: !!merchantId
    });

    if (!apiKey || !password || !merchantId) {
      throw new Error('Missing CoinRemitter API credentials');
    }

    // Create new payment address via CoinRemitter API
    const coinRemitterResponse = await fetch('https://coinremitter.com/api/v3/BTC/get-new-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        password: password,
        merchant_id: merchantId,
        label: `con-${consultationId.substring(0, 16)}`,
        webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/coinremitter-webhook`,
      }),
    });

    const coinRemitterData = await coinRemitterResponse.json();
    
    if (!coinRemitterData.flag || coinRemitterData.flag !== 1) {
      console.error('CoinRemitter API Error:', coinRemitterData);
      throw new Error(`CoinRemitter API Error: ${coinRemitterData.msg || 'Failed to create payment address'}`);
    }

    // Get current BTC price for $300 USD
    const btcPriceResponse = await fetch('https://api.coindesk.com/v1/bpi/currentprice/USD.json');
    const btcPriceData = await btcPriceResponse.json();
    const btcPriceUSD = parseFloat(btcPriceData.bpi.USD.rate.replace(/,/g, ''));
    const amountBTC = (300 / btcPriceUSD);

    // Store payment record in database
    const { data: paymentData, error: paymentError } = await supabase
      .from('crypto_payments')
      .insert({
        consultation_id: consultationId,
        payment_address: coinRemitterData.data.address,
        coin_type: 'BTC',
        amount_usd: 300.00,
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
        amount_usd: 300,
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