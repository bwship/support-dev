/* Event Step Table */

/* Event Step Table RLS Policies */
CREATE OR REPLACE FUNCTION fn_rls_policy_event_step_select(_row_id INTEGER, _event_id INTEGER)
  RETURNS BOOLEAN
  LANGUAGE plpgsql
  SECURITY DEFINER 
AS $$
DECLARE
  _requestor_profile_id INTEGER;
  _requestor_team_roles role[];
  _team_id INTEGER;
  _is_allowed BOOLEAN := false;
BEGIN

  -- Note: The requestor may be a Team Admin/Owner/Client and therefore
  --       may not be assigned to the step but still has access.

  -- Get the profile id.
  SELECT id INTO _requestor_profile_id 
  FROM profile 
  WHERE user_id = auth.uid();

  -- Get the team id associated with the step.
  SELECT E.team_id INTO _team_id
  FROM event E
  WHERE E.id = _event_id;

  -- Get the roles of the requestor
  SELECT roles INTO _requestor_team_roles
  FROM relationship 
  WHERE profile_id = _requestor_profile_id
  AND team_id = _team_id;

  -- Perform validation.
  IF _requestor_team_roles IS NOT NULL AND ARRAY['TEAM_ADMIN', 'TEAM_OWNER', 'CLIENT', 'ADMIN']::role[] && _requestor_team_roles THEN
    -- 1: Check to see if the requestor's role is the Team Admin/Owner/Client.
    --    If the requestor has the right role then access is allowed.
    _is_allowed := true;
  ELSE
    -- 2: Check that the requestor is assigned to the step.
    --    If the requestor is assigned to the step then access is allowed.
    IF _requestor_team_roles IS NOT NULL AND ARRAY['HELPER']::role[] && _requestor_team_roles THEN
      SELECT 1 INTO _is_allowed
      FROM event_step_request
      WHERE profile_id = _requestor_profile_id
      AND event_step_id = _row_id;
    END IF;
  END IF;

  RETURN _is_allowed;
END;
$$;

CREATE POLICY event_step_select_policy ON public.event_step
FOR SELECT TO authenticated USING (fn_rls_policy_event_step_select(id, event_id));

-- For INSERT
CREATE OR REPLACE FUNCTION fn_rls_event_step_insert_policy(row_event_id INTEGER)
  RETURNS boolean
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
DECLARE
  _requestor_profile_id INTEGER;
  _requestor_team_roles role[];
  _team_id INTEGER;
  _is_allowed BOOLEAN := false;
BEGIN
  -- Note: The requestor may be a Team Admin/Owner/Client and therefore
  --       may not be assigned to the step but still has access.

  -- Temp code
  -- SET LOCAL "user_id" = "93a84b4a-8591-4c8c-9663-c321e75c386f";  -- TEAM_ADMIN
  -- Get the profile id.
  SELECT id INTO _requestor_profile_id 
  FROM profile 
  WHERE user_id = auth.uid();

  -- Get the team id associated with the step.
  SELECT E.team_id INTO _team_id
  FROM event E
  WHERE E.id = row_event_id;

  -- Get the roles of the requestor
  SELECT roles INTO _requestor_team_roles
  FROM relationship 
  WHERE profile_id = _requestor_profile_id
  AND team_id = _team_id;

  -- Perform validation.
  IF _requestor_team_roles IS NOT NULL AND ARRAY['TEAM_ADMIN', 'TEAM_OWNER', 'CLIENT']::role[] && _requestor_team_roles THEN
    -- 1: Check to see if the requestor's role is the Team Admin/Owner/Client.
    --    If the requestor has the right role then access is allowed.
    _is_allowed := true;
  ELSE
    _is_allowed := false;
  END IF;

  RETURN _is_allowed;
END;
$$;

CREATE POLICY event_step_insert_policy ON public.event_step
FOR INSERT TO authenticated WITH CHECK (fn_rls_event_step_insert_policy(event_id));

-- For UPDATE
CREATE OR REPLACE FUNCTION fn_rls_event_step_update_policy(row_id INTEGER)
  RETURNS boolean
  LANGUAGE plpgsql
  AS $$
DECLARE
  _requestor_profile_id INTEGER;
  _requestor_team_roles role[];
  _team_id INTEGER;
  _is_allowed BOOLEAN := false;
BEGIN
  -- Note: The requestor may be a Team Admin/Owner/Client and therefore
  --       may not be assigned to the step but still has access.

  -- Get the profile id.
  SELECT id INTO _requestor_profile_id 
  FROM profile 
  WHERE user_id = auth.uid();

  -- Get the team id associated with the step.
  SELECT E.team_id INTO _team_id
  FROM event_step ES
  INNER JOIN event E
    ON ES.event_id = E.id
  WHERE ES.id = row_id;

  -- Get the roles of the requestor
  SELECT roles INTO _requestor_team_roles
  FROM relationship 
  WHERE profile_id = _requestor_profile_id
  AND team_id = _team_id;

  -- Perform validation.
  IF _requestor_team_roles IS NOT NULL AND ARRAY['TEAM_ADMIN', 'TEAM_OWNER', 'CLIENT']::role[] && _requestor_team_roles THEN
    -- 1: Check to see if the requestor's role is the Team Admin/Owner/Client.
    --    If the requestor has the right role then access is allowed.
    _is_allowed := true;
  ELSE
    -- 2: Check that the requestor is assigned to the step.
    --    If the requestor is assigned to the step then access is allowed.
    IF _requestor_team_roles IS NOT NULL AND ARRAY['HELPER']::role[] && _requestor_team_roles THEN
      SELECT true INTO _is_allowed
      FROM event_step_request
      WHERE profile_id = _requestor_profile_id
      AND event_step_id = row_id;
    END IF;
  END IF;

  RETURN _is_allowed;
END;
$$;

/* 
CREATE POLICY event_step_update_policy ON public.event_step
FOR UPDATE TO authenticated USING(true) --- WITH CHECK(true);
WITH CHECK (fn_rls_event_step_update_policy(id)); */

CREATE POLICY event_step_update_policy ON public.event_step
FOR UPDATE TO authenticated USING (fn_rls_event_step_update_policy(id))
WITH CHECK (fn_rls_event_step_insert_policy(event_id));

ALTER TABLE public.event_step ENABLE ROW LEVEL SECURITY;

/* Event Step History Table */

-- Allow inserts from authenticated users
CREATE POLICY event_step_history_insert_policy ON history.event_step_history
FOR INSERT TO authenticated WITH CHECK (true);

-- Deny SELECT for the table
CREATE POLICY event_step_history_deny_select_policy ON history.event_step_history
FOR SELECT TO public USING (false);

-- Deny UPDATE and DELETE for the table for all roles
CREATE POLICY event_step_history_deny_update_policy
ON history.event_step_history FOR UPDATE TO public USING (false);

CREATE POLICY event_step_history_deny_delete_policy
ON history.event_step_history FOR DELETE TO public USING (false);

ALTER TABLE history.event_step_history ENABLE ROW LEVEL SECURITY;

