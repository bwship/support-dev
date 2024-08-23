
CREATE OR REPLACE FUNCTION fn_user_copy()
  RETURNS TRIGGER AS $$
DECLARE
    _supabase_anon_key TEXT;
    _supabase_url TEXT;
    _result TEXT;
    _user_id UUID;
BEGIN
  INSERT INTO public.user (id, email, phone, phone_change, email_confirmed_at, phone_confirmed_at)
  VALUES (NEW.id, NEW.email, NEW.phone, NEW.phone_change, NEW.email_confirmed_at, NEW.phone_confirmed_at)
  ON CONFLICT (id) -- Assuming "id" is the primary key or a unique constraint
  DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    phone_change = EXCLUDED.phone_change,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    phone_confirmed_at = EXCLUDED.phone_confirmed_at
  RETURNING id INTO _user_id;

  -- get the edge function url, and anon key
  SELECT value INTO _supabase_anon_key
  FROM public.config
  WHERE id = 'SUPABASE_ANON_KEY';

  SELECT value INTO _supabase_url
  FROM public.config
  WHERE id = 'SUPABASE_EDGE_FUNCTION_URL';

  -- call the edge function to update the third parties
  SELECT
    net.http_post(
      url:= _supabase_url || '/functions/v1/users/'
        || CAST(_user_id AS TEXT) || '/update-third-parties',
      headers:= json_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || _supabase_anon_key
      )::jsonb
  ) INTO _result;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql security definer;

CREATE OR REPLACE FUNCTION fn_profile_and_relationship_upsert (
  _user_id UUID DEFAULT NULL,
  _parent_profile_id INTEGER DEFAULT NULL,
  _id INTEGER DEFAULT NULL,
  _profile_attributes JSONB DEFAULT NULL,
  _relationship_attributes JSONB DEFAULT NULL,
  _first_name TEXT DEFAULT NULL,
  _last_name TEXT DEFAULT NULL,
  _profile_url TEXT DEFAULT NULL,
  _roles role[] DEFAULT NULL,
  _team_id INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    _new_profile_id INTEGER;
    _relationship_id INTEGER;
    _result TEXT;
    _supabase_anon_key TEXT;
    _supabase_url TEXT;
BEGIN
    IF _id IS NOT NULL THEN
      UPDATE public.profile
      SET attributes = _profile_attributes,
        first_name = _first_name,
        last_name = _last_name,
        profile_url = _profile_url,
        user_id = _user_id,
        updated_by = fn_get_authenticated_user_id(),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = _id;

      -- only insert a relationship record if a parent profileId is passed in,
      -- otherwise someone is just updating their own profile
      IF _parent_profile_id IS NOT NULL THEN
        UPDATE public.relationship
        SET attributes = _relationship_attributes, 
          roles = _roles,
          updated_by = fn_get_authenticated_user_id(),
          updated_at = CURRENT_TIMESTAMP
        WHERE profile_id = _id
          AND parent_profile_id = _parent_profile_id;
      END IF;

      -- Set _new_id to _id to return back
      _new_profile_id := _id;
    ELSE
      INSERT INTO public.profile(id, user_id, attributes, first_name,
        last_name, profile_url, created_by)
      VALUES(
        COALESCE(_id, nextval('profile_id_seq')),
        _user_id,
        _profile_attributes,
        _first_name,
        _last_name,
        _profile_url,
        fn_get_authenticated_user_id()
      )
      RETURNING id INTO _new_profile_id;

      -- if this is a TEAM OWNER and they don't have a team, create one
      IF 'TEAM_OWNER' = ANY(_roles) AND _team_id IS NULL THEN
        INSERT INTO public.team (name, created_by)
        VALUES (COALESCE(_first_name, '') || '’s Team', fn_get_authenticated_user_id())
        RETURNING id INTO _team_id;
      END IF;

      INSERT INTO public.relationship (profile_id, parent_profile_id,
        attributes, team_id, roles, created_by)
      VALUES (
        _new_profile_id,
        COALESCE(_parent_profile_id, _new_profile_id),
        _relationship_attributes,
        _team_id,
        _roles,
        fn_get_authenticated_user_id()
      );
    END IF;

    -- if the user_id is not null, then we need to update the third parties
    if _user_id IS NOT NULL THEN
      -- get the edge function url, and anon key
      SELECT value INTO _supabase_anon_key
      FROM public.config
      WHERE id = 'SUPABASE_ANON_KEY';

      SELECT value INTO _supabase_url
      FROM public.config
      WHERE id = 'SUPABASE_EDGE_FUNCTION_URL';

      -- call the edge function to update the third parties
      SELECT
        net.http_post(
          url:= _supabase_url || '/functions/v1/users/'
            || CAST(_user_id AS TEXT) || '/update-third-parties',
          headers:= json_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || _supabase_anon_key
          )::jsonb
      ) INTO _result;
    END IF;

    -- Return the profile id
    RETURN _new_profile_id;
END;
$$ LANGUAGE plpgsql;
