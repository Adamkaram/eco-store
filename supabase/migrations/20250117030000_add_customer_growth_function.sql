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

