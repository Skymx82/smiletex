import { ProductCustomization } from './customization';

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  imageUrl: string;
  customization?: ProductCustomization;
  shippingType?: 'normal' | 'fast' | 'urgent';
}

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartResponse {
  cartId: string;
  url: string;
  error?: string;
}
