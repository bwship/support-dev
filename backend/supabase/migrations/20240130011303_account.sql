CREATE TABLE public.account (
  id SERIAL NOT NULL,
  team_id INTEGER REFERENCES public.team(id),
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT account_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.account IS 'An account associated with a team that can be used to purchase things such as transportation and meals.';

CREATE TABLE history.account_history (
  id SERIAL NOT NULL,
  original_id INT,
  team_id INTEGER,
  balance INTEGER,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT account_history_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE history.account_history IS 'Change data capture table for public.account';

CREATE OR REPLACE FUNCTION fn_account_history() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO history.account_history (
    original_id, team_id, balance,
    created_at, created_by, deleted_at, deleted_by, updated_at, updated_by
  ) VALUES (NEW.id, NEW.team_id, NEW.balance,
    NEW.created_at, NEW.created_by, NEW.deleted_at, NEW.deleted_by, NEW.updated_at, NEW.updated_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_account_history
  AFTER INSERT OR UPDATE ON account
  FOR EACH ROW EXECUTE PROCEDURE fn_account_history();

CREATE TABLE public.account_transaction (
  id SERIAL NOT NULL,
  account_id INTEGER REFERENCES public.account(id),
  profile_id INTEGER REFERENCES public.profile(id),
  amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT account_transaction_pkey PRIMARY KEY (id)
);

CREATE TABLE history.account_transaction_history (
  id SERIAL NOT NULL,
  original_id INT,
  account_id INTEGER,
  profile_id INTEGER,
  amount INTEGER,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT account_transaction_history_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE history.account_transaction_history IS 'Change data capture table for public.account_transaction';

CREATE OR REPLACE FUNCTION fn_account_transaction_history() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO history.account_transaction_history (
    original_id, account_id, profile_id, amount,
    created_at, created_by, deleted_at, deleted_by, updated_at, updated_by
  ) VALUES (NEW.id, NEW.account_id, NEW.profile_id, NEW.amount,
    NEW.created_at, NEW.created_by, NEW.deleted_at, NEW.deleted_by, NEW.updated_at, NEW.updated_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_account_transaction_history
  AFTER INSERT OR UPDATE ON account_transaction
  FOR EACH ROW EXECUTE PROCEDURE fn_account_transaction_history();

/* Account History Table RLS */

-- Allow inserts from authenticated users
CREATE POLICY account_history_insert_policy ON history.account_history
FOR INSERT TO authenticated WITH CHECK (true);

-- Deny SELECT for the table
CREATE POLICY account_history_deny_select_policy ON history.account_history
FOR SELECT TO public USING (false);

-- Deny UPDATE and DELETE for the table for all roles
CREATE POLICY account_history_deny_update_policy
ON history.account_history FOR UPDATE TO public USING (false);

CREATE POLICY account_history_deny_delete_policy
ON history.account_history FOR DELETE TO public USING (false);

ALTER TABLE history.account_history ENABLE ROW LEVEL SECURITY;

/* Account Transaction History Table RLS */

-- Allow inserts from authenticated users
CREATE POLICY account_transaction_history_insert_policy ON history.account_transaction_history
FOR INSERT TO authenticated WITH CHECK (true);

-- Deny SELECT for the table
CREATE POLICY account_transaction_history_deny_select_policy ON history.account_transaction_history
FOR SELECT TO public USING (false);

-- Deny UPDATE and DELETE for the table for all roles
CREATE POLICY account_transaction_history_deny_update_policy
ON history.account_transaction_history FOR UPDATE TO public USING (false);

CREATE POLICY account_transaction_history_deny_delete_policy
ON history.account_transaction_history FOR DELETE TO public USING (false);

ALTER TABLE history.account_transaction_history ENABLE ROW LEVEL SECURITY;

/* Account Table RLS */

-- For INSERT
CREATE POLICY account_insert_policy ON public.account
FOR INSERT TO authenticated WITH CHECK (true);

-- For UPDATE
CREATE POLICY account_update_policy ON public.account
FOR UPDATE TO authenticated WITH CHECK (true);

ALTER TABLE public.account ENABLE ROW LEVEL SECURITY;

/* Account Transaction Table RLS */

-- For INSERT
CREATE POLICY account_transaction_insert_policy ON public.account_transaction
FOR INSERT TO authenticated WITH CHECK (true);

-- For UPDATE
CREATE POLICY account_transaction_update_policy ON public.account_transaction
FOR UPDATE TO authenticated WITH CHECK (true);

ALTER TABLE public.account_transaction ENABLE ROW LEVEL SECURITY;

-- update fn_profile_and_relationship_upsert to create an account if the user is a team owner and doesn't have one
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
      -- and also create their account that is associated with the team
      IF 'TEAM_OWNER' = ANY(_roles) AND _team_id IS NULL THEN
        INSERT INTO public.team (name, created_by)
        VALUES (COALESCE(_first_name, '') || '’s Team', fn_get_authenticated_user_id())
        RETURNING id INTO _team_id;

        INSERT INTO public.account (team_id, created_by)
        VALUES (_team_id, fn_get_authenticated_user_id());
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

CREATE OR REPLACE FUNCTION fn_account_upsert (
  _account_id INTEGER,
  _profile_id INTEGER,
  _amount INTEGER
) RETURNS INTEGER AS $$
BEGIN
  UPDATE public.account
  SET balance = balance + _amount,
    updated_by = fn_get_authenticated_user_id(),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = _account_id;

  INSERT INTO public.account_transaction (account_id, profile_id, amount, created_by)
  VALUES (_account_id, _profile_id, _amount, fn_get_authenticated_user_id());

  RETURN _account_id;
END;
$$ LANGUAGE plpgsql;