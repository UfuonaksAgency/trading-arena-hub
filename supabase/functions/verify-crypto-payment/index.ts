import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPaymentRequest {
  paymentId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId }: VerifyPaymentRequest = await req.json();
    
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }

    // Initialize Supabase with service role for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('crypto_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment not found');
    }

    // If already completed, return current status
    if (payment.status === 'completed') {
      return new Response(JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          confirmations: payment.confirmations,
          transaction_hash: payment.transaction_hash,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if payment has expired
    const now = new Date();
    const expiresAt = new Date(payment.expires_at);
    if (now > expiresAt && payment.status === 'pending') {
      await supabase
        .from('crypto_payments')
        .update({ status: 'expired' })
        .eq('id', paymentId);

      return new Response(JSON.stringify({
        success: false,
        payment: {
          id: payment.id,
          status: 'expired',
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get CoinRemitter credentials
    const apiKey = Deno.env.get('COINREMITTER_API_KEY');
    const password = Deno.env.get('COINREMITTER_PASSWORD');

    if (!apiKey || !password) {
      throw new Error('Missing CoinRemitter API credentials');
    }

    // Check payment status via CoinRemitter API
    const coinRemitterResponse = await fetch('https://coinremitter.com/api/v3/TCN/get-transaction-by-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        password: password,
        address: payment.payment_address,
      }),
    });

    const coinRemitterData = await coinRemitterResponse.json();
    
    if (!coinRemitterData.flag || coinRemitterData.flag !== 1) {
      // No transactions found is normal for pending payments
      return new Response(JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          confirmations: payment.confirmations,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if payment is sufficient
    const transactions = coinRemitterData.data || [];
    let totalReceived = 0;
    let latestTxHash = payment.transaction_hash;
    let maxConfirmations = payment.confirmations || 0;

    for (const tx of transactions) {
      if (tx.type === 'receive') {
        totalReceived += parseFloat(tx.amount);
        if (tx.confirmations > maxConfirmations) {
          maxConfirmations = tx.confirmations;
          latestTxHash = tx.txid;
        }
      }
    }

    let newStatus = payment.status;
    
    // Check if payment is complete (received >= required amount with at least 1 confirmation)
    if (totalReceived >= payment.amount_crypto && maxConfirmations >= 1) {
      newStatus = 'completed';
    } else if (totalReceived > 0) {
      newStatus = 'partial';
    }

    // Update payment record if status changed
    if (newStatus !== payment.status || maxConfirmations !== payment.confirmations || latestTxHash !== payment.transaction_hash) {
      await supabase
        .from('crypto_payments')
        .update({
          status: newStatus,
          confirmations: maxConfirmations,
          transaction_hash: latestTxHash,
          payment_data: {
            ...payment.payment_data,
            total_received: totalReceived,
            last_checked: new Date().toISOString(),
            transactions: transactions,
          }
        })
        .eq('id', paymentId);
    }


    return new Response(JSON.stringify({
      success: true,
      payment: {
        id: payment.id,
        status: newStatus,
        confirmations: maxConfirmations,
        transaction_hash: latestTxHash,
        total_received: totalReceived,
        amount_required: payment.amount_crypto,
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