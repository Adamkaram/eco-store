-- Update the products table to ensure it can handle all necessary fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS main_image_url TEXT,
ADD COLUMN IF NOT EXISTS additional_image_urls TEXT[];

-- Ensure the categories table exists and has the necessary fields
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- Add a foreign key constraint to the products table for category_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'products_category_id_fkey'
  ) THEN
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS category_id UUID,
    ADD CONSTRAINT products_category_id_fkey
    FOREIGN KEY (category_id)
    REFERENCES categories(id);
  END IF;
END $$;

-- Ensure the image_url and category columns exist
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS category text;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0;

-- Seed admin user (password will be set through auth signup)
INSERT INTO profiles (id, email, full_name, is_admin)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@glowbeauty.com',
  'Admin User',
  true
);

-- Seed products
INSERT INTO products (name, description, price, stock, category, image_url) VALUES
('Hydrating Serum', 'Advanced hydrating formula with hyaluronic acid', 49.99, 100, 'Skincare', 'https://images.unsplash.com/photo-1570179538662-31547dbe9846?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
('Matte Lipstick', 'Long-lasting matte finish lipstick', 24.99, 150, 'Makeup', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
('Rose Perfume', 'Elegant rose fragrance with lasting notes', 89.99, 50, 'Fragrances', 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
('Anti-Aging Cream', 'Advanced formula with retinol', 79.99, 75, 'Skincare', 'https://images.unsplash.com/photo-1570179538662-31547dbe9846?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
('Volumizing Mascara', 'Dramatic volume and length', 29.99, 200, 'Makeup', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
('Citrus Fresh Perfume', 'Refreshing citrus blend', 69.99, 60, 'Fragrances', 'https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80');

