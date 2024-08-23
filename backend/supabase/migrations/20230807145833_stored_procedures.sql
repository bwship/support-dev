CREATE OR REPLACE FUNCTION fn_get_authenticated_user_id()
  RETURNS UUID
  LANGUAGE plpgsql
AS $$
DECLARE
    _user_id UUID;
BEGIN
    -- Get the authenticated user's UUID
    SELECT auth.uid() INTO _user_id;
    
    -- If fn_get_authenticated_user_id() is null, fetch the UUID from the first record with 'ADMIN' role
    IF _user_id IS NULL THEN
      SELECT p.user_id
      FROM public.profile AS p
      WHERE
        EXISTS (
          SELECT 1
          FROM  public.relationship AS r
          WHERE r.profile_id = p.id
            AND 'ADMIN' = ANY(r.roles)
        )
      ORDER BY p.id ASC
      LIMIT 1
      INTO _user_id;
    END IF;
    
    RETURN _user_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_address_upsert(
  _city TEXT,
  _description TEXT,
  _profile_id INTEGER,
  _state TEXT,
  _street_address_1 TEXT,
  _type TEXT,
  _zip TEXT,
  _id INTEGER DEFAULT NULL,
  _location POINT DEFAULT NULL,
  _street_address_2 TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    _new_id INTEGER;
BEGIN
    IF _id IS NOT NULL THEN
      UPDATE public.address
      SET city = _city,
        description = _description,
        location = _location,
        profile_id = _profile_id,
        state = _state,
        street_address_1 = _street_address_1,
        street_address_2 = _street_address_2,
        type = _type,
        zip = _zip,
        updated_by = fn_get_authenticated_user_id(),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = _id;

      -- Set _new_id to _id to return back
      _new_id := _id;
    ELSE
      INSERT INTO public.address(id, city, description, location, profile_id,
        state, street_address_1, street_address_2,
        type, zip, created_by)
      VALUES(
        COALESCE(_id, nextval('address_id_seq')),
        _city,
        _description,
        _location,
        _profile_id,
        _state,
        _street_address_1,
        _street_address_2,
        _type,
        _zip,
        fn_get_authenticated_user_id()
      )
      RETURNING id INTO _new_id;
    END IF;

    -- Return the address id
    RETURN _new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_address_deactivate (
  _id INTEGER
) RETURNS void AS $$
BEGIN
    UPDATE public.address
    SET is_active = false,
      deleted_at = CURRENT_TIMESTAMP,
      deleted_by = fn_get_authenticated_user_id()
    WHERE id = _id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_relationship_deactivate (
  _profile_id  INTEGER
) RETURNS void AS $$
BEGIN
    UPDATE public.profile
    SET is_active = false,
      deleted_at = CURRENT_TIMESTAMP,
      deleted_by = fn_get_authenticated_user_id()
    WHERE id = _profile_id;

    UPDATE public.relationship
    SET is_active = false,
      deleted_at = CURRENT_TIMESTAMP,
      deleted_by = fn_get_authenticated_user_id()
    WHERE profile_id = _profile_id
      AND 'FAMILY_MEMBER' = ANY(roles);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_event_deactivate (
  _event_id INTEGER
) RETURNS void AS $$
BEGIN
    UPDATE public.event
    SET is_active = false,
      deleted_at = CURRENT_TIMESTAMP,
      deleted_by = fn_get_authenticated_user_id()
    WHERE id = _event_id;

    UPDATE public.event_step
    SET is_active = false,
        deleted_at = CURRENT_TIMESTAMP,
        deleted_by = fn_get_authenticated_user_id()
    WHERE event_id = _event_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_profile_and_relationship_upsert (
  _user_id UUID DEFAULT NULL,
  _parent_profile_id INTEGER DEFAULT NULL,
  _id INTEGER DEFAULT NULL,
  _profile_attributes JSONB DEFAULT NULL,
  _relationship_attributes JSONB DEFAULT NULL,
  _first_name TEXT DEFAULT NULL,
  _last_name TEXT DEFAULT NULL,
  _profile_url TEXT DEFAULT NULL,
  _roles role[] DEFAULT NULL,
  _team_id INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    _new_profile_id INTEGER;
    _relationship_id INTEGER;
BEGIN
    IF _id IS NOT NULL THEN
      UPDATE public.profile
      SET attributes = _profile_attributes,
        first_name = _first_name,
        last_name = _last_name,
        profile_url = _profile_url,
        user_id = _user_id,
        updated_by = fn_get_authenticated_user_id(),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = _id;

      -- only insert a relationship record if a parent profileId is passed in,
      -- otherwise someone is just updating their own profile
      IF _parent_profile_id IS NOT NULL THEN
        UPDATE public.relationship
        SET attributes = _relationship_attributes, 
          roles = _roles,
          updated_by = fn_get_authenticated_user_id(),
          updated_at = CURRENT_TIMESTAMP
        WHERE profile_id = _id
          AND parent_profile_id = _parent_profile_id;
      END IF;

      -- Set _new_id to _id to return back
      _new_profile_id := _id;
    ELSE
      INSERT INTO public.profile(id, user_id, attributes, first_name,
        last_name, profile_url, created_by)
      VALUES(
        COALESCE(_id, nextval('profile_id_seq')),
        _user_id,
        _profile_attributes,
        _first_name,
        _last_name,
        _profile_url,
        fn_get_authenticated_user_id()
      )
      RETURNING id INTO _new_profile_id;

      -- if this is a TEAM OWNER and they don't have a team, create one
      IF 'TEAM_OWNER' = ANY(_roles) AND _team_id IS NULL THEN
        INSERT INTO public.team (name, created_by)
        VALUES (COALESCE(_first_name, '') || '’s Team', fn_get_authenticated_user_id())
        RETURNING id INTO _team_id;
      END IF;

      INSERT INTO public.relationship (profile_id, parent_profile_id,
        attributes, team_id, roles, created_by)
      VALUES (
        _new_profile_id,
        COALESCE(_parent_profile_id, _new_profile_id),
        _relationship_attributes,
        _team_id,
        _roles,
        fn_get_authenticated_user_id()
      );
    END IF;

    -- Return the profile id
    RETURN _new_profile_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_team_upsert(
  _name TEXT,
  _id INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    _new_id INTEGER;
BEGIN
    INSERT INTO public.team(id, name, created_by)
    VALUES(
      COALESCE(_id, nextval('team_id_seq')),
      _name,
      fn_get_authenticated_user_id()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      updated_by = fn_get_authenticated_user_id(),
      updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO _new_id;
    
    -- Return the address id
    RETURN _new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_profile_location_upsert(
    _profile_id INTEGER, 
    _location POINT
) RETURNS void AS $$
BEGIN
    INSERT INTO public.profile_location(
      profile_id, 
      location,
      updated_at,
      updated_by
    )
    VALUES(
      _profile_id,
      _location,
      CURRENT_TIMESTAMP, -- updated_at
      fn_get_authenticated_user_id() -- updated_by
    )
    ON CONFLICT(profile_id) DO UPDATE SET
      profile_id = EXCLUDED.profile_id,
      location = EXCLUDED.location,
      updated_at = CURRENT_TIMESTAMP,
      updated_by = fn_get_authenticated_user_id();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_event_upsert (
    _name TEXT,
    _description TEXT,
    _start_date TEXT,
    _team_id INTEGER,
    _id INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE 
  _new_id INTEGER;
  _validated_date DATE;
BEGIN
  -- Validate the start date format
  BEGIN
    _validated_date := to_date(_start_date, 'YYYY-MM-DD');
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Invalid start date format. Expected format: YYYY-MM-DD';
  END;

  IF _id IS NULL THEN
    -- Insert a new row
    INSERT INTO public.event(
        id, description, name, start_date, team_id, created_by)
    VALUES(
        COALESCE(_id, nextval('event_id_seq')),
        _description,
        _name,
        _validated_date,
        _team_id,
        fn_get_authenticated_user_id())
    RETURNING id INTO _new_id;
  ELSE
    -- Update an existing row
    UPDATE public.event
    SET description = _description,
        name = _name,
        start_date = _validated_date,
        team_id = team_id,
        updated_by = fn_get_authenticated_user_id(),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = _id
    RETURNING id INTO _new_id;
    
    -- Check if _new_id is null after the update; if null, the ID doesn't exist
    IF _new_id IS NULL THEN
      RAISE EXCEPTION 'ID % does not exist', _id;
    END IF;
  END IF;

  RETURN _new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_event_step_upsert (
    _event_id INTEGER,
    _type TEXT,
    _attributes JSONB,
    _notes TEXT DEFAULT NULL,
    _parent_step_id INTEGER DEFAULT NULL,
    _id INTEGER DEFAULT NULL -- event_step id
) RETURNS INTEGER AS $$
DECLARE _new_id INTEGER;
BEGIN
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

      RETURN _new_id; -- Return exisiting or new id
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_event_step_deactivate (
  _id INTEGER
) RETURNS void AS $$
BEGIN
    UPDATE public.event_step
    SET is_active = false,
      deleted_at = CURRENT_TIMESTAMP,
      deleted_by = fn_get_authenticated_user_id()
    WHERE id = _id;
END;
$$ LANGUAGE plpgsql;

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
  END IF;

  -- get the edge function url, and anon key
  SELECT value INTO _supabase_anon_key
  FROM public.config
  WHERE id = 'SUPABASE_ANON_KEY';

  SELECT value INTO _supabase_url
  FROM public.config
  WHERE id = 'SUPABASE_EDGE_FUNCTION_URL';

  SELECT
    net.http_post(
      url:= _supabase_url || '/functions/v1/events/'
        || CAST(_event_id AS TEXT) || '/steps/' || CAST(_event_step_id AS TEXT) || '/ranking',
      headers:= json_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || _supabase_anon_key
      )::jsonb
  ) INTO _result;

  RETURN _new_id; -- Return exisiting or new id
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.fn_insert_secret(name text, secret text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  return vault.create_secret(secret, name);
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_read_secret(secret_name text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  secret text;
begin
  select decrypted_secret from vault.decrypted_secrets where name =
  secret_name into secret;
  return secret;
end;
$function$;

CREATE OR REPLACE FUNCTION public.fn_delete_secret(secret_name text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  DELETE FROM vault.decrypted_secrets WHERE name = secret_name;
  RETURN 'Deleted';  
end;
$function$;

CREATE OR REPLACE FUNCTION fn_event_processing_update (
  _event_id INTEGER,
  _status TEXT
)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE event_processing
  SET 
    status = _status,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = fn_get_authenticated_user_id()
  WHERE event_id = _event_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_event_processing_deactivate (
  _event_id INTEGER
)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE event_processing
  SET 
    deactivated_at = CURRENT_TIMESTAMP,
    deactivated_by = fn_get_authenticated_user_id()
  WHERE 
    event_id = _event_id 
    AND deactivated_at IS NULL;
        
  IF NOT FOUND THEN
    RAISE WARNING 'No active event_processing record found with event_id %', _event_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION fn_event_process ()
RETURNS TRIGGER AS $$
DECLARE    
  _supabase_anon_key TEXT;
  _supabase_url TEXT;
  _result TEXT;
BEGIN
  -- get the edge function url, and anon key
  SELECT value INTO _supabase_anon_key
  FROM public.config
  WHERE id = 'SUPABASE_ANON_KEY';

  SELECT value INTO _supabase_url
  FROM public.config
  WHERE id = 'SUPABASE_EDGE_FUNCTION_URL';

  -- call the edge function
  SELECT
    net.http_post(
      url:= _supabase_url || '/functions/v1/events/' || CAST(NEW.event_id AS TEXT) || '/process',
      headers:= json_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || _supabase_anon_key
      )::jsonb,
      body:=concat('{"event_processing_id": ', CAST(NEW.id AS TEXT), '}')::jsonb
  ) INTO _result;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_event_processing_insert
AFTER INSERT ON public.event_processing
FOR EACH ROW
WHEN (NEW.status = 'PENDING')
EXECUTE FUNCTION fn_event_process();

CREATE OR REPLACE FUNCTION public.fn_event_step_request_ranking_update(
    _id INTEGER,
    _ranking INTEGER
)
 RETURNS VOID
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Update the existing record
    UPDATE event_step_request
    SET ranking = _ranking,    
    updated_by = fn_get_authenticated_user_id(),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = _id;
END;
$function$;

CREATE OR REPLACE FUNCTION fn_notification_insert (
  _profile_id INTEGER,
  _subject TEXT,
  _content TEXT,
  _channel TEXT,
  _traceback TEXT
)
RETURNS INTEGER AS $$
DECLARE
  _new_id INTEGER;
BEGIN
  INSERT INTO public.notification(
    profile_id,
    subject,
    content,
    status,
    channel,
    created_by,
    traceback
  )
  VALUES (
    _profile_id,
    _subject,
    _content,
    'PENDING',
    _channel,
    fn_get_authenticated_user_id(),
    _traceback
  )
  RETURNING id INTO _new_id;

  RETURN _new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_notification_update (
  _notification_id INTEGER,
  _status TEXT,
  _proof TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notification
  SET 
    status = _status,
    sent_at = CURRENT_TIMESTAMP,
    sent_by = fn_get_authenticated_user_id(),
    proof = _proof
  WHERE id = _notification_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_events_process_upcoming ()
RETURNS VOID AS $$
BEGIN

    -- Insert eligible events into event_processing if they are not already present
    INSERT INTO event_processing(event_id, status, created_by)
    SELECT e.id, 'PENDING', fn_get_authenticated_user_id()
    FROM event AS e
    WHERE DATE(e.start_date) >= CURRENT_DATE 
      AND DATE(e.start_date) <= CURRENT_DATE + INTERVAL '2 Weeks' 
      AND e.is_active = true
      AND EXISTS (
        SELECT 1
        FROM event_step AS es
        WHERE es.event_id = e.id
        AND es.is_active = true
      )
      AND NOT EXISTS (
        SELECT 1
        FROM event_processing AS ep
        WHERE ep.event_id = e.id 
        AND (ep.status = 'PENDING' OR ep.status = 'IN_PROGRESS')
      );

END;
$$ LANGUAGE plpgsql;
