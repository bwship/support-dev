CREATE OR REPLACE FUNCTION fn_email_registration_insert(_email TEXT)
  RETURNS void AS $$
DECLARE
    _result TEXT;
    _supabase_anon_key TEXT;
    _supabase_url TEXT;
BEGIN
  -- Check if the email already exists
  IF NOT EXISTS (SELECT 1 FROM public.email_registration WHERE email = _email) THEN
    -- If it doesn't exist, then insert
    INSERT INTO public.email_registration (email, is_approved, created_by)
    VALUES (_email, false, fn_get_authenticated_user_id());

    -- get the edge function url, and anon key
    SELECT value INTO _supabase_anon_key
    FROM public.config
    WHERE id = 'SUPABASE_ANON_KEY';

    SELECT value INTO _supabase_url
    FROM public.config
    WHERE id = 'SUPABASE_EDGE_FUNCTION_URL';

    -- call the edge function to update the third parties with this email address
    SELECT
      net.http_post(
        url:= _supabase_url || '/functions/v1/users/'
          || _email || '/update-third-parties-preregister',
        headers:= json_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || _supabase_anon_key
        )::jsonb
    ) INTO _result;
  END IF;
END;
$$ LANGUAGE plpgsql;
