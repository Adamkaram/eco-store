-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Create a function to get top selling products
CREATE OR REPLACE FUNCTION get_top_selling_products()
RETURNS TABLE (
  id UUID,
  name TEXT,
  total_sold BIGINT,
  total_revenue DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    COALESCE(SUM(oi.quantity), 0) as total_sold,
    COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue
  FROM 
    products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
  GROUP BY 
    p.id, p.name
  ORDER BY 
    total_sold DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get revenue over time
CREATE OR REPLACE FUNCTION get_revenue_over_time(start_date DATE, end_date DATE)
RETURNS TABLE (date DATE, revenue DECIMAL(10, 2)) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(o.created_at) as date,
    SUM(o.total_amount) as revenue
  FROM 
    orders o
  WHERE 
    o.created_at BETWEEN start_date AND end_date
  GROUP BY 
    DATE(o.created_at)
  ORDER BY 
    DATE(o.created_at);
END;
$$ LANGUAGE plpgsql;

-- Create a function to get customer growth
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

