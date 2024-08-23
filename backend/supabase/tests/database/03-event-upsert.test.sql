BEGIN;
-- 1. Setup
DO $$
DECLARE
  _email TEXT;
  _event_id INTEGER;
  _profile_id INTEGER;
  _team_id INTEGER;
  _user_id UUID;
BEGIN
    _email := _user_id::TEXT || '.test.user@example.com';

    SELECT * INTO _user_id 
    FROM public.fn_seed_create_user(_email, 'testing123');

    SELECT * INTO _profile_id
    FROM public.fn_profile_and_relationship_upsert(
      _user_id::uuid,
      NULL,
      NULL,
      NULL,
      NULL,
      CAST('Sally' AS TEXT),
      CAST('Support' AS TEXT),
      NULL,
      ARRAY['CLIENT', 'TEAM_OWNER']::role[],
      NULL);

    SELECT team_id INTO _team_id
    FROM public.relationship
    WHERE profile_id = _profile_id;

    EXECUTE 'SET SESSION "support._profile_id" TO ''' || _profile_id || '''';
    EXECUTE 'SET SESSION "support._user_id" TO ''' || _user_id || '''';

    -- Create an event for a later update and save the event id
    _event_id := fn_event_upsert(
        'event name',
        'description',
        '2023-09-20',
        _team_id);
    EXECUTE 'SET SESSION "support._event_id" TO ''' || _event_id || '''';

END $$;

-- 2. Test - begin the transaction, this will allow you to rollback any changes made during the test

  -- plan your test in advance, this ensures the proper number of tests have been run.
  SELECT PLAN(9);

  SELECT is(
    fn_event_upsert(
        'event name',
        'description',
        '2023-09-20',
        CURRENT_SETTING('support._team_id', 't')::int
  )::bigint, currval(pg_get_serial_sequence('event', 'id')), 'event_id should match lastval');

  PREPARE the_name as SELECT name from public.event ORDER BY id DESC LIMIT 1;
  SELECT results_eq(
    'the_name',
    ARRAY['event name'],
    'event name should match inserted value'
  );

  PREPARE the_description as SELECT description from public.event ORDER BY id DESC LIMIT 1;
  SELECT results_eq(
    'the_description',
    ARRAY['description'],
    'event description should match inserted value'
  );
  
  PREPARE the_start_date as SELECT start_date from public.event ORDER BY id DESC LIMIT 1;
  SELECT results_eq(
    'the_start_date',
    ARRAY['2023-09-20'],
    'event start_date should match inserted value'
  );

  PREPARE the_team_id as SELECT team_id from public.event ORDER BY id DESC LIMIT 1;
  SELECT results_eq(
    'the_team_id',
    ARRAY[CURRENT_SETTING('support._team_id', 't')::int],
    'event team_id should match inserted value'
  );

  -- Do an upsert that results in an update
  SELECT is(
    fn_event_upsert(
        'event name updated',
        'description updated',
        '2023-09-20',
        CURRENT_SETTING('support._team_id', 't')::int,
        CURRENT_SETTING('support._event_id', 't')::int
  )::bigint, CURRENT_SETTING('support._event_id', 't')::bigint, 'event_id should match existing id');

  PREPARE updated_name as select name from public.event where id=CURRENT_SETTING('support._event_id', 't')::int;
  SELECT results_eq(
    'updated_name',
    ARRAY['event name updated'],
    'event name should match updated value');

    PREPARE updated_description as select description from public.event where id=CURRENT_SETTING('support._event_id', 't')::int;
   SELECT results_eq(
    'updated_description',
    ARRAY['description updated'],
    'event description should match updated value'
  );

  -- Test passing id that does exist.  Should get exception
  PREPARE throws_exception as SELECT fn_event_upsert(
        'event name updated',
        'description updated',
        '2023-09-20',
        CURRENT_SETTING('support._team_id', 't')::int,
        1000);

  SELECT throws_ok(
    'throws_exception',
    'P0001',
    'ID 1000 does not exist',
    'We should get an exception when passing an id that does not exist'
  );

  -- check the results of your test
  SELECT * FROM finish();

ROLLBACK;