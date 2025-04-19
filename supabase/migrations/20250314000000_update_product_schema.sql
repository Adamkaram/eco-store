-- Modify the products table to add additional_image_urls column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS additional_image_urls TEXT[] DEFAULT NULL;

-- Make image_url NOT NULL
ALTER TABLE products
ALTER COLUMN image_url SET NOT NULL;

-- Add a check constraint to ensure additional_image_urls is always an array when not null
ALTER TABLE products
ADD CONSTRAINT additional_image_urls_is_array
CHECK (additional_image_urls IS NULL OR jsonb_typeof(to_jsonb(additional_image_urls)) = 'array');

-- Create an index on the additional_image_urls column for better query performance
CREATE INDEX IF NOT EXISTS idx_products_additional_image_urls ON products USING gin(additional_image_urls);

-- Drop the previous trigger if it exists
DROP TRIGGER IF EXISTS ensure_product_has_image ON products;
DROP FUNCTION IF EXISTS check_product_images();

-- Create a new trigger to ensure image_url is not null
CREATE OR REPLACE FUNCTION check_product_image_url()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.image_url IS NULL THEN
    RAISE EXCEPTION 'A product must have a main image (image_url cannot be null)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_product_has_main_image
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION check_product_image_url();

