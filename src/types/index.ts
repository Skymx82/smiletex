// Product Types
export type Product = {
  id: string;
  name: string;
  description: string;
  base_price: number;
  image_url: string;
  category_id: string;
  is_featured: boolean;
  is_new: boolean;
  created_at: string;
  updated_at: string;
  variants?: ProductVariant[];
  category?: Category;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock_quantity: number;
  price_adjustment: number;
  sku: string;
  created_at: string;
  updated_at: string;
};

// Category Types
export type Category = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  subcategories?: Category[];
};

// User Types
export type CustomerProfile = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
  country: string;
  created_at: string;
  updated_at: string;
};

// Customization Types
export type SavedDesign = {
  id: string;
  user_id: string;
  name: string;
  design_data: any; // JSON data
  product_id: string;
  preview_image_url: string;
  created_at: string;
  updated_at: string;
};

// Order Types
export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: Address;
  billing_address: Address;
  payment_intent_id: string;
  shipping_method: string;
  shipping_cost: number;
  tax_amount: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_variant_id: string;
  quantity: number;
  price_per_unit: number;
  customization_data: any; // JSON data
  created_at: string;
};

export type Address = {
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postal_code: string;
  country: string;
  phone?: string;
};

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// Customization Types
export type CustomizationOption = {
  type: 'text' | 'image' | 'design';
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  textOptions?: {
    content: string;
    font: string;
    color: string;
    size: number;
  };
  imageOptions?: {
    url: string;
    width: number;
    height: number;
  };
};
