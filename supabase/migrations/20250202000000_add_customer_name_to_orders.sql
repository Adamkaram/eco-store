-- Add customer_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name = 'customer_name'
  ) THEN
      ALTER TABLE orders 
      ADD COLUMN customer_name TEXT;
  END IF;
END $$;

-- Update existing orders to set customer name from profiles if available
UPDATE orders o
SET customer_name = p.full_name
FROM profiles p
WHERE o.user_id = p.id
AND o.customer_name IS NULL;

