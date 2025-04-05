-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table avec les nouvelles colonnes intégrées
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  weight_gsm INTEGER,                   -- Grammage du produit en g/m²
  supplier_reference VARCHAR(100),      -- Référence du produit chez le fournisseur
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variants (Sizes, Colors, etc.)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(50),
  color VARCHAR(50),
  stock_quantity INTEGER DEFAULT 0,
  price_adjustment DECIMAL(10, 2) DEFAULT 0.00,
  sku VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Customer Profiles (extends Supabase Auth)
CREATE TABLE customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Saved Designs
CREATE TABLE saved_designs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  design_data JSONB NOT NULL,
  product_id UUID REFERENCES products(id),
  preview_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Carts Table
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255), -- For non-authenticated users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Items Table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  customization_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB,
  billing_address JSONB,
  payment_intent_id VARCHAR(255),
  shipping_method VARCHAR(100),
  shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  price_per_unit DECIMAL(10, 2) NOT NULL,
  customization_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Tracking and Inventory Management
CREATE TABLE inventory_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity_change INTEGER NOT NULL,
  reason VARCHAR(100),
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Real-time triggers for inventory updates
CREATE OR REPLACE FUNCTION update_product_variant_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity + NEW.quantity_change,
      updated_at = NOW()
  WHERE id = NEW.product_variant_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_inventory_change
AFTER INSERT ON inventory_changes
FOR EACH ROW
EXECUTE FUNCTION update_product_variant_stock();

-- Automated stock check function for order placement
CREATE OR REPLACE FUNCTION check_stock_for_order()
RETURNS TRIGGER AS $$
DECLARE
  insufficient_stock BOOLEAN := false;
  variant_id UUID;
  ordered_qty INTEGER;
  available_qty INTEGER;
BEGIN
  FOR variant_id, ordered_qty IN
    SELECT product_variant_id, quantity FROM order_items WHERE order_id = NEW.id
  LOOP
    SELECT stock_quantity INTO available_qty FROM product_variants WHERE id = variant_id;
    IF available_qty < ordered_qty THEN
      insufficient_stock := true;
      EXIT;
    END IF;
  END LOOP;
  
  IF insufficient_stock THEN
    RAISE EXCEPTION 'Insufficient stock for one or more items in the order';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_order_confirmation
BEFORE UPDATE ON orders
FOR EACH ROW
WHEN (OLD.status = 'pending' AND NEW.status = 'confirmed')
EXECUTE FUNCTION check_stock_for_order();

-- Function to automatically create inventory changes when an order is confirmed
CREATE OR REPLACE FUNCTION create_inventory_changes_for_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    INSERT INTO inventory_changes (
      product_variant_id,
      quantity_change,
      reason,
      order_id,
      created_by
    )
    SELECT 
      product_variant_id,
      -quantity, -- Negative because we're reducing stock
      'order_confirmed',
      NEW.id,
      NEW.user_id
    FROM order_items
    WHERE order_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_confirmation
AFTER UPDATE ON orders
FOR EACH ROW
WHEN (OLD.status = 'pending' AND NEW.status = 'confirmed')
EXECUTE FUNCTION create_inventory_changes_for_order();


-- Ajout de commentaires pour documenter les champs
COMMENT ON COLUMN products.weight_gsm IS 'Grammage du produit en g/m²';
COMMENT ON COLUMN products.supplier_reference IS 'Référence du produit chez le fournisseur';
