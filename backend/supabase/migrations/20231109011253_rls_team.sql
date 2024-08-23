
/* Team Table RLS Policies */

CREATE FUNCTION fn_rls_policy_is_team_accessible(_requested_team_id INTEGER)
  RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    _user_profile_id INTEGER;
    _user_team_id INTEGER;
    _requested_profile_team_id INTEGER;
BEGIN
    -- Get the profile_id for the current user
    SELECT id INTO _user_profile_id
    FROM profile
    WHERE user_id = auth.uid();

    -- Get the team_id for the current user's profile
    SELECT team_id INTO _user_team_id
    FROM relationship
    WHERE profile_id = _user_profile_id;

    -- Check if the user's team is the same as the requested team id
    IF _user_team_id IS NULL THEN
        -- User does not belong to any team yet
        RETURN TRUE;
    ELSE
        RETURN (_user_team_id = _requested_team_id);
    END IF;
END;
$$;

CREATE POLICY team_select_policy ON public.team
  FOR SELECT TO authenticated
  USING (
    fn_rls_policy_is_team_accessible( id )
  );

-- For INSERT
CREATE POLICY team_insert_policy ON public.team
FOR INSERT TO authenticated WITH CHECK (true);

-- For UPDATE
CREATE POLICY team_update_policy ON public.team
FOR UPDATE TO authenticated WITH CHECK (true);

ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;

/* Team History Table */

-- Allow inserts from authenticated users
CREATE POLICY team_history_insert_policy ON history.team_history
FOR INSERT TO authenticated WITH CHECK (true);

-- Deny SELECT for the table
CREATE POLICY team_history_deny_select_policy ON history.team_history
FOR SELECT TO public USING (false);

-- Deny UPDATE and DELETE for the table for all roles
CREATE POLICY team_history_deny_update_policy
ON history.team_history FOR UPDATE TO public USING (false);

CREATE POLICY team_history_deny_delete_policy
ON history.team_history FOR DELETE TO public USING (false);

ALTER TABLE history.team_history ENABLE ROW LEVEL SECURITY;
