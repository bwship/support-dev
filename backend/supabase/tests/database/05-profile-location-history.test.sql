BEGIN; 
-- 1. Setup
DO $$
DECLARE
  _user_id UUID;
  _email TEXT;
  _profile_id INTEGER;
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
      CAST('Hally' AS TEXT),
      CAST('support' AS TEXT),
      NULL,
      ARRAY['CLIENT', 'TEAM_OWNER']::role[],
      NULL);


    EXECUTE 'SET SESSION "support._profile_id" TO ''' || _profile_id || '''';
    EXECUTE 'SET SESSION "support._user_id" TO ''' || _user_id || '''';

END $$;

-- 2. Test - begin the transaction, this will allow you to rollback any changes made during the test
  -- plan your test in advance, this ensures the proper number of tests have been run.

  SELECT PLAN(7);

  SELECT is(
    fn_profile_location_upsert(
        CURRENT_SETTING('support._profile_id', 't')::int,
        POINT(1,1)
  )::text, '', 'profile_location_upsert should return VOID');

  -- We should an insertion in the history table matching this insert above
  PREPARE one_insert_count as SELECT COUNT(*) from history.profile_location_history WHERE profile_id=CURRENT_SETTING('support._profile_id', 't')::int;
  SELECT results_eq(
    'one_insert_count',
    ARRAY['1'::bigint],
    'Count in profile_location_history table should be 1'
  );

  -- CASTING to TEXT because results_eq can't find an equals operator for point
  PREPARE the_location as SELECT CAST(location as TEXT) from history.profile_location_history WHERE profile_id=CURRENT_SETTING('support._profile_id', 't')::int;
  SELECT results_eq(
    'the_location',
    ARRAY['(1,1)'::TEXT],
    'profile_location_history location should match inserted value'
  );

  PREPARE the_profile_id as SELECT profile_id from history.profile_location_history WHERE profile_id=CURRENT_SETTING('support._profile_id', 't')::int;
  SELECT results_eq(
    'the_profile_id',
    ARRAY[CURRENT_SETTING('support._profile_id', 't')::int],
    'profile_location_history profile_id should match inserted value'
  );

  -- Do an upsert that results in an update
  SELECT is(
    fn_profile_location_upsert(
        CURRENT_SETTING('support._profile_id', 't')::int,
        POINT(1.1, 1.1)
  )::text, '', 'profile_location_upsert should return VOID');

  PREPARE count_after_update as SELECT COUNT(*) from history.profile_location_history WHERE profile_id=CURRENT_SETTING('support._profile_id', 't')::int;
  SELECT results_eq(
    'count_after_update',
    ARRAY['2'::bigint],
    'Count in profile_location_history table should be 2'
  );

  PREPARE updated_location as select CAST(location as TEXT) from history.profile_location_history where profile_id=CURRENT_SETTING('support._profile_id', 't')::int ORDER BY id DESC LIMIT 1;
  SELECT results_eq(
    'updated_location',
    ARRAY['(1.1,1.1)'::TEXT],
    'location should match updated value');

  -- check the results of your test
  SELECT * FROM finish();

ROLLBACK;
