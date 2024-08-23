DO $$ 
DECLARE 
    _profile_id INTEGER;
    _user_id TEXT;
BEGIN 
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
      CAST('Support' AS TEXT),
      CAST('Admin' AS TEXT),
      NULL,
      ARRAY['ADMIN', 'TEAM_OWNER']::role[],
      NULL);
END $$;
