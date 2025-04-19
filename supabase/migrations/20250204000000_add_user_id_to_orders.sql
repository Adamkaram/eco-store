-- First, ensure the user_id column exists in the orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create an index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Update existing orders to set user_id if it's null (this assumes a one-to-one relationship between profiles and auth.users)
UPDATE orders o
SET user_id = p.id
FROM profiles p
WHERE o.user_id IS NULL
AND o.customer_name = p.full_name;

-- Add a foreign key constraint
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user_id
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE SET NULL;

