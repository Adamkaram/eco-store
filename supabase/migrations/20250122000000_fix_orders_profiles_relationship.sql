-- First, let's ensure the profiles table exists and has the correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Now, let's ensure the orders table exists and has the correct structure
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shipping_address TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  customer_name TEXT
);

-- Add an index on the user_id column in the orders table for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Ensure the order_items table exists and has the correct structure
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Add indexes on the order_id and product_id columns in the order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Update or create the get_top_selling_products function
CREATE OR REPLACE FUNCTION get_top_selling_products()
RETURNS TABLE (
  id UUID,
  name TEXT,
  total_sold BIGINT,
  total_revenue NUMERIC(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    COALESCE(SUM(oi.quantity), 0)::BIGINT as total_sold,
    COALESCE(SUM(oi.quantity * oi.price), 0)::NUMERIC(10, 2) as total_revenue
  FROM 
    products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
  GROUP BY 
    p.id, p.name
  ORDER BY 
    total_sold DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Ensure RLS policies are in place
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create or replace RLS policies
CREATE POLICY IF NOT EXISTS "Users can view their own profile" 
ON profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can view their own orders" 
ON orders FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own orders" 
ON orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can view their own order items" 
ON order_items FOR SELECT 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id = auth.uid()
));

CREATE POLICY IF NOT EXISTS "Users can create their own order items" 
ON order_items FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
  SELECT 1 FROM orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id = auth.uid()
));

