import React from 'react';
import ProductDetail from './ProductDetail';

interface Props {
  params: {
    id: string;
  };
}

const ProductPage = ({ params }: Props) => {
  return <ProductDetail id={params.id} />;
};

export default ProductPage;
