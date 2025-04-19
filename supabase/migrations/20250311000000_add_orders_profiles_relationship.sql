-- Ensure the orders table has the user_id column
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Ensure the profiles table has the necessary columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create a view to join orders and auth.users for easier querying
CREATE OR REPLACE VIEW order_details AS
SELECT 
o.id AS order_id,
o.created_at,
o.status,
o.total_amount,
o.payment_type,
o.user_id,
u.email AS customer_email,
p.full_name AS customer_name
FROM 
orders o
JOIN 
auth.users u ON o.user_id = u.id
LEFT JOIN 
profiles p ON o.user_id = p.id;

-- Update RLS policies for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own orders
CREATE POLICY view_own_orders ON orders
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own orders
CREATE POLICY insert_own_orders ON orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all orders
CREATE POLICY admin_view_all_orders ON orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  )
);

-- Grant necessary permissions
GRANT SELECT ON order_details TO authenticated;
GRANT SELECT, INSERT ON orders TO authenticated;

-- Update existing orders to set user_id if it's null
UPDATE orders o
SET user_id = u.id
FROM auth.users u
WHERE o.user_id IS NULL
AND o.customer_email = u.email;

