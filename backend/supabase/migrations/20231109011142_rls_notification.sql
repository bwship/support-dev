/* Notification Table */

CREATE POLICY notification_select_policy ON public.notification
FOR SELECT TO service_role
USING (true);

-- For INSERT
CREATE POLICY notification_insert_policy ON public.notification
FOR INSERT TO service_role
WITH CHECK (true);

-- For UPDATE
CREATE POLICY notification_update_policy ON public.notification
FOR UPDATE TO service_role
WITH CHECK (true);

ALTER TABLE public.notification ENABLE ROW LEVEL SECURITY;
