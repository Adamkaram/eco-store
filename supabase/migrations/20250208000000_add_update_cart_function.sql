-- Create or replace the update_cart function
CREATE OR REPLACE FUNCTION public.update_cart(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO cart_items (user_id, product_id, quantity)
  VALUES (p_user_id, p_product_id, p_quantity)
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET 
    quantity = cart_items.quantity + p_quantity,
    updated_at = CURRENT_TIMESTAMP;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_cart TO authenticated;

