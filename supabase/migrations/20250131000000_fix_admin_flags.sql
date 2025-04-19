-- Update auth.users table
UPDATE auth.users 
SET 
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
  ),
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{is_admin}',
    'true'
  ),
  is_super_admin = true
WHERE email = 'ahmadkarm432@gmail.com';

-- Update profiles table
UPDATE profiles 
SET 
  is_admin = true,
  role = 'admin'
WHERE email = 'ahmadkarm432@gmail.com';

-- Add role column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

