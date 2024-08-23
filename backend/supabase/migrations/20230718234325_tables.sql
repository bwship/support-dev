DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'history') THEN 
        CREATE SCHEMA history;
    END IF; 
END $$;

-- Profile Table
CREATE TABLE public.profile (
  id SERIAL NOT NULL,
  user_id UUID REFERENCES auth.users,
  attributes JSONB,
  first_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_name TEXT,
  profile_url TEXT,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT profile_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.profile IS 'A profile for a user of the system. It contains their name, profile image URL, roles, etc.';

-- Profile History Table
CREATE TABLE history.profile_history (
  id SERIAL NOT NULL,
  original_id INT,
  user_id uuid,
  attributes JSONB,
  first_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_name TEXT,
  profile_url TEXT,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid,

  CONSTRAINT profile_history_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE history.profile_history IS 'Change data capture table for public.profile';

CREATE OR REPLACE FUNCTION fn_profile_history() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO history.profile_history(
    original_id, user_id, attributes,  
    first_name, is_active, last_name, profile_url,
    created_at, created_by, deleted_at, deleted_by, updated_at, updated_by
  ) VALUES (
    NEW.id, NEW.user_id, NEW.attributes, 
    NEW.first_name, NEW.is_active, NEW.last_name, NEW.profile_url,
    NEW.created_at, NEW.created_by, NEW.deleted_at, NEW.deleted_by, NEW.updated_at, NEW.updated_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profile_history
  AFTER INSERT OR UPDATE ON profile
  FOR EACH ROW EXECUTE PROCEDURE fn_profile_history();

-- Team Table
CREATE TABLE public.team (
  id SERIAL NOT NULL,
  name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT team_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.team IS 'A ralliers team that a client, helper, family member, etc. belong to';

-- Team History Table
CREATE TABLE history.team_history (
  id SERIAL NOT NULL,
  original_id INT,
  name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid,

  CONSTRAINT team_history_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE history.team_history IS 'Change data capture table for the public.team table';

CREATE OR REPLACE FUNCTION fn_team_history() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO history.team_history(
    original_id, name, is_active, 
    created_at, created_by, deleted_at, deleted_by, updated_at, updated_by
  ) VALUES (
    NEW.id, NEW.name, NEW.is_active,
    NEW.created_at, NEW.created_by, NEW.deleted_at, NEW.deleted_by, NEW.updated_at, NEW.updated_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_team_history
  AFTER INSERT OR UPDATE ON team
  FOR EACH ROW EXECUTE PROCEDURE fn_team_history();

-- Address Table
CREATE TABLE public.address (
  id SERIAL NOT NULL,
  city TEXT NOT NULL,
  description TEXT,
  is_active BOOL NOT NULL DEFAULT true,
  location POINT,
  profile_id INTEGER REFERENCES public.profile,
  state TEXT NOT NULL,
  street_address_1 TEXT NOT NULL,
  street_address_2 TEXT,
  type TEXT REFERENCES public.lookup_address_type,
  zip TEXT NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT address_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.address IS 'Physical addresses for profile/users of the system.  Like home, hospital, doctors, etc.';

-- Address History Table
CREATE TABLE history.address_history (
  id SERIAL NOT NULL,
  original_id INT,
  city TEXT NOT NULL,
  description TEXT,
  is_active BOOL NOT NULL DEFAULT true,
  location POINT,
  profile_id INTEGER,
  state TEXT NOT NULL,
  street_address_1 TEXT NOT NULL,
  street_address_2 TEXT,
  type TEXT,
  zip TEXT NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid,

  CONSTRAINT address_history_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE history.address_history IS 'Change data capture for the public.address table';

CREATE OR REPLACE FUNCTION fn_address_history() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO history.address_history(
    original_id, city, description, is_active, location, profile_id, state, 
    street_address_1, street_address_2, type, zip, created_at, created_by, 
    deleted_at, deleted_by, updated_at, updated_by
  ) VALUES (
    NEW.id, NEW.city, NEW.description, NEW.is_active, NEW.location, NEW.profile_id, NEW.state,
    NEW.street_address_1, NEW.street_address_2, NEW.type, NEW.zip, NEW.created_at, NEW.created_by,
    NEW.deleted_at, NEW.deleted_by, NEW.updated_at, NEW.updated_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_address_history
  AFTER INSERT OR UPDATE ON address
  FOR EACH ROW EXECUTE PROCEDURE fn_address_history();

-- relationship table
CREATE TABLE public.relationship (
  id SERIAL NOT NULL,
  attributes JSONB,
  is_active BOOL NOT NULL DEFAULT true,
  profile_id INTEGER REFERENCES public.profile,
  parent_profile_id INTEGER REFERENCES public.profile,
  team_id INTEGER REFERENCES public.team,
  roles role[],

  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT relationship_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.relationship IS 'Defines relationships between different profiles/users in the system.  For instance a helper of a client, or a family member/dependent of a client.';

-- relationship history table
CREATE TABLE history.relationship_history (
  id SERIAL NOT NULL,
  original_id INT,
  attributes JSONB,
  is_active BOOL NOT NULL DEFAULT true,
  profile_id INTEGER,
  parent_profile_id INTEGER,
  team_id INTEGER,
  roles role[],
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid,

  CONSTRAINT relationship_history_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE history.relationship_history IS 'Change data capture for the public.relationship table';

CREATE OR REPLACE FUNCTION fn_relationship_history() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO history.relationship_history(
    original_id, is_active, attributes, profile_id,
    parent_profile_id, team_id, roles,
    created_at, created_by, deleted_at, deleted_by, updated_at, updated_by
  ) VALUES (
    NEW.id, NEW.is_active, NEW.attributes, NEW.profile_id,
    NEW.parent_profile_id, NEW.team_id, NEW.roles,
    NEW.created_at, NEW.created_by, NEW.deleted_at, NEW.deleted_by, NEW.updated_at, NEW.updated_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_relationship_history
  AFTER INSERT OR UPDATE ON relationship
  FOR EACH ROW EXECUTE PROCEDURE fn_relationship_history();

-- event table
CREATE TABLE public.event (
  id SERIAL NOT NULL,
  description TEXT,
  is_active BOOL NOT NULL DEFAULT true,
  name TEXT NOT NULL,
  team_id INTEGER REFERENCES public.team,
  start_date TEXT,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT event_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.event IS 'Base table for the events that users in the system have for child care, meals, transportation, etc.';

-- event history table
CREATE TABLE history.event_history (
  id SERIAL NOT NULL,
  original_id INT,
  description TEXT,
  is_active BOOL NOT NULL DEFAULT true,
  name TEXT NOT NULL,
  team_id INTEGER,
  start_date TEXT,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid,

  CONSTRAINT event_history_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE history.event_history IS 'Change data capture for the public.event table';

CREATE OR REPLACE FUNCTION fn_event_history() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO history.event_history (
    original_id, description, is_active, name, team_id, start_date,
    created_at, created_by, deleted_at, deleted_by, updated_at, updated_by
  ) VALUES (
    NEW.id, NEW.description, NEW.is_active, NEW.name, NEW.team_id, NEW.start_date,
    NEW.created_at, NEW.created_by, NEW.deleted_at, NEW.deleted_by, NEW.updated_at, NEW.updated_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_event_history
  AFTER INSERT OR UPDATE ON event
  FOR EACH ROW EXECUTE PROCEDURE fn_event_history();

-- Event Step Table
CREATE TABLE public.event_step (
  id SERIAL NOT NULL,
  attributes JSONB,
  event_id INTEGER NOT NULL REFERENCES public.event,
  is_active BOOL NOT NULL DEFAULT true,
  notes TEXT,
  parent_step_id INTEGER REFERENCES public.event_step,
  type TEXT REFERENCES public.lookup_step_type,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT event_step_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.event_step IS 'One instance of a child care, meal, or transportation step within an event';

-- Event Step History Table
CREATE TABLE history.event_step_history (
  id SERIAL NOT NULL,
  original_id INTEGER NOT NULL,
  attributes JSONB,
  event_id INTEGER NOT NULL,
  is_active BOOL NOT NULL DEFAULT true,
  notes TEXT,
  parent_step_id INTEGER,
  type TEXT REFERENCES public.lookup_step_type,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid,

  CONSTRAINT event_step_history_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE history.event_step_history IS 'Change data capture for the public.event_step table';

CREATE OR REPLACE FUNCTION fn_event_step_history() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO history.event_step_history (
    original_id, attributes, event_id, is_active, notes, parent_step_id, type, 
    created_at, created_by, deleted_at, deleted_by, updated_at, updated_by
  ) VALUES (
    NEW.id, NEW.attributes, NEW.event_id, NEW.is_active, NEW.notes, NEW.parent_step_id, NEW.type,
    NEW.created_at, NEW.created_by, NEW.deleted_at, NEW.deleted_by, NEW.updated_at, NEW.updated_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_event_step_history
  AFTER INSERT OR UPDATE ON event_step
  FOR EACH ROW EXECUTE PROCEDURE fn_event_step_history();

-- Event Step Request
CREATE TABLE public.event_step_request (
  id SERIAL NOT NULL,
  event_step_id INTEGER NOT NULL REFERENCES public.event_step,
  team_id INTEGER NOT NULL REFERENCES public.team,
  notes TEXT,
  ranking INTEGER,
  profile_id INTEGER NOT NULL REFERENCES public.profile,
  status TEXT NOT NULL REFERENCES public.lookup_invite_status,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT event_step_request_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.event_step_request IS 'A request for a helper to fulfill an event step in the system like providing child care, meals, or transportation';

-- Event Step Request History
CREATE TABLE history.event_step_request_history (
  id SERIAL NOT NULL,
  original_id INTEGER NOT NULL,
  event_step_id INTEGER NOT NULL,
  team_id INTEGER NOT NULL,
  notes TEXT,
  ranking INTEGER,
  profile_id INTEGER NOT NULL,
  status TEXT NOT NULL REFERENCES public.lookup_invite_status,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid,

  CONSTRAINT event_step_request_history_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE history.event_step_request_history IS 'Change data capture for the public.event_step_request_history table';

CREATE OR REPLACE FUNCTION fn_event_step_request_history() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO history.event_step_request_history (
    original_id, event_step_id, team_id, notes, ranking, profile_id, status, 
    created_at, created_by, deleted_at, deleted_by, updated_at, updated_by
  ) VALUES (
    NEW.id, NEW.event_step_id, NEW.team_id, NEW.notes, NEW.ranking, NEW.profile_id, NEW.status, 
    NEW.created_at, NEW.created_by, NEW.deleted_at, NEW.deleted_by, NEW.updated_at, NEW.updated_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_event_step_request_history
  AFTER INSERT OR UPDATE ON event_step_request
FOR EACH ROW EXECUTE PROCEDURE fn_event_step_request_history();

-- Config table
CREATE TABLE public.config (
  id TEXT,
  value TEXT,
  value_config JSONB,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT config_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.config IS 'Configuration settings for the system, should be replaced by vault soon';

-- Config History
CREATE TABLE history.config_history (
  id SERIAL NOT NULL,
  original_id TEXT NOT NULL,
  value TEXT,
  value_config JSONB,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid,

  CONSTRAINT config_history_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE history.config_history IS 'Change data capture for the public.config_history table';

CREATE OR REPLACE FUNCTION fn_config_history() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO history.config_history (
    original_id, value, value_config,
    created_at, created_by, deleted_at, deleted_by, updated_at, updated_by
  ) VALUES (
    NEW.id, NEW.value, NEW.value_config,
    NEW.created_at, NEW.created_by, NEW.deleted_at, NEW.deleted_by, NEW.updated_at, NEW.updated_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_config_history
  AFTER INSERT OR UPDATE ON config
FOR EACH ROW EXECUTE PROCEDURE fn_config_history();

-- Profile Location table
CREATE TABLE public.profile_location (
    profile_id INTEGER REFERENCES public.profile,
    location POINT,
    updated_at TIMESTAMPTZ(3),
    updated_by uuid,

    CONSTRAINT profile_location_pkey PRIMARY KEY (profile_id)
);

COMMENT ON TABLE public.profile_location IS 'The last known geolocation of a profile/user.';

CREATE TABLE history.profile_location_history (
    id SERIAL NOT NULL, 
    profile_id INTEGER,
    location POINT,
    updated_at TIMESTAMPTZ(3),
    updated_by uuid,

    CONSTRAINT profile_location_pkey_history_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE history.profile_location_history IS 'Change data capture for the public.profile_location table';

CREATE OR REPLACE FUNCTION fn_profile_location_history() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO history.profile_location_history (
        profile_id, 
        location,
        updated_at,
        updated_by
    ) VALUES (
        NEW.profile_id, 
        NEW.location,
        NEW.updated_at,
        NEW.updated_by
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profile_location_history
    AFTER INSERT OR UPDATE ON profile_location
    FOR EACH ROW EXECUTE PROCEDURE fn_profile_location_history();
  
-- Event Processing Table
CREATE TABLE event_processing (
  id SERIAL NOT NULL,
  event_id INTEGER NOT NULL REFERENCES public.event,    
  status TEXT NOT NULL REFERENCES public.lookup_event_processing_status,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,
  deactivated_at TIMESTAMPTZ(3),
  deactivated_by uuid REFERENCES auth.users,
  
  CONSTRAINT event_processing_pkey PRIMARY KEY (id)
);

-- Notification Table
CREATE TABLE notification (
  id SERIAL NOT NULL,  
  profile_id INTEGER NOT NULL,
  subject TEXT DEFAULT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL REFERENCES public.lookup_notification_status,
  channel TEXT NOT NULL REFERENCES public.lookup_notification_channel,
  proof TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  sent_at TIMESTAMPTZ(3),
  sent_by uuid REFERENCES auth.users,
  traceback TEXT NOT NULL,

  CONSTRAINT notification_pkey PRIMARY KEY (id)
);

GRANT USAGE ON SCHEMA history TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA history TO authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA history TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA history TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA history GRANT ALL ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA history GRANT ALL ON ROUTINES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA history GRANT ALL ON SEQUENCES TO authenticated, service_role;