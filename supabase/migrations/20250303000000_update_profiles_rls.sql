-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow the create-profile function to insert new profiles
CREATE POLICY "create-profile function can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- If you want to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

