-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Create users table
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    encrypted_password TEXT,
    email_confirmed_at TIMESTAMP WITH TIME ZONE,
    invited_at TIMESTAMP WITH TIME ZONE,
    confirmation_token TEXT,
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    recovery_token TEXT,
    recovery_sent_at TIMESTAMP WITH TIME ZONE,
    email_change_token_new TEXT,
    email_change TEXT,
    email_change_sent_at TIMESTAMP WITH TIME ZONE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    raw_app_meta_data JSONB,
    raw_user_meta_data JSONB,
    is_super_admin BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    phone TEXT UNIQUE,
    phone_confirmed_at TIMESTAMP WITH TIME ZONE,
    phone_change TEXT,
    phone_change_token TEXT,
    phone_change_sent_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    email_change_token_current TEXT,
    email_change_confirm_status SMALLINT,
    banned_until TIMESTAMP WITH TIME ZONE,
    reauthentication_token TEXT,
    reauthentication_sent_at TIMESTAMP WITH TIME ZONE,
    is_sso_user BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Create trigger to create a profile when a new user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category TEXT NOT NULL,
    image_url TEXT,
    main_image_url TEXT,
    additional_image_urls TEXT[],
    is_featured BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    category_id UUID
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key to products table for category
ALTER TABLE public.products
ADD CONSTRAINT fk_products_categories FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    customer_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Enable RLS for all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Products are insertable by admins" 
ON public.products FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
));

CREATE POLICY "Products are updatable by admins" 
ON public.products FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
));

-- Create policies for orders
CREATE POLICY "Users can view their own orders" 
ON public.orders FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.orders FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" 
ON public.orders FOR SELECT 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
));

-- Create policies for order items
CREATE POLICY "Users can view their own order items" 
ON public.order_items FOR SELECT 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
));

CREATE POLICY "Users can create their own order items" 
ON public.order_items FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
));

-- Create policies for cart items
CREATE POLICY "Users can view their own cart items" 
ON public.cart_items FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" 
ON public.cart_items FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" 
ON public.cart_items FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" 
ON public.cart_items FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- Create function to update cart
CREATE OR REPLACE FUNCTION public.update_cart(
    p_user_id UUID,
    p_product_id UUID,
    p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.cart_items (user_id, product_id, quantity)
    VALUES (p_user_id, p_product_id, p_quantity)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET 
        quantity = cart_items.quantity + p_quantity,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_cart TO authenticated;

-- Create function to get top selling products
CREATE OR REPLACE FUNCTION get_top_selling_products()
RETURNS TABLE (
    id UUID,
    name TEXT,
    total_sold BIGINT,
    total_revenue NUMERIC(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        COALESCE(SUM(oi.quantity), 0)::BIGINT as total_sold,
        COALESCE(SUM(oi.quantity * oi.price), 0)::NUMERIC(10, 2) as total_revenue
    FROM 
        public.products p
        LEFT JOIN public.order_items oi ON p.id = oi.product_id
    GROUP BY 
        p.id, p.name
    ORDER BY 
        total_sold DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Create function to get revenue over time
CREATE OR REPLACE FUNCTION get_revenue_over_time(start_date DATE, end_date DATE)
RETURNS TABLE (date DATE, revenue DECIMAL(10, 2)) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(o.created_at) as date,
        SUM(o.total_amount) as revenue
    FROM 
        public.orders o
    WHERE 
        o.created_at BETWEEN start_date AND end_date
    GROUP BY 
        DATE(o.created_at)
    ORDER BY 
        DATE(o.created_at);
END;
$$ LANGUAGE plpgsql;

-- Create function to get customer growth
CREATE OR REPLACE FUNCTION get_customer_growth(start_date DATE, end_date DATE)
RETURNS TABLE (date DATE, new_customers BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_customers
    FROM 
        auth.users
    WHERE 
        created_at BETWEEN start_date AND end_date
    GROUP BY 
        DATE(created_at)
    ORDER BY 
        DATE(created_at);
END;
$$ LANGUAGE plpgsql;

-- Set up admin user (replace with actual admin user email)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@glowbeauty.com') THEN
        INSERT INTO auth.users (email, encrypted_password, created_at)
        VALUES ('admin@glowbeauty.com', 'hashed_password', NOW());
    END IF;
END $$;

-- Insert admin profile
INSERT INTO public.profiles (id, email, full_name, is_admin, role)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@glowbeauty.com'),
    'admin@glowbeauty.com',
    'Admin User',
    true,
    'admin'
) ON CONFLICT (id) DO UPDATE
SET is_admin = true, role = 'admin';

-- Seed some initial product categories
INSERT INTO public.categories (name, description) VALUES
('Skincare', 'Products for skin care and maintenance'),
('Makeup', 'Cosmetic products for enhancing appearance'),
('Haircare', 'Products for hair care and styling'),
('Fragrances', 'Perfumes and colognes'),
('Bath & Body', 'Products for bathing and body care')
ON CONFLICT (name) DO NOTHING;

-- Seed some initial products
INSERT INTO public.products (name, description, price, stock, category, category_id, image_url, main_image_url, additional_image_urls)
SELECT
    'Hydrating Serum',
    'Advanced hydrating formula with hyaluronic acid',
    49.99,
    100,
    'Skincare',
    (SELECT id FROM categories WHERE name = 'Skincare'),
    $$https://images.unsplash.com/photo-1570179538662-31547dbe9846?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80$$,
    $$https://images.unsplash.com/photo-1570179538662-31547dbe9846?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80$$,
    ARRAY[$$https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80$$]
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Hydrating Serum');

INSERT INTO public.products (name, description, price, stock, category, category_id, image_url, main_image_url, additional_image_urls)
SELECT
    'Matte Lipstick',
    'Long-lasting matte finish lipstick',
    24.99,
    150,
    'Makeup',
    (SELECT id FROM categories WHERE name = 'Makeup'),
    $$https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80$$,
    $$https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80$$,
    ARRAY[$$https://images.unsplash.com/photo-1570179538662-31547dbe9846?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80$$]
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Matte Lipstick');

INSERT INTO public.products (name, description, price, stock, category, category_id, image_url, main_image_url, additional_image_urls)
SELECT
    'Rose Perfume',
    'Elegant rose fragrance with lasting notes',
    89.99,
    50,
    'Fragrances',
    (SELECT id FROM categories WHERE name = 'Fragrances'),
    $$https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80$$,
    $$https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80$$,
    ARRAY[$$https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80$$]
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Rose Perfume');

