-- Enable Row Level Security for the orders table if not already enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;

-- Create policy to allow users to view their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to create their own orders
CREATE POLICY "Users can create their own orders" ON public.orders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow admins to view all orders
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = true
        )
    );

-- Ensure the authenticated role has the necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.orders TO authenticated;

-- Grant specific permissions on the orders table
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;

-- Verify existing policies
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'Existing policies on public.orders:';
    FOR r IN (SELECT * FROM pg_policies WHERE tablename = 'orders' AND schemaname = 'public')
    LOOP
        RAISE NOTICE '%', r;
    END LOOP;
END $$;

-- Verify permissions
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'Permissions on public.orders:';
    FOR r IN (
        SELECT grantee, privilege_type
        FROM information_schema.role_table_grants
        WHERE table_name = 'orders' AND table_schema = 'public'
    )
    LOOP
        RAISE NOTICE 'Grantee: %, Privilege: %', r.grantee, r.privilege_type;
    END LOOP;
END $$;

