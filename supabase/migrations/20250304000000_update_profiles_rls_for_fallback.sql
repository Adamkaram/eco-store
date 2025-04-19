-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure users can read their own profile (if not already present)
CREATE POLICY IF NOT EXISTS "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Ensure users can update their own profile (if not already present)
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

