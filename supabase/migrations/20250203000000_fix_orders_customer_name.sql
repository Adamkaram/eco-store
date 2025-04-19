-- First check if the column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name = 'customer_name'
  ) THEN
      -- Add the customer_name column
      ALTER TABLE orders 
      ADD COLUMN customer_name TEXT;

      -- Update existing orders with customer names from profiles
      UPDATE orders o
      SET customer_name = p.full_name
      FROM profiles p
      WHERE o.user_id = p.id
      AND o.customer_name IS NULL;
  END IF;
END $$;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);

