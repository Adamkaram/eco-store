-- Drop the existing function
DROP FUNCTION IF EXISTS get_customer_growth(DATE, DATE);

-- Create the updated function
CREATE OR REPLACE FUNCTION get_customer_growth(start_date DATE, end_date DATE)
RETURNS TABLE (date DATE, new_customers BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at) as date,
    COUNT(*) as new_customers
  FROM 
    profiles
  WHERE 
    created_at BETWEEN start_date AND end_date
  GROUP BY 
    DATE(created_at)
  ORDER BY 
    DATE(created_at);
END;
$$ LANGUAGE plpgsql;

-- Create an admin role if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
    CREATE ROLE admin;
  END IF;
END
$$;

-- Grant the admin role to users with is_admin = true
CREATE OR REPLACE FUNCTION grant_admin_role() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_admin THEN
    EXECUTE format('GRANT admin TO %I', NEW.id);
  ELSE
    EXECUTE format('REVOKE admin FROM %I', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically grant/revoke admin role
CREATE TRIGGER grant_admin_role_trigger
AFTER INSERT OR UPDATE OF is_admin ON profiles
FOR EACH ROW
EXECUTE FUNCTION grant_admin_role();

-- Grant execute permission to admin role only
GRANT EXECUTE ON FUNCTION get_customer_growth(DATE, DATE) TO admin;

