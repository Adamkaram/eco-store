-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create new policies
CREATE POLICY "Users can read own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure authenticated users have the necessary permissions
GRANT ALL ON public.profiles TO authenticated;

-- Verify policies
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'Policies on public.profiles:';
    FOR r IN (SELECT * FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public')
    LOOP
        RAISE NOTICE '%', r;
    END LOOP;
END $$;

