import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export default function RouteGuard({ children, requireAuth = false, requireAdmin = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#16A34A]/30 border-t-[#16A34A] rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  // If auth is required and no user, show login prompt
  if (requireAuth && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Akses Terbatas</h3>
          <p className="text-sm text-gray-500 mb-4">Silakan masuk untuk mengakses halaman ini.</p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'auth' }))}
            className="bg-[#16A34A] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#15803D]"
          >
            Masuk Sekarang
          </button>
        </motion.div>
      </div>
    );
  }

  // If admin is required and not admin
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Akses Ditolak</h3>
          <p className="text-sm text-gray-500 mb-4">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return children;
}
