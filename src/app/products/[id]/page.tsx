import React from 'react';
import ProductDetail from './ProductDetail';

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetail id={params.id} />;
}
