/* Event Processing Table */

CREATE POLICY event_processing_select_policy ON public.event_processing
FOR SELECT TO service_role
USING (true);

-- For INSERT
CREATE POLICY event_processing_insert_policy ON public.event_processing
FOR INSERT TO service_role
WITH CHECK (true);

-- For UPDATE
CREATE POLICY event_processing_update_policy ON public.event_processing
FOR UPDATE TO service_role
WITH CHECK (true);

ALTER TABLE public.event_processing ENABLE ROW LEVEL SECURITY;
