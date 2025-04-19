-- Disable row level security to allow dropping tables
ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cart_items DISABLE ROW LEVEL SECURITY;

-- Drop all tables in public schema
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_cart(UUID, UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS public.get_top_selling_products() CASCADE;
DROP FUNCTION IF EXISTS public.get_revenue_over_time(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS public.get_customer_growth(DATE, DATE) CASCADE;

-- Drop auth schema (this will also drop auth.users table)
DROP SCHEMA IF EXISTS auth CASCADE;

-- Recreate necessary schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS public;

-- Reset the search_path
ALTER DATABASE postgres SET search_path TO public;

-- Note: After running this script, you should immediately run the new migration
-- script to set up the database structure again.

