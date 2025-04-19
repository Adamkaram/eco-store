-- Drop the existing function if it exists (both versions to be safe)
DROP FUNCTION IF EXISTS public.update_cart(UUID, INTEGER, UUID);
DROP FUNCTION IF EXISTS public.update_cart(UUID, UUID, INTEGER);

-- Create the function with the exact parameter names we're using
CREATE OR REPLACE FUNCTION public.update_cart(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO cart_items (user_id, product_id, quantity)
  VALUES (auth.uid(), p_product_id, p_quantity)
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET 
    quantity = cart_items.quantity + EXCLUDED.quantity,
    updated_at = CURRENT_TIMESTAMP;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_cart(UUID, INTEGER) TO authenticated;

