-- Add missing columns to the orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS customer_name text;

-- Create cart_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for cart_items
CREATE POLICY "Users can view their own cart items" 
ON cart_items FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" 
ON cart_items FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" 
ON cart_items FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" 
ON cart_items FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Update products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS category text;

-- Ensure the is_admin column exists in the profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Add RLS policies for profiles if not already present
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
    ON profiles FOR SELECT 
    TO authenticated 
    USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id);
  END IF;
END $$;

-- Ensure get_top_selling_products function exists
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

