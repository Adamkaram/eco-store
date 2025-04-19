-- Add payment_type column to orders table
ALTER TABLE orders
ADD COLUMN payment_type VARCHAR(20) CHECK (payment_type IN ('payment_gateway', 'cash_on_delivery'));

-- Update status field to include new statuses
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'deleted'));

-- Update existing orders to have a default payment_type
UPDATE orders
SET payment_type = 'payment_gateway'
WHERE payment_type IS NULL;

-- Make payment_type NOT NULL
ALTER TABLE orders
ALTER COLUMN payment_type SET NOT NULL;

-- Create an index on payment_type for better query performance
CREATE INDEX idx_orders_payment_type ON orders(payment_type);

-- Create an index on status for better query performance
CREATE INDEX idx_orders_status ON orders(status);

