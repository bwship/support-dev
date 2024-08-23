CREATE OR REPLACE FUNCTION fn_event_step_upsert (
  _start_date TEXT,
  _team_id INTEGER,
  _type TEXT,
  _attributes JSONB,
  _notes TEXT DEFAULT NULL,
  _parent_step_id INTEGER DEFAULT NULL,
  _id INTEGER DEFAULT NULL -- event_step id
) RETURNS INTEGER AS $$
DECLARE
  _new_id INTEGER;
  _event_id INTEGER;
  _validated_date DATE;
BEGIN
    -- Validate the start date format
    BEGIN
      _validated_date := to_date(_start_date, 'YYYY-MM-DD');
    EXCEPTION WHEN others THEN
      RAISE EXCEPTION 'Invalid start date format. Expected format: YYYY-MM-DD';
    END;

    -- Check if the event exists
    SELECT A.id INTO _event_id
    FROM event AS A
    WHERE A.start_date = _start_date
      AND A.team_id = _team_id;

    IF _event_id IS NULL THEN
      -- Insert a new row into the event table
      INSERT INTO public.event(
          id, description, name, start_date, team_id, created_by)
      VALUES(
          COALESCE(_id, nextval('event_id_seq')),
          '',
          '',
          _validated_date,
          _team_id,
          fn_get_authenticated_user_id())
      RETURNING id INTO _event_id;
    END IF;

    -- Check if the ID already exists in the table
    -- Callers should not pass an ID that doesn't exist
    IF _id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.event_step WHERE id = _id) THEN
      -- If the ID doesn't exist, throw an exception
      RAISE EXCEPTION 'ID % does not exist. Use existing ID for update or no ID for insert', _id;
    ELSE
      INSERT INTO public.event_step(
        id,
        event_id,
        notes,
        parent_step_id,
        type,
        attributes,
        created_by
      )
      VALUES(
        COALESCE(_id, nextval('event_step_id_seq')),
        _event_id,
        _notes,
        _parent_step_id,
        _type,
        _attributes, 
        fn_get_authenticated_user_id()) -- created_by
      ON CONFLICT (id) DO UPDATE SET
          event_id = EXCLUDED.event_id,
          notes = EXCLUDED.notes,
          parent_step_id = EXCLUDED.parent_step_id, 
          type = EXCLUDED.type,
          attributes = EXCLUDED.attributes,
          updated_by = fn_get_authenticated_user_id(),
          updated_at = CURRENT_TIMESTAMP
      RETURNING id INTO _new_id;

      -- if the event is active and the start date is within the next 2 weeks,
      -- then add a processing record to send out invitations
      INSERT INTO event_processing(event_id, status, created_by)
        SELECT e.id, 'PENDING', fn_get_authenticated_user_id()
        FROM event AS e
        WHERE DATE(e.start_date) >= CURRENT_DATE 
          AND DATE(e.start_date) <= CURRENT_DATE + INTERVAL '2 Weeks' 
          AND e.is_active = true
          AND e.id = _event_id
          AND NOT EXISTS (
            SELECT 1
            FROM event_processing AS ep
            WHERE ep.event_id = e.id 
            AND (ep.status = 'PENDING' OR ep.status = 'IN_PROGRESS')
          );

      RETURN _new_id; -- Return exisiting or new id
    END IF;
END;
$$ LANGUAGE plpgsql;