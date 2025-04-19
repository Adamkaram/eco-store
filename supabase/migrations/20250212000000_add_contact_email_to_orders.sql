-- Check if the column exists first
DO $$ 
BEGIN
  IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      AND column_name = 'contact_email'
  ) THEN
      -- Add the contact_email column
      ALTER TABLE orders 
      ADD COLUMN contact_email TEXT;

      -- Create an index for better query performance
      CREATE INDEX idx_orders_contact_email ON orders(contact_email);
  END IF;
END $$;

-- Update existing orders to set contact_email from profiles if available
UPDATE orders o
SET contact_email = p.email
FROM profiles p
WHERE o.user_id = p.id
AND o.contact_email IS NULL;

-- Add a comment to the column for documentation
COMMENT ON COLUMN orders.contact_email IS 'Email address for contacting the customer about this order';

