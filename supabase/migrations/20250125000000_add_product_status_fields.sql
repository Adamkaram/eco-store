-- Add status fields to the products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;

-- Update existing products with some sample data
UPDATE products
SET 
  is_featured = CASE WHEN RANDOM() < 0.3 THEN true ELSE false END,
  is_new_arrival = CASE WHEN RANDOM() < 0.2 THEN true ELSE false END,
  is_best_seller = CASE WHEN RANDOM() < 0.1 THEN true ELSE false END;

