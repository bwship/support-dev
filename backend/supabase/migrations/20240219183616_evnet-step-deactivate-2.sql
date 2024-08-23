CREATE OR REPLACE FUNCTION fn_event_step_deactivate (
  _id INTEGER
) RETURNS void AS $$
BEGIN
  -- cancel all requests for the step
  UPDATE public.event_step_request
  SET status = 'CANCELLED',
    updated_at = CURRENT_TIMESTAMP,
    updated_by = fn_get_authenticated_user_id()
  WHERE event_step_id = _id;

  -- deactivate the step
  UPDATE public.event_step
  SET is_active = false,
    deleted_at = CURRENT_TIMESTAMP,
    deleted_by = fn_get_authenticated_user_id()
  WHERE id = _id;
END;
$$ LANGUAGE plpgsql;