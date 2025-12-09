-- Complete Database Reset Script
-- Run this in Supabase SQL Editor to completely clear the database

-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- Drop ALL tables in public schema dynamically
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- Drop all views
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.viewname) || ' CASCADE';
    END LOOP;

    -- Drop all sequences
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public')
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS public.' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;

    -- Drop all functions and triggers
    FOR r IN (
        SELECT p.proname as name, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    )
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.name) || '(' || r.args || ') CASCADE';
    END LOOP;

    -- Drop all types
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Clear migration history
DELETE FROM supabase_migrations.schema_migrations WHERE version LIKE '2025%';

-- Success message
SELECT 'Database reset complete! All tables, views, functions, and types have been dropped.' AS status;
