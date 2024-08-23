CREATE OR REPLACE FUNCTION fn_truncate_db()
RETURNS void AS $$
  DECLARE
    r RECORD;
BEGIN
    DELETE FROM storage.objects;
    DELETE FROM storage.buckets;
    DELETE FROM supabase_migrations.schema_migrations;

    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
      EXECUTE 'TRUNCATE public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'history') LOOP
      EXECUTE 'TRUNCATE history.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    DELETE FROM auth.identities;
    DELETE FROM auth.users;
END;
$$
LANGUAGE plpgsql;
