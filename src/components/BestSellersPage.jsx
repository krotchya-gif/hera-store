import React from 'react';
import ProductDiscoveryPage from './ProductDiscoveryPage';

export default function BestSellersPage(props) {
  return (
    <ProductDiscoveryPage
      title="Produk Terlaris"
      subtitle="Produk paling banyak diminati pelanggan kami"
      defaultSort="Terlaris"
      {...props}
    />
  );
}
