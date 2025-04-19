-- Check if the column exists first
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_admin'
    ) THEN
        -- Add the is_admin column
        ALTER TABLE profiles 
        ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

        -- Create an index for better query performance
        CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
    END IF;
END $$;

