/* Lookup Tables */

/* lookup_address_type */

-- Allow SELECT for the table
CREATE POLICY lookup_address_type_select_policy ON public.lookup_address_type
FOR SELECT TO authenticated USING (true);

-- Deny INSERT, UPDATE, and DELETE for the table
CREATE POLICY lookup_address_type_modify_policy ON public.lookup_address_type
FOR ALL USING (false) WITH CHECK (false);

/* lookup_event_processing_status */

-- Allow SELECT for the table
CREATE POLICY lookup_event_processing_status_select_policy ON public.lookup_event_processing_status
FOR SELECT TO authenticated USING (true);

-- Deny INSERT, UPDATE, and DELETE for the table
CREATE POLICY lookup_event_processing_status_modify_policy ON public.lookup_event_processing_status
FOR ALL USING (false) WITH CHECK (false);

/* lookup_family_member_type */

-- Allow SELECT for the table
CREATE POLICY lookup_family_member_type_select_policy ON public.lookup_family_member_type
FOR SELECT TO authenticated USING (true);

-- Deny INSERT, UPDATE, and DELETE for the table
CREATE POLICY lookup_family_member_type_modify_policy ON public.lookup_family_member_type
FOR ALL USING (false) WITH CHECK (false);

/* lookup_invite_status */

-- Allow SELECT for the table
CREATE POLICY lookup_invite_status_select_policy ON public.lookup_invite_status
FOR SELECT TO authenticated USING (true);

-- Deny INSERT, UPDATE, and DELETE for the table
CREATE POLICY lookup_invite_status_modify_policy ON public.lookup_invite_status
FOR ALL USING (false) WITH CHECK (false);

/* lookup_notification_channel */

-- Allow SELECT for the table
CREATE POLICY lookup_notification_channel_select_policy ON public.lookup_notification_channel
FOR SELECT TO authenticated USING (true);

-- Deny INSERT, UPDATE, and DELETE for the table
CREATE POLICY lookup_notification_channel_modify_policy ON public.lookup_notification_channel
FOR ALL USING (false) WITH CHECK (false);

/* lookup_notification_status */

-- Allow SELECT for the table
CREATE POLICY lookup_notification_status_select_policy ON public.lookup_notification_status
FOR SELECT TO authenticated USING (true);

-- Deny INSERT, UPDATE, and DELETE for the table
CREATE POLICY lookup_notification_status_modify_policy ON public.lookup_notification_status
FOR ALL USING (false) WITH CHECK (false);

/* lookup_pet_type */

-- Allow SELECT for the table
CREATE POLICY lookup_pet_type_select_policy ON public.lookup_pet_type
FOR SELECT TO authenticated USING (true);

-- Deny INSERT, UPDATE, and DELETE for the table
CREATE POLICY lookup_pet_type_modify_policy ON public.lookup_pet_type
FOR ALL USING (false) WITH CHECK (false);

/* lookup_step_type */

-- Allow SELECT for the table
CREATE POLICY lookup_step_type_select_policy ON public.lookup_step_type
FOR SELECT TO authenticated USING (true);

-- Deny INSERT, UPDATE, and DELETE for the table
CREATE POLICY lookup_step_type_modify_policy ON public.lookup_step_type
FOR ALL USING (false) WITH CHECK (false);

/* lookup_transportation_rule */

-- Allow SELECT for the table
CREATE POLICY lookup_transportation_rule_select_policy ON public.lookup_transportation_rule
FOR SELECT TO authenticated USING (true);

-- Deny INSERT, UPDATE, and DELETE for the table
CREATE POLICY lookup_transportation_rule_modify_policy ON public.lookup_transportation_rule
FOR ALL USING (false) WITH CHECK (false);

ALTER TABLE public.lookup_address_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_event_processing_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_family_member_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_invite_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_notification_channel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_notification_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_pet_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_step_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookup_transportation_rule ENABLE ROW LEVEL SECURITY;
