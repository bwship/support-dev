/* Event Table RLS Policies */
CREATE FUNCTION fn_rls_policy_event_select(row_team_id INTEGER, row_event_id INTEGER)
  RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
_user_team_id INTEGER;
_user_profile_id INTEGER;
_user_roles role[];
BEGIN
  -- get the profile id for the current user
  SELECT id INTO _user_profile_id
  FROM profile
  WHERE user_id = auth.uid();

  -- get the user's team_id and roles from the relationship table
  SELECT team_id, roles INTO _user_team_id, _user_roles 
  FROM relationship 
  WHERE profile_id = _user_profile_id;

  RETURN (
    (
      -- TEAM_OWNER and TEAM_ADMIN of the current row's team can see all events
      row_team_id = _user_team_id
      AND
      ('CLIENT' = ANY(_user_roles) OR 'TEAM_OWNER' = ANY(_user_roles) OR 'TEAM_ADMIN' = ANY(_user_roles))
    )
    OR
    (
      -- HELPER can also see events that they have been requested for
      row_team_id = _user_team_id
      AND
      EXISTS (SELECT 1
              FROM event_step AS A
              INNER JOIN event_step_request AS B
                ON A.id = B.event_step_id
              WHERE A.event_id = row_event_id
                AND profile_id = _user_profile_id
             )
    )
  );
END;
$$;

CREATE FUNCTION fn_rls_policy_event_team_owner_or_team_admin(row_team_id INTEGER)
  RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  _user_team_id INTEGER;
  _user_profile_id INTEGER;
  _user_roles role[];
BEGIN
  SELECT id INTO _user_profile_id 
  FROM profile 
  WHERE user_id = auth.uid();

  SELECT team_id, roles INTO _user_team_id, _user_roles 
  FROM relationship 
  WHERE profile_id = _user_profile_id;

  RETURN (
    -- TEAM_OWNER and TEAM_ADMIN of the current row's team can insert and update
    (
      row_team_id = _user_team_id
      AND
      ('CLIENT' = ANY(_user_roles) OR 'TEAM_OWNER' = ANY(_user_roles) OR 'TEAM_ADMIN' = ANY(_user_roles))
    )
  );
END;
$$;

-- For SELECT
CREATE POLICY event_select_policy ON public.event
FOR SELECT TO authenticated USING(fn_rls_policy_event_select(team_id, id));

-- For INSERT
CREATE POLICY event_insert_policy ON public.event
FOR INSERT TO authenticated
WITH CHECK (fn_rls_policy_event_team_owner_or_team_admin(team_id));

-- For UPDATE
CREATE POLICY event_update_policy ON public.event
FOR UPDATE TO authenticated USING(true)
WITH CHECK (fn_rls_policy_event_team_owner_or_team_admin(team_id));

ALTER TABLE public.event ENABLE ROW LEVEL SECURITY;

/* Event History Table */

-- Allow inserts from authenticated users
CREATE POLICY event_history_insert_policy ON history.event_history
FOR INSERT TO authenticated WITH CHECK (true);

-- Deny SELECT for the table
CREATE POLICY event_history_deny_select_policy ON history.event_history
FOR SELECT TO public USING (false);

-- Deny UPDATE and DELETE for the table for all roles
CREATE POLICY event_history_deny_update_policy
ON history.event_history FOR UPDATE TO public USING (false);

CREATE POLICY event_history_deny_delete_policy
ON history.event_history FOR DELETE TO public USING (false);

ALTER TABLE history.event_step_history ENABLE ROW LEVEL SECURITY;

