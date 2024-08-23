/* Profile Table RLS Policies */
CREATE FUNCTION fn_rls_policy_is_profile_accessible(profile_id_to_check INTEGER)
  RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    _team_id INTEGER;
BEGIN
    -- Get the team_id for the current user
    SELECT A.team_id INTO _team_id
    FROM relationship AS A
    WHERE profile_id = profile_id_to_check;

    -- Check if the profile being accessed is part of the same team
    RETURN EXISTS (
        SELECT 1
        FROM relationship AS A
        WHERE A.profile_id = profile_id_to_check
          AND A.team_id = _team_id
    );
END;
$$;

CREATE FUNCTION fn_rls_policy_can_insert(row_user_id UUID)
  RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    _user_roles role[];
    _user_profile_id INTEGER;
    _user_id UUID;
    _is_allowed BOOLEAN := false;
BEGIN
    SELECT auth.uid() INTO _user_id;
    -- Get the profile_id for the current user
    SELECT vwp.id INTO _user_profile_id
    FROM vw_profile as vwp
    WHERE vwp.user_id = auth.uid();

    -- Get the team_id and roles for the current user
    SELECT A.roles INTO _user_roles
    FROM relationship AS A
    WHERE profile_id = _user_profile_id;
    
    -- On inserts we can't get the user's roles for the new profile
    -- This should be evaluated when we support multiple teams per user
    IF row_user_id = _user_id THEN
      -- Creating a profile for oneself
      IF _user_profile_id IS NULL THEN
        _is_allowed = true;
      ELSE 
        _is_allowed := ARRAY['TEAM_ADMIN', 'TEAM_OWNER', 'CLIENT', 'HELPER']::role[] && _user_roles;
      END IF;
    ELSE
      -- Creating a profile for others
      _is_allowed := ARRAY['TEAM_ADMIN', 'TEAM_OWNER', 'CLIENT']::role[] && _user_roles;
    END IF;

    RETURN _is_allowed;
END;
$$;

CREATE FUNCTION fn_rls_policy_can_update(row_profile_id INTEGER)
  RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    _user_team_id INTEGER;
    _user_profile_id INTEGER;
    _user_roles role[];
    _profile_team_id INTEGER;
    _is_allowed BOOLEAN := false;
BEGIN
    -- Get the profile_id for the current user
    SELECT vwp.id INTO _user_profile_id
    FROM vw_profile as vwp
    WHERE vwp.user_id = auth.uid();

    -- Get the team_id and roles for the current user
    SELECT A.team_id, A.roles INTO _user_team_id, _user_roles
    FROM relationship AS A
    WHERE profile_id = _user_profile_id;

    -- Get the team id for the profile being updated
    SELECT r.team_id INTO _profile_team_id
    FROM relationship AS r
    WHERE profile_id = row_profile_id;
    
    IF _user_profile_id = row_profile_id THEN
      -- If the user profile and the profile to update are the same then 
      -- attempting to update your own profile
      _is_allowed := true;
    ELSIF _profile_team_id = _user_team_id THEN
    -- if the profile being accessed is part of the same team and correct role
      _is_allowed := ARRAY['TEAM_ADMIN', 'TEAM_OWNER', 'CLIENT']::role[] && _user_roles;
    ELSE
      _is_allowed := false;
    END IF;  

    RETURN _is_allowed;
END;
$$;

CREATE POLICY profile_select_policy ON public.profile
FOR SELECT TO authenticated
USING (user_id = auth.uid()
       OR created_by = auth.uid()
       OR fn_rls_policy_is_profile_accessible(id));

CREATE POLICY profile_insert_policy ON public.profile
FOR INSERT TO authenticated WITH CHECK(fn_rls_policy_can_insert(user_id));

CREATE POLICY profile_update_policy ON public.profile
FOR UPDATE TO authenticated
USING (fn_rls_policy_can_update(id));

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated users
CREATE POLICY profile_history_insert_policy ON history.profile_history
FOR INSERT TO authenticated WITH CHECK (true);

-- Deny SELECT for the table
CREATE POLICY profile_history_deny_select_policy ON history.profile_history
FOR SELECT TO public USING (false);

-- Deny UPDATE and DELETE for the table for all roles
CREATE POLICY profile_history_deny_update_policy
ON history.profile_history FOR UPDATE TO public USING (false);

CREATE POLICY profile_history_deny_delete_policy
ON history.profile_history FOR DELETE TO public USING (false);

ALTER TABLE history.profile_history ENABLE ROW LEVEL SECURITY;
