import { supabase } from './supabase';

const SNAP_URL = import.meta.env.VITE_MIDTRANS_SNAP_URL || 'https://app.sandbox.midtrans.com/snap/snap.js';
const CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '';

let scriptLoaded = false;

const loadSnapScript = () => {
  return new Promise((resolve, reject) => {
    if (scriptLoaded) return resolve(true);
    if (document.querySelector('script[src*="midtrans"]')) {
      scriptLoaded = true;
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = SNAP_URL;
    script.setAttribute('data-client-key', CLIENT_KEY);
    script.onload = () => { scriptLoaded = true; resolve(true); };
    script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap'));
    document.body.appendChild(script);
  });
};

export const isMidtransAvailable = () => !!CLIENT_KEY;

export const createMidtransTransaction = async (orderId, grossAmount, customerDetails) => {
  const { data, error } = await supabase.functions.invoke('midtrans-create-transaction', {
    body: { orderId, grossAmount, customerDetails },
  });
  if (error) throw new Error(error.message || 'Gagal membuat transaksi Midtrans');
  return data;
};

export const payWithMidtrans = async (snapToken) => {
  await loadSnapScript();
  return new Promise((resolve) => {
    window.snap.pay(snapToken, {
      onSuccess: (result) => {
        resolve({ status: 'success', transactionId: result.transaction_id, result });
      },
      onPending: (result) => {
        resolve({ status: 'pending', transactionId: result.transaction_id, result });
      },
      onError: (result) => {
        resolve({ status: 'error', message: result.status_message, result });
      },
      onClose: () => {
        resolve({ status: 'close' });
      },
    });
  });
};
