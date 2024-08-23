/* Profile Location Table */

CREATE POLICY profile_location_select_policy ON public.profile_location
FOR SELECT TO authenticated 
    USING (fn_rls_policy_is_subitem_accessible(profile_id));

-- For INSERT
CREATE POLICY profile_location_insert_policy ON public.profile_location
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profile AS A
        WHERE A.id = profile_id
          AND A.user_id = auth.uid()
    )
);

-- For UPDATE
CREATE POLICY profile_location_update_policy ON public.profile_location
FOR UPDATE TO authenticated
USING (true)
WITH CHECK ( 
    EXISTS (
        SELECT 1
        FROM public.profile AS A
        WHERE A.id = profile_id
          AND A.user_id = auth.uid()
    )
);

ALTER TABLE public.profile_location ENABLE ROW LEVEL SECURITY;

/* Profile Location History Table */

-- Allow inserts from authenticated users
CREATE POLICY profile_location_history_insert_policy ON history.profile_location_history
FOR INSERT TO authenticated WITH CHECK (true);

-- Deny SELECT for the table
CREATE POLICY profile_location_history_deny_select_policy ON history.profile_location_history
FOR SELECT TO public USING (false);

-- Deny UPDATE and DELETE for the table for all roles
CREATE POLICY profile_location_history_deny_update_policy
ON history.profile_location_history FOR UPDATE TO public USING (false);

CREATE POLICY profile_location_history_deny_delete_policy
ON history.profile_location_history FOR DELETE TO public USING (false);

ALTER TABLE history.profile_location_history ENABLE ROW LEVEL SECURITY;
