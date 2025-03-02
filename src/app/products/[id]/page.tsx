import React from 'react';
import ProductDetail from './ProductDetail';

// Correction du type pour être compatible avec Next.js 15
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
