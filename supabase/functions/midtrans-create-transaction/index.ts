// @ts-nocheck — Deno runtime, not Node.js
// ============================================================
// Midtrans Create Transaction — Supabase Edge Function
// ============================================================
//
// Deploy: supabase functions deploy midtrans-create-transaction
// Env:   MIDTRANS_SERVER_KEY=your-server-key
//        MIDTRANS_SANDBOX=true
//
// ============================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

serve(async (req) => {
  try {
    const { orderId, grossAmount, customerDetails } = await req.json();

    const isSandbox = Deno.env.get('MIDTRANS_SANDBOX') !== 'false';
    const baseUrl = isSandbox
      ? 'https://app.sandbox.midtrans.com/snap/v1/transactions'
      : 'https://app.midtrans.com/snap/v1/transactions';

    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY');
    if (!serverKey) {
      return new Response(JSON.stringify({ error: 'MIDTRANS_SERVER_KEY not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const auth = btoa(`${serverKey}:`);

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      credit_card: { secure: true },
      customer_details: customerDetails,
      callbacks: {
        finish: `${Deno.env.get('VITE_APP_URL') || 'http://localhost:5173'}/checkout`,
      },
    };

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Midtrans API error:', data);
      return new Response(JSON.stringify({ error: data.status_message || 'Midtrans request failed' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Midtrans function error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
