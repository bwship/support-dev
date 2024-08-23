
-- Enable the "pgaudit" extension
--CREATE EXTENSION IF NOT EXISTS pgaudit
--WITH SCHEMA extensions;
-- temporary single-session config update
--SET pgaudit.log = 'function, write, ddl';
-- for API-related logs
--alter role anon set pgaudit.log to 'write';
--alter role authenticated set pgaudit.log to 'write';

-- Enable the "pg_cron" extension
CREATE EXTENSION IF NOT EXISTS pg_cron
WITH SCHEMA "extensions";

-- Enable the "pg_net" extension
CREATE EXTENSION IF NOT EXISTS pg_net
WITH SCHEMA extensions;

-- Enable the "pgtap" extension
CREATE EXTENSION IF NOT EXISTS pgtap
WITH SCHEMA extensions;
