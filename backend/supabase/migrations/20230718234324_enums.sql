-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
    CREATE TYPE role AS ENUM (
      'ADMIN',
      'FAMILY_MEMBER',
      'HELPER',
      'CLIENT',
      'PET',
      'TEAM_ADMIN',
      'TEAM_OWNER'
    );
  END IF;
END $$;

-- Lookup tables
CREATE TABLE public.lookup_address_type (
  id TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT lookup_address_type_pkey PRIMARY KEY (id)
);

CREATE TABLE public.lookup_family_member_type (
  id TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT lookup_family_member_type_pkey PRIMARY KEY (id)
);

CREATE TABLE public.lookup_invite_status (
  id TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT lookup_invite_status_pkey PRIMARY KEY (id)
);

CREATE TABLE public.lookup_pet_type (
  id TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT lookup_pet_type_pkey PRIMARY KEY (id)
);

CREATE TABLE public.lookup_step_type (
  id TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT lookup_step_type_pkey PRIMARY KEY (id)
);

CREATE TABLE public.lookup_transportation_rule (
  id TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT lookup_transportation_rule_pkey PRIMARY KEY (id)
);

CREATE TABLE public.lookup_event_processing_status (
  id TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT lookup_event_processing_status_pkey PRIMARY KEY (id)
);

CREATE TABLE public.lookup_notification_status (
  id TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT lookup_notification_status_pkey PRIMARY KEY (id)
);

CREATE TABLE public.lookup_notification_channel (
  id TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by uuid REFERENCES auth.users,
  deleted_at TIMESTAMPTZ(3),
  deleted_by uuid REFERENCES auth.users,
  updated_at TIMESTAMPTZ(3),
  updated_by uuid REFERENCES auth.users,

  CONSTRAINT lookup_notification_channel_pkey PRIMARY KEY (id)
);
