-- Check if the email column exists, if not, add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Update profiles to copy email from auth.users
UPDATE profiles
SET email = au.email
FROM auth.users au
WHERE profiles.id = au.id;

-- Add a unique constraint to the email column
ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);

