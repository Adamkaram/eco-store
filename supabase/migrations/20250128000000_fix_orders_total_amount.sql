-- Check if the column exists first to avoid errors
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'total_amount'
    ) THEN
        -- Add the total_amount column
        ALTER TABLE orders 
        ADD COLUMN total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

        -- Update existing orders to calculate total_amount from order_items
        UPDATE orders o
        SET total_amount = (
            SELECT COALESCE(SUM(quantity * price), 0)
            FROM order_items
            WHERE order_id = o.id
        );
    END IF;
END $$;

-- Create an index on total_amount for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);

