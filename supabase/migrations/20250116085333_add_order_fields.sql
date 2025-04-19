ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS customer_name text;

