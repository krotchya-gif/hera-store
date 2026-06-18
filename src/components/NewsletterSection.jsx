import React, { useState } from 'react';
import { Mail, Send, CheckCircle, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeNewsletter } from '../lib/api';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Masukkan alamat email Anda');
      return;
    }
    if (!validateEmail(email)) {
      setError('Format email tidak valid');
      return;
    }

    setLoading(true);
    try {
      await subscribeNewsletter(email.trim());
      setSubmitted(true);
    } catch (err) {
      console.error('Newsletter error:', err);
      if (err.code === '23505') {
        setError('Alamat email ini sudah terdaftar');
      } else {
        setError('Gagal mendaftar. Silakan coba lagi nanti.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-r from-[#16A34A] via-[#15803D] to-[#166534] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left */}
          <div className="text-white flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-green-200 text-sm font-medium uppercase tracking-wider">Newsletter</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
              Dapatkan Penawaran Eksklusif
            </h2>
            <p className="text-green-100 text-sm leading-relaxed max-w-md">
              Daftar sekarang dan nikmati notifikasi flash sale, promo khusus, dan tips produk terpilih langsung di inbox Anda. Tanpa spam!
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              {['✅ Promo eksklusif subscriber', '📦 Info produk baru', '🎁 Voucher ulang tahun'].map((item) => (
                <span key={item} className="text-xs text-green-200">{item}</span>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div className="flex-shrink-0 w-full md:w-auto md:min-w-[380px]">
            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5"
                >
                  <label className="block text-white text-sm font-medium mb-2">
                    Alamat Email Anda
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-300" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        placeholder="nama@email.com"
                        className={`w-full bg-white/90 text-gray-800 placeholder:text-gray-400 pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white border-2 transition ${
                          error ? 'border-red-300' : 'border-transparent'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 bg-white text-[#16A34A] font-semibold px-5 py-3 rounded-xl hover:bg-green-50 disabled:opacity-60 disabled:cursor-not-allowed transition flex-shrink-0 text-sm"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {loading ? '' : 'Daftar'}
                    </button>
                  </div>
                  {error && (
                    <p className="text-red-300 text-xs mt-2 flex items-center gap-1">
                      ⚠️ {error}
                    </p>
                  )}
                  <p className="text-green-200 text-xs mt-3">
                    🔒 Email Anda aman. Kami tidak pernah menjual data ke pihak ketiga.
                  </p>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center"
                >
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">Berhasil Terdaftar! 🎉</h3>
                  <p className="text-green-100 text-sm">
                    Terima kasih! Penawaran eksklusif akan segera hadir di inbox <strong className="text-white">{email}</strong>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
