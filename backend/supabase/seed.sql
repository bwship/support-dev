CREATE OR REPLACE FUNCTION public.fn_seed_create_user (
  email text,
  password text
) RETURNS uuid AS $$
  DECLARE user_id uuid;
          encrypted_pw text;
BEGIN
  user_id := gen_random_uuid();
  encrypted_pw := crypt(password, gen_salt('bf'));
  
  INSERT INTO auth.users
    (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES
    ('00000000-0000-0000-0000-000000000000', user_id, 'authenticated', 'authenticated', email, encrypted_pw, '2023-05-03 19:41:43.585805+00', '2023-04-22 13:10:03.275387+00', '2023-04-22 13:10:31.458239+00', '{"provider":"email","providers":["email"]}', '{}', '2023-05-03 19:41:43.580424+00', '2023-05-03 19:41:43.585948+00', '', '', '', '');
  
  INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (gen_random_uuid(), user_id, format('{"sub":"%s","email":"%s"}', user_id::text, email)::jsonb, 'email', '2023-05-03 19:41:43.582456+00', '2023-05-03 19:41:43.582497+00', '2023-05-03 19:41:43.582497+00');

  RETURN user_id;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE
  _account_id INTEGER;
  _company_id INTEGER;
  _company_address_id INTEGER;
  _event_id INTEGER;
  _family_id INTEGER;
  _helper_1_id INTEGER;
  _helper_1_user_id TEXT;
  _helper_2_id INTEGER;
  _helper_2_user_id TEXT;
  _home_address_id INTEGER;
  _hospital_address_id INTEGER;
  _other_profile_id INTEGER;
  _other_user_id TEXT;
  _profile_id INTEGER;
  _step_1_id INTEGER;
  _step_2_id INTEGER;
  _step_3_id INTEGER;
  _team_id INTEGER;
  _user_id TEXT;
  _team_admin_1_user_id TEXT;
  _team_admin_1_id INTEGER;

  _random_client_user_id TEXT;
  _random_client_profile_id INTEGER;
  _random_team_owner_user_id TEXT;
  _random_team_owner_profile_id INTEGER;
  _random_team_admin_user_id TEXT;
  _random_team_admin_profile_id INTEGER;
  _random_helper_user_id TEXT;
  _random_helper_profile_id INTEGER;
  _team_owner_bob_team_user_id TEXT;
  _team_owner_bob_team_profile_id INTEGER;
BEGIN
    -- config defaults
    INSERT INTO public.config (id, value, created_by)
    VALUES ('SUPABASE_EDGE_FUNCTION_URL', 'http://localhost:54321', fn_get_authenticated_user_id());

    INSERT INTO public.config (id, value, created_by)
    VALUES ('SUPABASE_ANON_KEY', 'TEST', fn_get_authenticated_user_id());

    -- admin user
    SELECT * INTO _user_id 
    FROM public.fn_seed_create_user('bob.m.wall+admin@gmail.com', 'testing123');

    -- create the main user profile
    SELECT * INTO _profile_id
    FROM public.fn_profile_and_relationship_upsert(
      _user_id::uuid,
      NULL,
      NULL,
      NULL,
      NULL,
      CAST('RBY' AS TEXT),
      CAST('Admin' AS TEXT),
      NULL,
      ARRAY['ADMIN', 'TEAM_OWNER']::role[],
      NULL);

    -- lookup tables

    -- Event Processing Statues
    INSERT INTO public.lookup_event_processing_status (id, description, created_by) VALUES ('PENDING', 'Processing of event is pending', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_event_processing_status (id, description, created_by) VALUES ('IN_PROGRESS', 'Processing of event is in progress', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_event_processing_status (id, description, created_by) VALUES ('FAILED', 'Processing of event failed', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_event_processing_status (id, description, created_by) VALUES ('COMPLETED', 'Processing of event completed', fn_get_authenticated_user_id());

    -- Notification status
    INSERT INTO public.lookup_notification_status (id, description, created_by) VALUES ('PENDING', 'When the notification is first created', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_notification_status (id, description, created_by) VALUES ('FAILED', 'When could not sent notification', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_notification_status (id, description, created_by) VALUES ('SENT', 'When the notification is sent successfully', fn_get_authenticated_user_id());

    -- Notification channel
    INSERT INTO public.lookup_notification_channel (id, description, created_by) VALUES ('EMAIL', 'Send notification to email', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_notification_channel (id, description, created_by) VALUES ('PHONE', 'Send notification to phone', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_notification_channel (id, description, created_by) VALUES ('PUSH', 'Push notification on mobile phone', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_notification_channel (id, description, created_by) VALUES ('SLACK', 'Internal Support-Dev Slack', fn_get_authenticated_user_id());

    -- Address Types
    INSERT INTO public.lookup_address_type (id, description, created_by) VALUES ('DOCTOR', 'Doctors Office', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_address_type (id, description, created_by) VALUES ('HOME', 'Home of a user', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_address_type (id, description, created_by) VALUES ('HOSPITAL', 'Hospital', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_address_type (id, description, created_by) VALUES ('OFFICE', 'Office for a user', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_address_type (id, description, created_by) VALUES ('OTHER', 'Other location', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_address_type (id, description, created_by) VALUES ('SCHOOL', 'School', fn_get_authenticated_user_id());

    -- Family Member Types
    INSERT INTO public.lookup_family_member_type (id, description, created_by) VALUES ('FATHER', 'Father', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_family_member_type (id, description, created_by) VALUES ('MOTHER', 'Mother', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_family_member_type (id, description, created_by) VALUES ('SON', 'Son', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_family_member_type (id, description, created_by) VALUES ('DAUGHTER', 'Daughter', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_family_member_type (id, description, created_by) VALUES ('HUSBAND', 'Husband', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_family_member_type (id, description, created_by) VALUES ('WIFE', 'Wife', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_family_member_type (id, description, created_by) VALUES ('AUNT', 'Aunt', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_family_member_type (id, description, created_by) VALUES ('UNCLE', 'Uncle', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_family_member_type (id, description, created_by) VALUES ('GRANDFATHER', 'Grandfather', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_family_member_type (id, description, created_by) VALUES ('GRANDMOTHER', 'Grandmother', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_family_member_type (id, description, created_by) VALUES ('GREAT_GRANDFATHER', 'Great Grandfather', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_family_member_type (id, description, created_by) VALUES ('GREAT_GRANDMOTHER', 'Great Grandmother', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_family_member_type (id, description, created_by) VALUES ('OTHER', 'Other', fn_get_authenticated_user_id());

    -- Invite Status
    INSERT INTO public.lookup_invite_status (id, description, created_by) VALUES ('ACCEPTED', 'Accepted a request', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_invite_status (id, description, created_by) VALUES ('DECLINED', 'Declined a request', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_invite_status (id, description, created_by) VALUES ('INVITED', 'Invited to perform an event step', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_invite_status (id, description, created_by) VALUES ('TENTATIVE', 'Tentatively accepting a request', fn_get_authenticated_user_id());

    -- Pet Type
    INSERT INTO public.lookup_pet_type (id, description, created_by) VALUES ('BIRD', 'Bird', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_pet_type (id, description, created_by) VALUES ('CAT', 'Cat', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_pet_type (id, description, created_by) VALUES ('DOG', 'Dog', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_pet_type (id, description, created_by) VALUES ('FISH', 'Fish', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_pet_type (id, description, created_by) VALUES ('HAMSTER', 'Hamster', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_pet_type (id, description, created_by) VALUES ('SNAKE', 'Snake', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_pet_type (id, description, created_by) VALUES ('OTHER', 'Other', fn_get_authenticated_user_id());

    -- Step Type
    INSERT INTO public.lookup_step_type (id, description, created_by) VALUES ('CHILD_CARE', 'Child Care', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_step_type (id, description, created_by) VALUES ('MEAL', 'Meal', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_step_type (id, description, created_by) VALUES ('TRANSPORTATION', 'Transportation', fn_get_authenticated_user_id());

    -- Transportation Rule
    INSERT INTO public.lookup_transportation_rule (id, description, created_by) VALUES ('HYGIENIC', 'Hygienic vehicle', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_transportation_rule (id, description, created_by) VALUES ('SUV', 'SUV sized vehicle only', fn_get_authenticated_user_id());
    INSERT INTO public.lookup_transportation_rule (id, description, created_by) VALUES ('WHEEL_CHAIR_ACCESSIBLE', 'Wheelchair Accessible Vehicle', fn_get_authenticated_user_id());

    SELECT * INTO _user_id 
    FROM public.fn_seed_create_user('bob@support.dev', 'testing123');

    -- create the main user profile
    SELECT * INTO _profile_id
    FROM public.fn_profile_and_relationship_upsert(
      _user_id::uuid,
      NULL,
      NULL,
      NULL,
      NULL,
      CAST('Bob' AS TEXT),
      CAST('Support' AS TEXT),
      NULL,
      ARRAY['CLIENT', 'TEAM_OWNER']::role[],
      NULL);

    -- get the team created by main user profile creation 
    SELECT team_id INTO _team_id
    FROM public.relationship
    WHERE profile_id = _profile_id;

    -- add $10.00 to the user's account
    SELECT id INTO _account_id
    FROM public.account
    WHERE team_id = _team_id;

    SELECT * INTO _account_id
    FROM fn_account_upsert(
      _account_id,
      _profile_id,
      1000
    );

    -- create a home address
    SELECT * INTO _home_address_id
    FROM public.fn_address_upsert(
      CAST('Mount Pleasant' AS TEXT), CAST('' AS TEXT),
      _profile_id, CAST('SC' AS TEXT), CAST('1111 Broad Street' AS TEXT),
      'HOME', CAST('21211' AS TEXT),
      NULL, NULL, NULL
    );

    -- create the hospital
    SELECT * INTO _hospital_address_id
    FROM public.fn_address_upsert(
      CAST('Mount Pleasant' AS TEXT), CAST('Roper St. Francis Hospital' AS TEXT),
      _profile_id, CAST('SC' AS TEXT), CAST('3500 N Hwy 17' AS TEXT),
      'HOSPITAL', CAST('29464' AS TEXT),
      NULL, NULL, NULL
    );

    -- create a team admin
    SELECT * INTO _team_admin_1_user_id 
    FROM public.fn_seed_create_user('bob+teamadmin@support.dev', 'testing123');

    SELECT * INTO _team_admin_1_id
    FROM public.fn_profile_and_relationship_upsert(
      _team_admin_1_user_id::uuid,              -- user id
      _profile_id,                              -- parent profile id
      NULL,                                     -- id
      NULL,                                     -- profile attributes
      '{"request_types": ["CHILD_CARE", "MEAL", "TRANSPORTATION"], "response_types": ["CHILD_CARE", "MEAL", "TRANSPORTATION"]}'::jsonb, -- relationship attributes
      CAST('Miss' AS TEXT),                   -- first name
      CAST('Momma' AS TEXT),                    -- last name
      NULL,                                     -- profile url
      ARRAY['TEAM_ADMIN']::role[],              -- roles
      _team_id);

    -- create a helper
    SELECT * INTO _helper_1_user_id 
    FROM public.fn_seed_create_user('bob+helper1@support.dev', 'testing123');

    SELECT * INTO _helper_1_id
    FROM public.fn_profile_and_relationship_upsert(
      _helper_1_user_id::uuid,                  -- user id
      _profile_id,                              -- parent profile id
      NULL,                                     -- id
      NULL,                                     -- profile attributes
      '{"request_types": ["CHILD_CARE", "MEAL", "TRANSPORTATION"], "response_types": ["CHILD_CARE", "MEAL", "TRANSPORTATION"]}'::jsonb, -- relationship attributes
      CAST('John' AS TEXT),                     -- first name
      CAST('Smith' AS TEXT),                    -- last name
      NULL,                                     -- profile url
      ARRAY['HELPER']::role[],                  -- roles
      _team_id);                                -- team

    -- create a helper/family member
    SELECT * INTO _helper_2_user_id 
    FROM public.fn_seed_create_user('bob+helper2@support.dev', 'testing123');

    SELECT *  INTO _helper_2_id
    FROM public.fn_profile_and_relationship_upsert(
      _helper_2_user_id::uuid,
      _profile_id,
      NULL,
      NULL,
      '{"family_member_type": "WIFE", "request_types": ["CHILD_CARE", "MEAL", "TRANSPORTATION"], "response_types": ["CHILD_CARE", "MEAL", "TRANSPORTATION"]}'::jsonb, -- relationship attributes
      CAST('Jane' AS TEXT),
      CAST('Wall' AS TEXT),
      NULL,
      ARRAY['FAMILY_MEMBER', 'HELPER']::role[],
      _team_id);

    -- create a family dependent
    SELECT * INTO _family_id
    FROM public.fn_profile_and_relationship_upsert(
      NULL,
      _profile_id,
      NULL,
      '{"date_of_birth": "2020-01-01", "food_allergy_description": "Gluten-free"}'::jsonb, -- profile attributes
      '{"family_member_type": "SON"}'::jsonb, -- relationship attributes     
      CAST('Bo' AS TEXT),
      CAST('Jurda' AS TEXT),
      NULL,
      ARRAY['FAMILY_MEMBER']::role[],
      _team_id);

    -- create an event
    SELECT * INTO _event_id
    FROM public.fn_event_upsert(
      'Radiation',
      'Trip to the doctor for radiation',
      '2024-01-01',
      _team_id
    );

    -- create a transportation event step
    SELECT * INTO _step_1_id
    FROM public.fn_event_step_upsert(
      _event_id,
      'TRANSPORTATION',
      jsonb_build_object(
        'start_address_id', _home_address_id, 
        'end_address_id', _hospital_address_id,
        'pickup_at', '2024-01-01 11:30:00.00+00'::timestamp with time zone
      ),
      'transportation notes',
      NULL,
      NULL
    ); 

    -- create a meal event step
    SELECT * INTO _step_2_id
    FROM public.fn_event_step_upsert(
      _event_id,
      'MEAL',
      jsonb_build_object(
        'address_id', _home_address_id, 
        'family_member_ids', jsonb_build_array(_profile_id, _family_id),
        'dropoff_at', '2024-01-01 14:00:00.00+00'::timestamp with time zone
      ),
      'meal notes',
      NULL,
      NULL
    );

    -- create a child care event step
    SELECT * INTO _step_3_id
    FROM public.fn_event_step_upsert(
      _event_id,
      'CHILD_CARE',
      jsonb_build_object(
        'address_id', _home_address_id, 
        'family_member_ids', jsonb_build_array(_family_id),
        'start_at', '2024-01-01 11:30:00.00+00'::timestamp with time zone,
        'end_at', '2024-01-01 18:00:00.00+00'::timestamp with time zone
      ),
      'child care notes',
      NULL,
      NULL
    );

    -- transportation requests
    INSERT INTO public.event_step_request (event_step_id, ranking, profile_id,
      status, created_by, team_id)
    VALUES (_step_1_id, 1, _helper_1_id,
      'ACCEPTED', _user_id::uuid, _team_id);

    INSERT INTO public.event_step_request (event_step_id, ranking, profile_id,
      status, created_by, team_id)
    VALUES (_step_1_id, 2, _helper_2_id,
      'ACCEPTED', _user_id::uuid, _team_id);

    INSERT INTO public.event_step_request (event_step_id, ranking, profile_id,
      status, created_by, team_id)
    VALUES (_step_1_id, 3, _team_admin_1_id,
      'ACCEPTED', _user_id::uuid, _team_id);

    -- meal requests
    INSERT INTO public.event_step_request (event_step_id, ranking, profile_id,
      status, created_by, team_id)
    VALUES (_step_2_id, null, _helper_1_id,
      'INVITED', _user_id::uuid, _team_id);

    INSERT INTO public.event_step_request (event_step_id, ranking, profile_id,
      status, created_by, team_id)
    VALUES (_step_2_id, null, _helper_2_id,
      'INVITED', _user_id::uuid, _team_id);

    -- child care requests
    INSERT INTO public.event_step_request (event_step_id, ranking, profile_id,
      status, created_by, team_id)
    VALUES (_step_3_id, null, _helper_1_id,
      'DECLINED', _user_id::uuid, _team_id);

    INSERT INTO public.event_step_request (event_step_id, ranking, profile_id,
      status, created_by, team_id)
    VALUES (_step_3_id, 1, _helper_2_id,
      'ACCEPTED', _user_id::uuid, _team_id);

    -- Create event_processing_row for deno select policy tests
    INSERT INTO public.event_processing (event_id, status)
    VALUES(_event_id, 'IN_PROGRESS');

    -- Create notification row for deno select policy tests
    INSERT INTO public.notification (profile_id, subject, content, status, channel, traceback)
    VALUES (_profile_id, 'subject', 'content', 'PENDING', 'PUSH', 'traceback');

    INSERT INTO public.notification (profile_id, subject, content, status, channel, traceback)
    VALUES (_profile_id, 'subject', 'content', 'PENDING', 'PHONE', 'traceback');


    GRANT USAGE ON SCHEMA history TO postgres, authenticated, service_role, dashboard_user;        
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA history to postgres, authenticated, service_role, dashboard_user;
    GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA history TO postgres, authenticated, service_role, dashboard_user;

    SELECT * INTO _other_user_id 
    FROM public.fn_seed_create_user('bob+other@support.dev', 'testing123');

    -- create the main user profile
    SELECT * INTO _other_profile_id
    FROM public.fn_profile_and_relationship_upsert(
      _other_user_id::uuid,
      NULL,
      NULL,
      NULL,
      NULL,
      CAST('Other' AS TEXT),
      CAST('User' AS TEXT),
      NULL,
      ARRAY['CLIENT', 'TEAM_OWNER']::role[],
      NULL);

     -- create a team owner (no CLIENT role)
    SELECT * INTO _team_owner_bob_team_user_id 
    FROM public.fn_seed_create_user('bob+teamownernotclient@support.dev', 'testing123');

    SELECT * INTO _team_owner_bob_team_profile_id
    FROM public.fn_profile_and_relationship_upsert(
      _team_owner_bob_team_user_id::uuid,       -- user id
      _profile_id,                              -- parent profile id
      NULL,                                     -- id
      NULL,                                     -- profile attributes
      '{"request_types": ["CHILD_CARE", "MEAL", "TRANSPORTATION"], "response_types": ["CHILD_CARE", "MEAL", "TRANSPORTATION"]}'::jsonb, -- relationship attributes
      CAST('Bob Team' AS TEXT),                 -- first name
      CAST('Owner Not CLIENT' AS TEXT),         -- last name
      NULL,                                     -- profile url
      ARRAY['TEAM_OWNER']::role[],              -- roles
      _team_id);

    -- create a home address
    SELECT * INTO _home_address_id
    FROM public.fn_address_upsert(
      CAST('Coral Gables' AS TEXT), CAST('' AS TEXT),
      _other_profile_id, CAST('FL' AS TEXT), CAST('1225 Mariana Ave' AS TEXT),
      'HOME', CAST('33134' AS TEXT),
      NULL, NULL, NULL
    );

    -- Add profile_location row for Deno row level policy tests
    INSERT INTO public.profile_location (profile_id, location, updated_at, updated_by)
    VALUES (_profile_id, '(123124124,2352352342)'::POINT, CURRENT_TIMESTAMP, _user_id::UUID);

    -- Add config row for Deno row level policy tests
    INSERT INTO public.config (id, value)
    VALUES ('DENO_TESTS', 'value1');

    ----------------------------------------------------------------------------------------------
    -- This section is to create random users. These users are not tied to any team. These users
    -- are mainly used to test rls access.
    -- Create a random user for every role (CLIENT, TEAM_OWNER, TEAM_ADMIN, HELPER)

    -- RANDOM CLIENT
    SELECT * INTO _random_client_user_id 
    FROM public.fn_seed_create_user('random_client@randomemail.com', 'testing123');

    -- create the main user profile
    SELECT * INTO _random_client_profile_id
    FROM public.fn_profile_and_relationship_upsert(
      _random_client_user_id::uuid,
      NULL,
      NULL,
      NULL,
      NULL,
      CAST('Random' AS TEXT),
      CAST('Client' AS TEXT),
      NULL,
      ARRAY['CLIENT']::role[],
      NULL);

    -- create a home address
    PERFORM public.fn_address_upsert(
      CAST('Coral Gables' AS TEXT), CAST('' AS TEXT),
      _random_client_profile_id, CAST('FL' AS TEXT), CAST('1225 Random Client Ave' AS TEXT),
      'HOME', CAST('33134' AS TEXT),
      NULL, NULL, NULL
    );

    -- Add profile_location row for Deno row level policy tests
    INSERT INTO public.profile_location (profile_id, location, updated_at, updated_by)
    VALUES (_random_client_profile_id, '(123124124,2352352342)'::POINT, CURRENT_TIMESTAMP, _random_client_user_id::UUID);

    -- RANDOM TEAM OWNER
    SELECT * INTO _random_team_owner_user_id 
    FROM public.fn_seed_create_user('random_team_owner@randomemail.com', 'testing123');

    -- create the main user profile
    SELECT * INTO _random_team_owner_profile_id
    FROM public.fn_profile_and_relationship_upsert(
      _random_team_owner_user_id::uuid,
      NULL,
      NULL,
      NULL,
      NULL,
      CAST('Random' AS TEXT),
      CAST('Team-Owner' AS TEXT),
      NULL,
      ARRAY['TEAM_OWNER']::role[],
      NULL);

    -- create a home address
    PERFORM public.fn_address_upsert(
      CAST('Coral Gables' AS TEXT), CAST('' AS TEXT),
      _random_team_owner_profile_id, CAST('FL' AS TEXT), CAST('1225 Random Team-Owner Ave' AS TEXT),
      'HOME', CAST('33134' AS TEXT),
      NULL, NULL, NULL
    );

    -- Add profile_location row for Deno row level policy tests
    INSERT INTO public.profile_location (profile_id, location, updated_at, updated_by)
    VALUES (_random_team_owner_profile_id, '(123124124,2352352342)'::POINT, CURRENT_TIMESTAMP, _random_team_owner_user_id::UUID);

    -- RANDOM TEAM ADMIN
    SELECT * INTO _random_team_admin_user_id 
    FROM public.fn_seed_create_user('random_team_admin@randomemail.com', 'testing123');

    -- create the main user profile
    SELECT * INTO _random_team_admin_profile_id
    FROM public.fn_profile_and_relationship_upsert(
      _random_team_admin_user_id::uuid,
      NULL,
      NULL,
      NULL,
      NULL,
      CAST('Random' AS TEXT),
      CAST('Team-Admin' AS TEXT),
      NULL,
      ARRAY['TEAM_ADMIN']::role[],
      NULL);

    -- create a home address
    PERFORM public.fn_address_upsert(
      CAST('Coral Gables' AS TEXT), CAST('' AS TEXT),
      _random_team_admin_profile_id, CAST('FL' AS TEXT), CAST('1225 Random Team-Admin Ave' AS TEXT),
      'HOME', CAST('33134' AS TEXT),
      NULL, NULL, NULL
    );

    -- Add profile_location row for Deno row level policy tests
    INSERT INTO public.profile_location (profile_id, location, updated_at, updated_by)
    VALUES (_random_team_admin_profile_id, '(123124124,2352352342)'::POINT, CURRENT_TIMESTAMP, _random_team_admin_user_id::UUID);

    -- RANDOM HELPER
    SELECT * INTO _random_helper_user_id 
    FROM public.fn_seed_create_user('random_helper@randomemail.com', 'testing123');

    -- create the main user profile
    SELECT * INTO _random_helper_profile_id
    FROM public.fn_profile_and_relationship_upsert(
      _random_helper_user_id::uuid,
      NULL,
      NULL,
      NULL,
      NULL,
      CAST('Random' AS TEXT),
      CAST('Helper' AS TEXT),
      NULL,
      ARRAY['HELPER']::role[],
      NULL);

    -- create a home address
    PERFORM public.fn_address_upsert(
      CAST('Coral Gables' AS TEXT), CAST('' AS TEXT),
      _random_helper_profile_id, CAST('FL' AS TEXT), CAST('1225 Random Helper Ave' AS TEXT),
      'HOME', CAST('33134' AS TEXT),
      NULL, NULL, NULL
    );

    -- Add profile_location row for Deno row level policy tests
    INSERT INTO public.profile_location (profile_id, location, updated_at, updated_by)
    VALUES (_random_helper_profile_id, '(123124124,2352352342)'::POINT, CURRENT_TIMESTAMP, _random_helper_user_id::UUID);

    -- create a meal resource matching company
    SELECT * INTO _company_id
    FROM public.fn_profile_and_relationship_upsert(
      NULL, -- user id
      NULL,  -- parent profile id
      NULL, -- id
      '{"website": "https://www.test.org/thursday-cafe/" }'::jsonb, -- profile attributes
      NULL, -- relationship attributes
      CAST('Thurday Cafe' AS TEXT), -- first name
      NULL, -- last name
      NULL, -- profile url
      ARRAY['COMPANY']::role[], -- roles
      NULL); -- team

    -- create a restaurant address
    SELECT * INTO _company_address_id
    FROM public.fn_address_upsert(
      CAST('Cambridge' AS TEXT), CAST('' AS TEXT),
      _company_id, CAST('MA' AS TEXT), CAST('11 Garden Street' AS TEXT),
      'RESTAURANT', CAST('33134' AS TEXT),
      NULL, NULL, CAST('First Church in Cambridge, Congregational, UCC' AS TEXT)
    );

    PERFORM public.fn_meal_information_upsert(
      _company_id,
      _company_address_id,
      NULL,
      'The Thursday Café, a weekly daytime drop-in program, offers a welcoming space where homeless and housed adults can gather and get to know each other. Serving an average of 100 guests a week, it offers food and coffee, rest and resources to people living on the margins—but most importantly, community. At the Friday Café, people experiencing a wide variety of life circumstances can relax, share a meal, and talk together as friends.',
      'Friday',
      '12PM - 3PM',
      false,
      NULL,
      ARRAY['LUNCH']::meal_type[],
      ARRAY['DINE_IN']::meal_delivery_method[],
      NULL
    );
END $$;
