import React from 'react';
import ProductDetail from './ProductDetail';

type Params = {
  id: string;
};

export default function ProductPage({ params }: { params: Params }) {
  return <ProductDetail id={params.id} />;
}
