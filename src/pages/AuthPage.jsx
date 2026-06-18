import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Leaf, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validators, validateForm } from '../utils/validation';

export default function AuthPage({ setCurrentPage }) {
  const { signIn, signUp, signInWithMagicLink, user, isAdmin } = useAuth();
  const [mode, setMode] = useState('login'); // login, register, magic
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        setCurrentPage('admin');
      } else {
        setCurrentPage('home');
      }
    }
  }, [user, isAdmin, setCurrentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    // Validate form
    const fields = { email, password, fullName };
    const rules = {
      email: [validators.required, validators.email],
      password: mode !== 'magic' ? [validators.required, validators.minLength(6)] : [],
      fullName: mode === 'register' ? [validators.required] : []
    };
    
    const { isValid, errors } = validateForm(fields, rules);
    
    if (!isValid) {
      const firstError = Object.values(errors)[0];
      setError(firstError);
      return;
    }
    
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        setCurrentPage('home');
      } else if (mode === 'register') {
        const { error } = await signUp(email, password, { full_name: fullName });
        if (error) throw error;
        setMessage('Registrasi berhasil! Silakan cek email untuk verifikasi.');
      } else if (mode === 'magic') {
        const { error } = await signInWithMagicLink(email);
        if (error) throw error;
        setMessage('Link login telah dikirim ke email Anda!');
      }
    } catch (err) {
      const errorMsg = err.message || 'Terjadi kesalahan. Silakan coba lagi.';
      // Translate common Supabase errors to Indonesian
      const translated = errorMsg
        .replace('Invalid login credentials', 'Email atau password salah')
        .replace('Email not confirmed', 'Email belum diverifikasi. Silakan cek inbox Anda.')
        .replace('User already registered', 'Email sudah terdaftar. Silakan login.')
        .replace('Password should be at least 6 characters', 'Password minimal 6 karakter')
        .replace('Unable to validate email address: invalid format', 'Format email tidak valid')
        .replace('Rate limit exceeded', 'Terlalu banyak percobaan. Silakan tunggu sebentar.');
      setError(translated);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#DCFCE7] to-white px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-[#16A34A] p-3 rounded-xl">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#16A34A]">Hera Store</span>
          </div>
          <p className="text-gray-600">
            {mode === 'login' && 'Masuk untuk melanjutkan belanja'}
            {mode === 'register' && 'Buat akun baru untuk mulai berbelanja'}
            {mode === 'magic' && 'Login tanpa password via email'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Error / Success */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm mb-4"
              >
                {error}
              </motion.div>
            )}
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm mb-4"
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (register only) */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
                      placeholder="Budi Santoso"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
                  placeholder="nama@email.com"
                />
              </div>
            </div>

            {/* Password (login & register only) */}
            <AnimatePresence>
              {mode !== 'magic' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-12 py-3 text-sm focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#16A34A] text-white py-3 rounded-lg font-semibold hover:bg-[#15803D] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' && 'Masuk'}
                  {mode === 'register' && 'Daftar'}
                  {mode === 'magic' && 'Kirim Link'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Mode Switcher */}
          <div className="space-y-2">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => { setMode('register'); setError(''); setMessage(''); }}
                  className="w-full border border-gray-200 text-gray-700 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Belum punya akun? Daftar
                </button>
                <button
                  onClick={() => { setMode('magic'); setError(''); setMessage(''); }}
                  className="w-full text-[#16A34A] text-sm hover:underline"
                >
                  Login dengan Magic Link
                </button>
              </>
            )}
            {mode === 'register' && (
              <button
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className="w-full border border-gray-200 text-gray-700 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Sudah punya akun? Masuk
              </button>
            )}
            {mode === 'magic' && (
              <button
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className="w-full border border-gray-200 text-gray-700 py-3 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Kembali ke Login dengan Password
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Dengan masuk, Anda menyetujui{' '}
          <button className="text-[#16A34A] hover:underline">Syarat & Ketentuan</button>
          {' '}dan{' '}
          <button className="text-[#16A34A] hover:underline">Kebijakan Privasi</button>
        </p>
      </motion.div>
    </div>
  );
}
