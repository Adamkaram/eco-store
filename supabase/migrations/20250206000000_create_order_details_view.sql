-- Ensure the orders table has all necessary columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2);

-- Ensure the profiles table has necessary columns
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create or replace the order_details view
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

