-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.update_cart(UUID, INTEGER);

-- Create the function in the public schema
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
  INSERT INTO public.cart_items (user_id, product_id, quantity)
  VALUES (auth.uid(), p_product_id, p_quantity)
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET 
    quantity = public.cart_items.quantity + EXCLUDED.quantity,
    updated_at = CURRENT_TIMESTAMP;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_cart(UUID, INTEGER) TO authenticated;

-- Verify the function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'update_cart'
      AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    RAISE EXCEPTION 'Function public.update_cart does not exist';
  END IF;
END
$$;

