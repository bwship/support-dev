BEGIN;
-- 1. Setup
DO $$
DECLARE
  _user_id UUID;
  _email TEXT;
  _profile_id INTEGER;
  _address_id INTEGER;
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
      CAST('Bob' AS TEXT),
      CAST('Wall' AS TEXT),
      NULL,
      ARRAY['CLIENT', 'TEAM_OWNER']::role[],
      NULL);

    EXECUTE 'SET SESSION "support._profile_id" TO ''' || _profile_id || '''';
    EXECUTE 'SET SESSION "support._user_id" TO ''' || _user_id || '''';

    -- Add an address for updating later
    _address_id := fn_address_upsert(
      'Waltham',
      'Waltham Description',
      CURRENT_SETTING('support._profile_id', 't')::int,
      'Massachusetts',
      '1 Front Street',
      'HOME',
      '02451',
      NULL, -- address id
      NULL, -- location 
      'Apt 1'
    );

    EXECUTE 'SET SESSION "support._address_id" TO ''' || _address_id || '''';
END $$;

-- 2. Test - begin the transaction, this will allow you to rollback any changes made during the test

  -- plan your test in advance, this ensures the proper number of tests have been run.
  SELECT PLAN(4);

  -- Test insert
  SELECT is(fn_address_upsert(
      'Test City', 
      'Test Description',
      CURRENT_SETTING('support._profile_id', 't')::int,
      'Test State',
      '123 Test St',
      'HOME',
      '12345',
      NULL,  -- address id
      NULL,
      'Apt 123'
    )::bigint, currval(pg_get_serial_sequence('address', 'id')), 'Check that the id created is the one we expect');
  
  -- update an existing record
  SELECT is(fn_address_upsert(
      'Waltham',
      'UPDATED Waltham Description',
      CURRENT_SETTING('support._profile_id', 't')::int,
      'Massachusetts',
      '1 Back Street',
      'HOME',
      '02451',
      CURRENT_SETTING('support._address_id', 't')::int,
      NULL,
      'Apt 1'
    )::bigint, CURRENT_SETTING('support._address_id', 't')::bigint, 'Check that the id returned is the one we expect');

  PREPARE updated_description as SELECT description from public.address where id = CURRENT_SETTING('support._address_id')::int;
  SELECT results_eq(
    'updated_description',
    ARRAY['UPDATED Waltham Description'],
    'address description should match updated value');

  PREPARE updated_street1 as SELECT street_address_1 from public.address where id = CURRENT_SETTING('support._address_id')::int;
  SELECT results_eq(
    'updated_street1',
    ARRAY['1 Back Street'],
    'address description should match updated value');

  -- check the results of your test
  SELECT * FROM finish();

ROLLBACK;
