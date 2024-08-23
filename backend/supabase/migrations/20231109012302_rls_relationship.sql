/* Relationship Table */

CREATE POLICY relationship_select_policy ON public.relationship
FOR SELECT TO authenticated USING (fn_rls_policy_is_subitem_accessible(profile_id));

-- For INSERT
CREATE POLICY relationship_insert_policy ON public.relationship
FOR INSERT TO authenticated WITH CHECK (true);

-- For UPDATE
CREATE POLICY relationship_update_policy ON public.relationship
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.relationship ENABLE ROW LEVEL SECURITY;

/* Relationship history table */

-- Allow inserts from authenticated users
CREATE POLICY relationship_history_insert_policy ON history.relationship_history
FOR INSERT TO authenticated WITH CHECK (true);

-- Deny SELECT for the table
CREATE POLICY relationship_history_deny_select_policy ON history.relationship_history
FOR SELECT TO public USING (false);

-- Deny UPDATE and DELETE for the table for all roles
CREATE POLICY relationship_history_deny_update_policy
ON history.relationship_history FOR UPDATE TO public USING (false);

CREATE POLICY relationship_history_deny_delete_policy
ON history.relationship_history FOR DELETE TO public USING (false);

ALTER TABLE history.relationship_history ENABLE ROW LEVEL SECURITY;
