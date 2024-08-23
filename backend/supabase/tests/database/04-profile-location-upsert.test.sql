-- 1. Setup
BEGIN;
DO $$
DECLARE
  _user_id UUID;
  _email TEXT;
  _profile_id INTEGER;
  _void_return_value TEXT;
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
      CAST('Support' AS TEXT),
      NULL,
      ARRAY['CLIENT', 'TEAM_OWNER']::role[],
      NULL);


    EXECUTE 'SET SESSION "support._profile_id" TO ''' || _profile_id || '''';
    EXECUTE 'SET SESSION "support._user_id" TO ''' || _user_id || '''';

    _void_return_value := fn_profile_location_upsert(
      _profile_id,
      POINT(1,1)
    );

END $$;

-- 2. Test - begin the transaction, this will allow you to rollback any changes made during the test
  -- plan your test in advance, this ensures the proper number of tests have been run.

  SELECT PLAN(6);

  SELECT is(
    fn_profile_location_upsert(
        CURRENT_SETTING('support._profile_id', 't')::int,
        POINT(1,1)
  )::text, '', 'profile_location_upsert should return VOID');

  -- CASTING to TEXT because results_eq can't find an equals operator for point
  PREPARE the_location as SELECT CAST(location as TEXT) from public.profile_location WHERE profile_id=CURRENT_SETTING('support._profile_id', 't')::int;
  SELECT results_eq(
    'the_location',
    ARRAY['(1,1)'::TEXT],
    'profile_location location should match inserted value'
  );

  PREPARE the_profile_id as SELECT profile_id from public.profile_location WHERE profile_id=CURRENT_SETTING('support._profile_id', 't')::int;
  SELECT results_eq(
    'the_profile_id',
    ARRAY[CURRENT_SETTING('support._profile_id', 't')::int],
    'profile_location profile_id should match inserted value'
  );

  -- Do an upsert that results in an update
  SELECT is(
    fn_profile_location_upsert(
        CURRENT_SETTING('support._profile_id', 't')::int,
        POINT(1.1, 1.1)
  )::text, '', 'profile_location_upsert should return VOID');

  PREPARE updated_location as select CAST(location as TEXT) from public.profile_location where profile_id=CURRENT_SETTING('support._profile_id', 't')::int;
  SELECT results_eq(
    'updated_location',
    ARRAY['(1.1,1.1)'::TEXT],
    'location should match updated value');

  -- Test passing profile_id that does exist.  Should get exception
  PREPARE throws_exception as SELECT fn_profile_location_upsert(
        1000, -- should not exist
        POINT(1000,1000)
        );

  SELECT throws_ok(
    'throws_exception',
    '23503',
    'insert or update on table "profile_location" violates foreign key constraint "profile_location_profile_id_fkey"',
    'We should get an exception when passing a profile_id that does not exist'
  );

  -- check the results of your test
  SELECT * FROM finish();

ROLLBACK;