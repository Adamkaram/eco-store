-- Ensure the orders table has a user_id column referencing auth.users
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Update existing orders to set user_id if it's null (assuming customer_name matches profiles.full_name)
UPDATE orders o
SET user_id = p.id
FROM profiles p
WHERE o.user_id IS NULL
AND o.customer_name = p.full_name;

-- Ensure the profiles table has the necessary columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create a view to join orders and profiles
CREATE OR REPLACE VIEW order_details AS
SELECT 
  o.id,
  o.created_at,
  o.status,
  o.total_amount,
  o.customer_name,
  o.user_id,
  p.full_name AS profile_full_name,
  p.email AS profile_email
FROM 
  orders o
LEFT JOIN 
  profiles p ON o.user_id = p.id;

-- Grant necessary permissions
GRANT SELECT ON order_details TO authenticated;

