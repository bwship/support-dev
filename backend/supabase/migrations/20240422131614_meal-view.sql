CREATE OR REPLACE VIEW public.vw_lookup_meal_type WITH (security_invoker = on) AS
  SELECT unnest(enum_range(NULL::meal_type)) AS meal_type;

CREATE OR REPLACE VIEW public.vw_lookup_meal_delivery_method WITH (security_invoker = on) AS
  SELECT unnest(enum_range(NULL::meal_delivery_method)) AS meal_delivery_method;

CREATE OR REPLACE VIEW public.vw_meal_information AS
  SELECT
    A.id,
    A.profile_id,
    A.address_id,
    to_jsonb(B) AS profile,
    to_jsonb(C) AS address,
    A.description,
    A.working_days,
    A.working_hours,
    A.requires_eligibility,
    A.eligibility_rules,
    A.meal_type,
    A.meal_delivery_method,
    A.is_active,
    A.created_at,
    A.created_by,
    A.deleted_at,
    A.deleted_by,
    A.updated_at,
    A.updated_by
  FROM public.meal_information AS A
  LEFT JOIN public.vw_profile AS B
    ON A.profile_id = B.id
  LEFT JOIN public.vw_address AS C
    ON A.address_id = C.id;
