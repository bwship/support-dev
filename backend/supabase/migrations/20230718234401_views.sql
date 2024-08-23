CREATE TABLE public.user (
  id UUID NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  phone_change TEXT,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  phone_confirmed_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT user_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.user IS 'This is a copy of the auth.users table, with only the records we need for the vw_profile.  It gets populated by a trigger on the auth.users table.';

CREATE OR REPLACE FUNCTION fn_user_copy() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user (id, email, phone, phone_change, email_confirmed_at, phone_confirmed_at)
  VALUES (NEW.id, NEW.email, NEW.phone, NEW.phone_change, NEW.email_confirmed_at, NEW.phone_confirmed_at)
  ON CONFLICT (id) -- Assuming "id" is the primary key or a unique constraint
  DO UPDATE SET
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    phone_change = EXCLUDED.phone_change,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    phone_confirmed_at = EXCLUDED.phone_confirmed_at;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql security definer;

CREATE TRIGGER tr_user_copy
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.fn_user_copy();

CREATE OR REPLACE FUNCTION fn_rls_policy_is_user_accessible(_id UUID)
  RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    _team_id INTEGER;
BEGIN
    -- Get the team_id for the current user
    SELECT A.team_id INTO _team_id
    FROM relationship AS A
    WHERE profile_id = (SELECT id
                        FROM public.profile
                        WHERE user_id = _id);

    -- Check if the user being accessed is part of the same team
    RETURN EXISTS (
        SELECT 1
        FROM relationship AS A
        WHERE A.profile_id = (SELECT id
                              FROM public.profile
                              WHERE user_id = _id)
          AND A.team_id = _team_id
    );
END;
$$;

CREATE POLICY user_select_policy ON public.user
FOR SELECT TO authenticated
USING (id = auth.uid()
       OR fn_rls_policy_is_user_accessible(id));

-- Deny INSERT, UPDATE, and DELETE for the table
CREATE POLICY user_insert_policy ON public.user
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY user_update_policy ON public.user
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY user_deny_delete_policy
ON public.user FOR DELETE TO public USING (false);

ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;

CREATE VIEW public.vw_user WITH (security_invoker = on) AS
  SELECT *
  FROM public.user;

-- Create the vw_profile view
CREATE OR REPLACE VIEW public.vw_profile WITH (security_invoker = on) AS
  SELECT
    A.id,
    A.user_id,
    A.attributes,
    A.first_name,
    A.is_active,
    A.last_name,
    A.profile_url,
    B.email,
    CASE
      WHEN B.phone IS NULL THEN B.phone_change
      ELSE B.phone
    END AS phone,
    CASE
      WHEN B.email_confirmed_at IS NULL THEN true
      ELSE false
    END AS is_email_pending,
    B.email_confirmed_at,
    CASE
      WHEN B.phone_confirmed_at IS NULL THEN true
      ELSE false
    END AS is_phone_pending,
    B.phone_confirmed_at,
     ARRAY(
      SELECT DISTINCT unnest(R.roles) FROM public.relationship R WHERE R.profile_id = A.id
    ) AS roles,
    A.created_at,
    A.created_by,
    A.deleted_at,
    A.deleted_by,
    A.updated_at,
    A.updated_by
  FROM public.profile AS A
  LEFT OUTER JOIN public.vw_user AS B
    ON A.user_id = B.id;

CREATE OR REPLACE VIEW public.vw_profile_team WITH (security_invoker = on) AS
  SELECT A.id,
    A.user_id,
    A.attributes,
    A.first_name,
    A.last_name,
    A.is_active,
    A.email,
    A.phone,
    A.is_email_pending,
    A.email_confirmed_at,
    A.is_phone_pending,
    A.profile_url,
    B.attributes AS relationship_attributes,
    A.phone_confirmed_at,
    B.profile_id,
    C.id AS parent_profile_id,
    C.user_id AS parent_user_id,
    B.roles,
    B.team_id,
    D.name AS team_name,
    A.created_by,
    A.created_at
  FROM public.vw_profile AS A
  INNER JOIN public.relationship AS B
    ON A.id = B.profile_id
  LEFT OUTER JOIN public.profile AS C
    ON B.parent_profile_id = C.id
  INNER JOIN team AS D
    ON B.team_id = D.id;

CREATE OR REPLACE VIEW public.vw_event WITH (security_invoker = on) AS
  SELECT *
  FROM public.event;

CREATE OR REPLACE VIEW public.vw_event_step WITH (security_invoker = on) AS
  SELECT
    id,
    event_id,
    is_active,
    notes,
    type,
    CASE WHEN type = 'TRANSPORTATION' THEN attributes END AS transportation_attributes,
    CASE WHEN type = 'MEAL' THEN attributes END AS meal_attributes,
    CASE WHEN type = 'CHILD_CARE' THEN attributes END AS child_care_attributes,
    created_at,
    created_by,
    deleted_at,
    deleted_by,
    updated_at,
    updated_by
  FROM public.event_step;

CREATE OR REPLACE VIEW public.vw_event_step_request WITH (security_invoker = on) AS
  SELECT
    A.id,
    A.event_step_id,
    A.team_id,
    A.notes,
    A.profile_id,
    A.status,
    A.ranking,
    B.event_id,
    A.created_at,
    A.created_by,
    A.deleted_at,
    A.deleted_by,
    A.updated_at,
    A.updated_by
  FROM public.event_step_request AS A
  INNER JOIN public.event_step AS B
    ON A.event_step_id = B.id;

CREATE OR REPLACE VIEW public.vw_event_with_steps WITH (security_invoker = on) AS
  SELECT
    A.id,
    A.description,
    A.is_active,
    A.name,
    A.team_id,
    A.start_date,
    CASE
      WHEN COUNT(B.id) > 0 THEN ARRAY_AGG(
        JSON_BUILD_OBJECT(
          'id', B.id,
          'is_active', B.is_active,
          'attributes', B.attributes,
          'type', B.type,
          'requests', B.requests
        )
      )
      ELSE ARRAY[]::json[]
    END AS event_steps
  FROM public.vw_event AS A
  LEFT JOIN LATERAL (
      SELECT
        B1.id,
        B1.event_id,
        B1.is_active,
        B1.attributes,
        B1.type,
        COALESCE(
          ARRAY_AGG(
            JSON_BUILD_OBJECT(
              'id', C.id,
              'ranking', C.ranking,
              'profile_id', C.profile_id,
              'status', C.status
            )
          ) FILTER (WHERE C.id IS NOT NULL), ARRAY[]::json[]
        ) AS requests
      FROM public.event_step B1
      LEFT JOIN event_step_request C
        ON B1.id = C.event_step_id
      WHERE A.id = B1.event_id
      GROUP BY B1.id, B1.event_id, B1.is_active, B1.attributes, B1.type
    ) B ON TRUE
  WHERE A.id = B.event_id
  GROUP BY
    A.id,
    A.description,
    A.is_active,
    A.name,
    A.team_id,
    A.start_date;

CREATE OR REPLACE VIEW vw_event_helper WITH (security_invoker = on) AS
  SELECT A.*,
         ARRAY_AGG(DISTINCT C.profile_id) AS helper_ids
  FROM vw_event AS A
  JOIN vw_event_step AS B
    ON A.id = B.event_id
  INNER JOIN vw_event_step_request AS C
    ON B.id = C.event_step_id
  WHERE A.is_active = true
    AND B.is_active = true
  GROUP BY A.id, A.description, A.is_active, A.name,
    A.team_id, A.start_date, A.created_at, A.created_by,
    A.deleted_at, A.deleted_by, A.updated_at, A.updated_by;

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
  INNER JOIN public.team AS D
    ON C.team_id = D.id;

-- Create the vw_notification view
CREATE OR REPLACE VIEW public.vw_notification WITH (security_invoker = on) AS
  SELECT *
  FROM public.notification;

-- Create the role view based off the enum 
CREATE OR REPLACE VIEW public.vw_lookup_role WITH (security_invoker = on) AS
  SELECT unnest(enum_range(NULL::role)) AS role;

-- Create the step_type view based off the enum 
CREATE OR REPLACE VIEW public.vw_lookup_step_type WITH (security_invoker = on) AS
  SELECT id, description, is_active, created_at, created_by,
    deleted_at, deleted_by, updated_at, updated_by
  FROM public.lookup_step_type;

-- Create the invite_status view based off the enum 
CREATE OR REPLACE VIEW public.vw_lookup_invite_status WITH (security_invoker = on) AS
  SELECT id, description, is_active, created_at, created_by,
    deleted_at, deleted_by, updated_at, updated_by
  FROM public.lookup_invite_status;

-- Create the address_type view based off the enum 
CREATE OR REPLACE VIEW public.vw_lookup_address_type WITH (security_invoker = on) AS
  SELECT id, description, is_active, created_at, created_by,
    deleted_at, deleted_by, updated_at, updated_by
  FROM public.lookup_address_type;

-- Create the transportation rule view based off the enum 
CREATE OR REPLACE VIEW public.vw_lookup_transportation_rule WITH (security_invoker = on) AS
  SELECT id, description, is_active, created_at, created_by,
    deleted_at, deleted_by, updated_at, updated_by
  FROM public.lookup_transportation_rule;

-- Create the family member type view based off the enum 
CREATE OR REPLACE VIEW public.vw_lookup_family_member_type WITH (security_invoker = on) AS
  SELECT id, description, is_active, created_at, created_by,
    deleted_at, deleted_by, updated_at, updated_by
  FROM public.lookup_family_member_type;

-- Create the pet type view based off the enum 
CREATE OR REPLACE VIEW public.vw_lookup_pet_type WITH (security_invoker = on) AS
  SELECT id, description, is_active, created_at, created_by,
    deleted_at, deleted_by, updated_at, updated_by
  FROM public.lookup_pet_type;
