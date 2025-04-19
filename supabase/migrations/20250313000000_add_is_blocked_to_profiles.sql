-- Add is_blocked column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON profiles(is_blocked);

-- Update existing profiles to set is_blocked to false
UPDATE profiles
SET is_blocked = FALSE
WHERE is_blocked IS NULL;

