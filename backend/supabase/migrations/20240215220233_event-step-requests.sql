-- Drop views and then recreate them
DROP VIEW public.vw_event_helper;
DROP VIEW public.vw_event_step;

-- Add in the team_id and start_date to make for easier querying
CREATE OR REPLACE VIEW public.vw_event_step WITH (security_invoker = on) AS
  SELECT
    A.id,
    A.event_id,
    A.is_active,
    A.notes,
    A.type,
    CASE WHEN A.type = 'TRANSPORTATION' THEN A.attributes END AS transportation_attributes,
    CASE WHEN A.type = 'MEAL' THEN A.attributes END AS meal_attributes,
    CASE WHEN A.type = 'CHILD_CARE' THEN A.attributes END AS child_care_attributes,
    B.team_id,
    B.start_date,
    COALESCE(
      ARRAY_AGG(
        JSON_BUILD_OBJECT(
          'id', C.id,
          'ranking', C.ranking,
          'profile_id', C.profile_id,
          'status', C.status
        )
      ) FILTER (WHERE C.id IS NOT NULL), ARRAY[]::json[]
    ) AS requests,
    A.created_at,
    A.created_by,
    A.deleted_at,
    A.deleted_by,
    A.updated_at,
    A.updated_by
  FROM public.event_step AS A
  INNER JOIN public.event AS B
   ON A.event_id = B.id
  LEFT JOIN event_step_request C
    ON A.id = C.event_step_id
  GROUP BY A.id, A.event_id, A.is_active, A.attributes, A.type, B.team_id, B.start_date;


-- recreate this view from the other views
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
