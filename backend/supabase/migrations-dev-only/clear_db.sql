CREATE OR REPLACE FUNCTION fn_clear_db()
RETURNS void AS $$
  DECLARE
    r RECORD;
BEGIN
    -- Drop all triggers in the 'public' schema
    FOR r IN (SELECT event_object_table, trigger_name 
                            FROM information_schema.triggers 
                            WHERE trigger_schema = 'public' AND event_object_schema = 'public') 
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON ' || 
                 quote_ident(r.event_object_table) || ' CASCADE'; 
    END LOOP; 

    -- Drop all functions in the 'public' schema
    FOR r IN (SELECT proname 
              FROM pg_proc 
              WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) 
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.proname) || ' CASCADE'; 
    END LOOP; 

    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
      EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public')
    LOOP
      EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
    END LOOP;

    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'history') LOOP
      EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    DROP SCHEMA IF EXISTS history CASCADE;

    DROP TYPE IF EXISTS role CASCADE;

    DROP EXTENSION IF EXISTS pgtap;

    -- Delete all policies in the 'storage' schema
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage') 
    LOOP
      EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || 'storage.objects CASCADE';
    END LOOP;

    DELETE FROM auth.identities;
    DELETE FROM auth.users;

    DELETE FROM storage.objects;
    DELETE FROM storage.buckets;
    DELETE FROM supabase_migrations.schema_migrations;
END;
$$
LANGUAGE plpgsql;
