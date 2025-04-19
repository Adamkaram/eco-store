-- Ensure authenticated users can insert their own profile
CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure users can read their own profile
CREATE POLICY IF NOT EXISTS "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Ensure users can update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Grant necessary permissions to the authenticated role
GRANT ALL ON public.profiles TO authenticated;

