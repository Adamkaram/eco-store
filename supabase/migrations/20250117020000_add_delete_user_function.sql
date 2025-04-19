CREATE OR REPLACE FUNCTION delete_user(user_password TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the ID of the current user
  current_user_id := auth.uid();
  
  -- Verify the password
  IF NOT (SELECT auth.user_id FROM auth.users WHERE id = current_user_id AND encrypted_password = crypt(user_password, encrypted_password)) THEN
    RAISE EXCEPTION 'Invalid password';
  END IF;

  -- Delete user data from custom tables
  DELETE FROM profiles WHERE id = current_user_id;
  DELETE FROM user_sessions WHERE user_id = current_user_id;
  DELETE FROM user_actions WHERE user_id = current_user_id;
  DELETE FROM orders WHERE user_id = current_user_id;
  
  -- Delete the user from auth.users
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

