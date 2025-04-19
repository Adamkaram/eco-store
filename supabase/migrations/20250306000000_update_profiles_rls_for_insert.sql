-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "create-profile function can insert profiles" ON public.profiles;

-- Create a new policy that allows authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure the authenticated role has the necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Verify existing policies
DO $$
DECLARE
  r RECORD;
BEGIN
  RAISE NOTICE 'Existing policies on public.profiles:';
  FOR r IN (SELECT * FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
  LOOP
      RAISE NOTICE '%', r;
  END LOOP;
END $$;

