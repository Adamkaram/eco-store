-- Ensure the profiles table has the correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure the orders table has the correct structure and relationship
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  shipping_address TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  customer_name TEXT
);

-- Add an index on the user_id column in the orders table for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Ensure RLS policies are in place
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY IF NOT EXISTS "Admins can view all orders" 
ON orders FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

