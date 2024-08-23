/* Config */

-- allow select for authenticated users and service_role
CREATE POLICY config_select_policy ON public.config
FOR SELECT TO authenticated, service_role USING (true);

-- Deny INSERT, UPDATE, and DELETE for the table
CREATE POLICY config_modify_policy ON public.config
FOR ALL USING (false) WITH CHECK (false);

ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

/* Config History */

-- Allow inserts from authenticated users
CREATE POLICY config_history_insert_policy ON history.config_history
FOR INSERT TO authenticated WITH CHECK (true);

-- Deny SELECT for the table
CREATE POLICY config_history_deny_select_policy ON history.config_history
FOR SELECT TO public USING (false);

-- Deny UPDATE and DELETE for the table for all roles
CREATE POLICY config_history_deny_update_policy
ON history.config_history FOR UPDATE TO public USING (false);

CREATE POLICY config_history_deny_delete_policy
ON history.config_history FOR DELETE TO public USING (false);

ALTER TABLE history.config_history ENABLE ROW LEVEL SECURITY;
