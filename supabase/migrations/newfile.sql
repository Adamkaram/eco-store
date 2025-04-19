CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  image_url text,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  address text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'pending',
  total_amount decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order items table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  price decimal(10,2) NOT NULL
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Products are insertable by admins" 
  ON products FOR INSERT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ));

CREATE POLICY "Products are updatable by admins" 
  ON products FOR UPDATE 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ));

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Orders policies
CREATE POLICY "Users can view their own orders" 
  ON orders FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
  ON orders FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" 
  ON orders FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  ));

-- Order items policies
CREATE POLICY "Users can view their own order items" 
  ON order_items FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own order items" 
  ON order_items FOR INSERT 
  TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Cart items policies
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

-- Seed admin user (password will be set through auth signup)
INSERT INTO profiles (id, email, full_name, is_admin)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@glowbeauty.com',
  'Admin User',
  true
);

-- Seed products
INSERT INTO products (name, description, price, stock, category, image_url) VALUES
('Hydrating Serum', 'Advanced hydrating formula with hyaluronic acid', 49.99, 100, 'Skincare', 'https://images.unsplash.com/photo-1570179538662-31547dbe9846?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
('Matte Lipstick', 'Long-lasting matte finish lipstick', 24.99, 150, 'Makeup', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
('Rose Perfume', 'Elegant rose fragrance with lasting notes', 89.99, 50, 'Fragrances', 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
('Anti-Aging Cream', 'Advanced formula with retinol', 79.99, 75, 'Skincare', 'https://images.unsplash.com/photo-1570179538662-31547dbe9846?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
('Volumizing Mascara', 'Dramatic volume and length', 29.99, 200, 'Makeup', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
('Citrus Fresh Perfume', 'Refreshing citrus blend', 69.99, 60, 'Fragrances', 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80');

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS customer_name text;

