-- First, check if the column exists to avoid errors
DO $$ 
BEGIN
    -- Check if the column doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'total_amount'
    ) THEN
        -- Add the total_amount column
        ALTER TABLE orders 
        ADD COLUMN total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
    END IF;
END $$;

-- Update existing orders to calculate total_amount from order_items if needed
UPDATE orders o
SET total_amount = (
    SELECT COALESCE(SUM(quantity * price), 0)
    FROM order_items
    WHERE order_id = o.id
)
WHERE total_amount = 0;

