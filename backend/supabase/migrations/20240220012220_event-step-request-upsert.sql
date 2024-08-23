
CREATE OR REPLACE FUNCTION fn_event_step_request_upsert (
    _event_step_id INTEGER,
    _notes TEXT,
    _profile_id INTEGER,
    _status TEXT,
    _id INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    _event_id INTEGER;
    _team_id INTEGER;
    _new_id INTEGER;
    _result TEXT;
    _supabase_anon_key TEXT;
    _supabase_url TEXT;
BEGIN
  -- Check if the ID already exists in the table
  -- Callers should not pass an ID that doesn't exist
  IF _id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.event_step_request WHERE id = _id) THEN
    -- If the ID doesn't exist, throw an exception
    RAISE EXCEPTION 'ID % does not exist. Use existing ID for update or no ID for insert', _id;
  END IF;

  SELECT event_id INTO _event_id
  FROM public.event_step
  WHERE id = _event_step_id;

  SELECT team_id
  INTO _team_id
  FROM public.event
  WHERE id = _event_id;

  IF _id IS NULL THEN
    INSERT INTO public.event_step_request(
      id,
      event_step_id,
      team_id,
      notes,
      profile_id,
      status,
      created_by
    )
    VALUES(
      COALESCE(_id, nextval('event_step_request_id_seq')),
      _event_step_id,
      _team_id,
      _notes,
      _profile_id,
      _status,
      fn_get_authenticated_user_id()
    )
    RETURNING id INTO _new_id;
  ELSE
    UPDATE public.event_step_request
    SET event_step_id = _event_step_id,
        team_id = _team_id,
        notes = _notes,
        profile_id = _profile_id,
        status = _status,
        updated_by = fn_get_authenticated_user_id(),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = _id
    RETURNING id INTO _new_id;

    -- get the edge function url, and anon key
    SELECT value INTO _supabase_anon_key
    FROM public.config
    WHERE id = 'SUPABASE_ANON_KEY';

    SELECT value INTO _supabase_url
    FROM public.config
    WHERE id = 'SUPABASE_EDGE_FUNCTION_URL';

    -- only perform ranking with the request is updated,
    -- it doesn't need to be ranked when it is created
    SELECT
      net.http_post(
        url:= _supabase_url || '/functions/v1/events/'
          || CAST(_event_id AS TEXT) || '/steps/' || CAST(_event_step_id AS TEXT) || '/ranking',
        headers:= json_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || _supabase_anon_key
        )::jsonb
    ) INTO _result;
  END IF;

  RETURN _new_id; -- Return exisiting or new id
END;
$$ LANGUAGE plpgsql;
