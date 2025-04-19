-- Add is_admin column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Update existing admin user (replace with actual admin user ID)
UPDATE profiles SET is_admin = TRUE WHERE id = '00000000-0000-0000-0000-000000000000';

