-- Add cosmetics product categories
INSERT INTO categories (name, description) VALUES
('Skincare', 'Products for skin care and maintenance'),
('Makeup', 'Cosmetic products for enhancing appearance'),
('Haircare', 'Products for hair care and styling'),
('Fragrances', 'Perfumes and colognes'),
('Bath & Body', 'Products for bathing and body care'),
('Nail Care', 'Products for nail care and decoration'),
('Tools & Accessories', 'Beauty tools and accessories'),
('Face Makeup', 'Products for facial makeup'),
('Eye Makeup', 'Products for eye makeup'),
('Lip Products', 'Lipsticks, lip glosses, and other lip products'),
('Skincare Treatments', 'Specialized skincare treatments and serums'),
('Hair Styling', 'Products for styling hair'),
('Men''s Grooming', 'Grooming products for men'),
('Natural & Organic', 'Natural and organic beauty products');

-- Fix the email column issue in the profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Update profiles to copy email from auth.users
UPDATE profiles
SET email = au.email
FROM auth.users au
WHERE profiles.id = au.id;

-- Add a unique constraint to the email column
ALTER TABLE profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);

