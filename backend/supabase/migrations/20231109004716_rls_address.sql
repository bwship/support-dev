/* Address Table RLS Policies */

CREATE FUNCTION fn_rls_policy_is_owner_or_has_special_access(requested_profile_id INTEGER)
  RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profile AS p
    WHERE p.id = requested_profile_id
      AND (p.user_id = auth.uid())  -- TODO - need to add roles
  );
END;
$$;

-- For SELECT
CREATE POLICY address_select_policy ON public.address
FOR SELECT TO authenticated 
USING (fn_rls_policy_is_subitem_accessible(profile_id));

-- For INSERT
CREATE POLICY address_insert_policy ON public.address
FOR INSERT TO authenticated 
WITH CHECK (fn_rls_policy_is_owner_or_has_special_access(profile_id));

-- For UPDATE
CREATE POLICY address_update_policy ON public.address
FOR UPDATE TO authenticated USING(true)
WITH CHECK (fn_rls_policy_is_owner_or_has_special_access(profile_id));

ALTER TABLE public.address ENABLE ROW LEVEL SECURITY;

/* Address History */

-- Allow inserts from authenticated users
CREATE POLICY address_history_insert_policy ON history.address_history
FOR INSERT TO authenticated WITH CHECK (true);

-- Deny SELECT for the table
CREATE POLICY address_history_deny_select_policy ON history.address_history
FOR SELECT TO public USING (false);

-- Deny UPDATE and DELETE for the table for all roles
CREATE POLICY address_history_deny_update_policy
ON history.address_history FOR UPDATE TO public USING (false);

CREATE POLICY address_history_deny_delete_policy
ON history.address_history FOR DELETE TO public USING (false);

ALTER TABLE history.address_history ENABLE ROW LEVEL SECURITY;
