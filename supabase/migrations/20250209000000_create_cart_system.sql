-- First, ensure the cart_items table exists with the correct structure
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Add a unique constraint to prevent duplicate cart items
    UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cart items"
    ON cart_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
    ON cart_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
    ON cart_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
    ON cart_items FOR DELETE
    USING (auth.uid() = user_id);

-- Create the update_cart function
CREATE OR REPLACE FUNCTION public.update_cart(
    p_product_id UUID,
    p_quantity INTEGER,
    p_user_id UUID DEFAULT auth.uid()
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES (p_user_id, p_product_id, p_quantity)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET 
        quantity = cart_items.quantity + EXCLUDED.quantity,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;

-- Grant necessary permissions
GRANT ALL ON cart_items TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_cart TO authenticated;

