
CREATE OR REPLACE FUNCTION fn_rls_policy_is_subitem_accessible(requested_profile_id INTEGER)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER 
AS $$
DECLARE
  _user_profile_id INTEGER;
  _user_team_id INTEGER;
  _requested_profile_team_id INTEGER;
  _user_roles role[];
  _is_allowed BOOLEAN := false;
BEGIN
  -- First check is to see if the requested_profile_id matches the authenticated user's profile_id.
  -- If it's a match then the user is requesting his own data.
  SELECT id INTO _user_profile_id
  FROM profile
  WHERE user_id = auth.uid();

  IF requested_profile_id = _user_profile_id THEN
    -- Set true if the requested_profile_id matches the user's own profile_id.
    _is_allowed := true;
  ELSE
    -- first check if this is ad ADMIN, in which case we let them through
    SELECT roles INTO _user_roles 
    FROM relationship 
    WHERE profile_id = _user_profile_id;

    -- Set true if there is at least one common element between the two arrays.
    _is_allowed := ARRAY['ADMIN']::role[] && _user_roles;

    IF _is_allowed THEN
      RETURN _is_allowed;
    END IF;

    -- otherwise Profile Id's don't match and the user requesting is NOT an ADMIN,
    -- so check to see if they are on the same team.
    -- Get the team_id for the authenticated user's profile
    SELECT team_id INTO _user_team_id
    FROM relationship
    WHERE profile_id = _user_profile_id;

    -- Get the team_id for the requested profile
    SELECT team_id INTO _requested_profile_team_id
    FROM relationship
    WHERE profile_id = requested_profile_id;

    -- Are they on the same team?
    IF _user_team_id = _requested_profile_team_id THEN
      -- Now check if the user has the correct role(s) to view the data.
      SELECT roles INTO _user_roles 
      FROM relationship 
      WHERE profile_id = _user_profile_id;

      -- Set true if there is at least one common element between the two arrays.
      _is_allowed := ARRAY['HELPER', 'TEAM_ADMIN', 'TEAM_OWNER', 'CLIENT', 'ADMIN']::role[] && _user_roles;
    ELSE
      _is_allowed := false;
    END IF;
  END IF;

  RETURN _is_allowed;
END;
$$;
