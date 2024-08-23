/* Event Step Request Table RLS Policies */

CREATE FUNCTION fn_rls_policy_event_step_request_select(_row_id INTEGER, _event_step_id INTEGER, _profile_id INTEGER)
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

  -- Get the profile id.
  SELECT id INTO _requestor_profile_id 
  FROM profile 
  WHERE user_id = auth.uid();

  -- Get the team id associated with the step request.
  SELECT E.team_id INTO _team_id
  FROM event_step ES
  INNER JOIN event E
    ON ES.event_id = E.id
  WHERE ES.id = _event_step_id;

  IF _profile_id = _requestor_profile_id THEN
    _is_allowed := true;
  ELSE
    -- Get the roles of the requestor
    SELECT roles INTO _requestor_team_roles
    FROM relationship 
    WHERE profile_id = _requestor_profile_id
    AND team_id = _team_id;

    IF _requestor_team_roles IS NOT NULL AND ARRAY['TEAM_ADMIN', 'TEAM_OWNER', 'CLIENT', 'ADMIN']::role[] && _requestor_team_roles THEN
      _is_allowed := true;
    END IF;
  END IF;

  RETURN _is_allowed;
END;
$$;

CREATE POLICY event_step_request_select_policy ON public.event_step_request
FOR SELECT TO authenticated
USING ( 
  fn_rls_policy_event_step_request_select(id, event_step_id, profile_id) 
);

-- For INSERT
CREATE POLICY event_step_request_insert_policy ON public.event_step_request
FOR INSERT TO authenticated WITH CHECK (true);
--WITH CHECK (
--    EXISTS (
--        SELECT 1
--        FROM public.event_step AS A
--        JOIN public.event AS B
--            ON A.event_id = B.id
--        JOIN public.vw_profile AS C
--          ON B.profile_id = C.id
--        WHERE C.user_id = auth.uid()
--          AND A.id = event_step_id
--    )
--);

-- For UPDATE
CREATE POLICY event_step_request_update_policy ON public.event_step_request
FOR UPDATE TO authenticated USING(true) WITH CHECK (true);
--WITH CHECK (
--  profile_id IN (SELECT id FROM public.profile WHERE user_id = auth.uid())
--  OR
--  fn_rls_policy_event_step_request(event_step_id)
--);

/* Event Step Request History Table */

ALTER TABLE public.event_step_request ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated users
CREATE POLICY event_step_request_history_insert_policy ON history.event_step_request_history
FOR INSERT TO authenticated WITH CHECK (true);

-- Deny SELECT for the table
CREATE POLICY event_step_request_history_deny_select_policy ON history.event_step_request_history
FOR SELECT TO public USING (false);

-- Deny UPDATE and DELETE for the table for all roles
CREATE POLICY event_step_request_history_deny_update_policy
ON history.event_step_request_history FOR UPDATE TO public USING (false);

CREATE POLICY event_step_request_history_deny_delete_policy
ON history.event_step_request_history FOR DELETE TO public USING (false);

ALTER TABLE history.event_step_request_history ENABLE ROW LEVEL SECURITY;
