-- For INSERT
ALTER POLICY event_processing_insert_policy
ON public.event_processing TO service_role, authenticated;
