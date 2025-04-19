-- Drop the existing view if it exists
DROP VIEW IF EXISTS order_details;

-- Create an updated view that correctly joins orders, auth.users, and profiles
CREATE OR REPLACE VIEW order_details AS
SELECT 
  o.id AS order_id,
  o.created_at,
  o.status,
  o.total_amount,
  o.payment_type,
  o.user_id,
  COALESCE(p.full_name, u.email) AS customer_name,
  u.email AS customer_email
FROM 
  orders o
JOIN 
  auth.users u ON o.user_id = u.id
LEFT JOIN 
  profiles p ON o.user_id = p.id;

-- Grant necessary permissions
GRANT SELECT ON order_details TO authenticated;

