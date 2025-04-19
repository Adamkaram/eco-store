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

