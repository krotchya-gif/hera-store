import React from 'react';

// Skeleton for Product Card
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );
}

// Skeleton for Product Grid
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton for Product Detail
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Image skeleton */}
        <div className="bg-gray-200 rounded-xl aspect-square animate-pulse" />
        {/* Info skeleton */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for Cart Item
export function CartItemSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-3 flex gap-4">
      <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
      </div>
    </div>
  );
}

// Skeleton for Order Card
export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-3">
      <div className="flex items-center justify-between mb-3 pb-3 border-b">
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for Table Row
export function TableRowSkeleton({ columns = 6 }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// Skeleton for Admin Stats
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="h-10 bg-gray-200 rounded w-10 mb-3 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse" />
      <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
    </div>
  );
}

// Skeleton for Category Card
export function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
      <div className="w-12 h-12 bg-gray-200 rounded-full mb-3 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
    </div>
  );
}

// Empty State Component
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-300 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-md">{description}</p>
      {action}
    </div>
  );
}
