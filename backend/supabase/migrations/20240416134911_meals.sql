ALTER TYPE role ADD VALUE 'COMPANY';

INSERT INTO public.lookup_address_type (id, description, created_by) VALUES ('CHURCH', 'Church', fn_get_authenticated_user_id());
INSERT INTO public.lookup_address_type (id, description, created_by) VALUES ('FOOD_PANTRY', 'Food Pantry', fn_get_authenticated_user_id());
INSERT INTO public.lookup_address_type (id, description, created_by) VALUES ('RESTAURANT', 'Restaurant', fn_get_authenticated_user_id());

CREATE TYPE meal_type AS ENUM (
  'BRUNCH',
  'BREAKFAST',
  'DINNER',
  'FOOD_PANTRY',
  'LUNCH',
  'UNKNOWN'
);

CREATE TYPE meal_delivery_method AS ENUM (
  'DELIVERY',
  'DINE_IN',
  'TAKEOUT',
  'UNKNOWN'
);

-- Meal Information Table
CREATE TABLE public.meal_information (
  id SERIAL NOT NULL,
  profile_id INT REFERENCES public.profile,
  address_id INT REFERENCES public.address,
  attributes JSONB,
  description TEXT,
  working_days TEXT,
  working_hours TEXT,
  requires_eligibility BOOLEAN NOT NULL DEFAULT false,
  eligibility_rules TEXT,
  meal_type meal_type[],
  meal_delivery_method meal_delivery_method[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT meal_information_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.meal_information IS 'A company can offer cancer patients free meals to help them during their treatment.  This holds the information about it.';

-- Meal Information History Table
CREATE TABLE history.meal_information_history (
  id SERIAL NOT NULL,
  original_id INT,
  profile_id INT,
  address_id INT,
  attributes JSONB,
  description TEXT,
  working_days TEXT,
  working_hours TEXT,
  requires_eligibility BOOLEAN NOT NULL DEFAULT false,
  eligibility_rules TEXT,
  meal_type meal_type[],
  meal_delivery_method meal_delivery_method[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid,

  CONSTRAINT meal_information_history_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE history.meal_information_history IS 'Change data capture table for public.meal_information.';

CREATE OR REPLACE FUNCTION fn_meal_information_history() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO history.meal_information_history(
    original_id, profile_id, address_id, attributes,
    description, working_days, working_hours,
    requires_eligibility, eligibility_rules, meal_type,
    meal_delivery_method, is_active,
    created_at, created_by, deleted_at, deleted_by, updated_at, updated_by
  ) VALUES (
    NEW.id, NEW.profile_id, NEW.address_id, NEW.attributes,
    NEW.description, NEW.working_days, NEW.working_hours,
    NEW.requires_eligibility, NEW.eligibility_rules, NEW.meal_type,
    NEW.meal_delivery_method, NEW.is_active,
    NEW.created_at, NEW.created_by, NEW.deleted_at, NEW.deleted_by, NEW.updated_at, NEW.updated_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_meal_information_history
  AFTER INSERT OR UPDATE ON meal_information
  FOR EACH ROW EXECUTE PROCEDURE fn_meal_information_history();

CREATE OR REPLACE FUNCTION fn_meal_information_upsert(
  _profile_id INT,
  _address_id INT,
  _attributes JSONB,
  _description TEXT,
  _working_days TEXT,
  _working_hours TEXT,
  _requires_eligibility BOOLEAN,
  _eligibility_rules TEXT,
  _meal_type meal_type[],
  _meal_delivery_method meal_delivery_method[],
  _id INTEGER DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  _new_id INTEGER;
BEGIN
    IF _id IS NOT NULL THEN
      UPDATE public.meal_information
      SET profile_id = _profile_id,
        address_id = _address_id,
        attributes = _attributes,
        description = _description,
        working_days = _working_days,
        working_hours = _working_hours,
        requires_eligibility = _requires_eligibility,
        eligibility_rules = _eligibility_rules,
        meal_type = _meal_type,
        meal_delivery_method = _meal_delivery_method,
        updated_by = fn_get_authenticated_user_id(),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = _id;

      -- Set _new_id to _id to return back
      _new_id := _id;
    ELSE
      INSERT INTO public.meal_information(id, profile_id, address_id, attributes,
        description, working_days, working_hours, requires_eligibility,
        eligibility_rules, meal_type, meal_delivery_method, created_by)
      VALUES (
        COALESCE(_id, nextval('meal_information_id_seq')),
        _profile_id,
        _address_id,
        _attributes,
        _description,
        _working_days,
        _working_hours,
        _requires_eligibility,
        _eligibility_rules,
        _meal_type,
        _meal_delivery_method,
        fn_get_authenticated_user_id()
      )
      RETURNING id INTO _new_id;
    END IF;

    -- Return the meal_information id
    RETURN _new_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_meal_information_deactivate (
  _id INTEGER
) RETURNS void AS $$
BEGIN
    UPDATE public.meal_information
    SET is_active = false,
      deleted_at = CURRENT_TIMESTAMP,
      deleted_by = fn_get_authenticated_user_id()
    WHERE id = _id;
END;
$$ LANGUAGE plpgsql;

-- left outer join team, as these aren't for a team
CREATE OR REPLACE VIEW public.vw_address WITH (security_invoker = on) AS
  SELECT
    A.id,
    A.city,
    A.description,
    A.is_active,
    A.location,
    A.profile_id,
    A.state,
    A.street_address_1,
    A.street_address_2,
    A.type,
    A.zip,
    B.user_id,
    C.team_id,
    D.name AS team_name,
    A.created_at,
    A.created_by,
    A.deleted_at,
    A.deleted_by,
    A.updated_at,
    A.updated_by
  FROM public.address AS A
  INNER JOIN public.profile AS B
    ON A.profile_id = B.id
  INNER JOIN public.relationship AS C
    ON A.profile_id = C.profile_id
  LEFT OUTER JOIN public.team AS D
    ON C.team_id = D.id;
