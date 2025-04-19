-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;

-- Create a new policy that allows authenticated users to insert their own orders
CREATE POLICY "Users can create their own orders" ON public.orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure the authenticated role has the necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.orders TO authenticated;

-- Verify existing policies
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE 'Existing policies on public.orders:';
  FOR r IN (SELECT * FROM pg_policies WHERE tablename = 'orders' AND schemaname = 'public')
  LOOP
      RAISE NOTICE '%', r;
  END LOOP;
END $$;

