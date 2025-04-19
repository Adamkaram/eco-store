-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add category_id to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP WITH TIME ZONE,
  duration INTERVAL
);

-- Create user_actions table
CREATE TABLE IF NOT EXISTS user_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  action_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create cart table
CREATE TABLE IF NOT EXISTS cart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- Add function to update cart
CREATE OR REPLACE FUNCTION update_cart(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO cart (user_id, product_id, quantity)
  VALUES (p_user_id, p_product_id, p_quantity)
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET quantity = cart.quantity + p_quantity, updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Add function to log user actions
CREATE OR REPLACE FUNCTION log_user_action(
  p_user_id UUID,
  p_action_type TEXT,
  p_action_details JSONB
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_actions (user_id, action_type, action_details)
  VALUES (p_user_id, p_action_type, p_action_details);
END;
$$ LANGUAGE plpgsql;

