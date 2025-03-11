export interface Order {
  id: string;
  userId?: string;
  status: 'pending' | 'completed' | 'cancelled';
  total_amount: number;
  shipping_address?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  price_per_unit: number;
  customization_data?: {
    text?: string;
    textColor?: string;
    font?: string;
    imageUrl?: string;
    position?: string;
    type?: 'broderie' | 'flocage';
    price?: number;
  };
}
