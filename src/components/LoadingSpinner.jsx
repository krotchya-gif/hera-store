import React from 'react';

export default function LoadingSpinner({ size = 40, color = '#16A34A' }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="animate-spin rounded-full border-b-2 border-t-2"
        style={{
          width: size,
          height: size,
          borderColor: color,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent'
        }}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size={60} />
        <p className="mt-4 text-gray-600 font-medium">Memuat...</p>
      </div>
    </div>
  );
}

export function ButtonLoader({ size = 20 }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className="animate-spin rounded-full border-2 border-white border-t-transparent"
        style={{
          width: size,
          height: size
        }}
      />
    </div>
  );
}
