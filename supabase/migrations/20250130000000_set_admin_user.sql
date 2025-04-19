-- First ensure the is_admin column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update the specific user to be an admin
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'ahmadkarm432@gmail.com';

-- Create index for better query performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Verify the update
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = 'ahmadkarm432@gmail.com' 
    AND is_admin = TRUE
  ) THEN
    RAISE NOTICE 'Failed to set admin privileges for ahmadkarm432@gmail.com';
  END IF;
END $$;

