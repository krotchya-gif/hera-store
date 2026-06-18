import React from 'react';
import ProductDiscoveryPage from './ProductDiscoveryPage';

export default function NewProductsPage(props) {
  return (
    <ProductDiscoveryPage
      title="Produk Terbaru"
      subtitle="Temukan produk-produk terbaru dari Hera Store"
      defaultSort="Terbaru"
      {...props}
    />
  );
}
