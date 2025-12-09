-- Complete Database Reset Script
-- Run this in Supabase SQL Editor to completely clear the database

-- First, disable triggers temporarily
SET session_replication_role = 'replica';

-- Drop all tables with CASCADE to handle foreign keys
DROP TABLE IF EXISTS public.ai_conversations CASCADE;
DROP TABLE IF EXISTS public.ai_messages CASCADE;
DROP TABLE IF EXISTS public.conversation_references CASCADE;
DROP TABLE IF EXISTS public.monthly_budgets CASCADE;
DROP TABLE IF EXISTS public.income_items CASCADE;
DROP TABLE IF EXISTS public.budget_categories CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.annual_goals CASCADE;
DROP TABLE IF EXISTS public.financial_goals CASCADE;
DROP TABLE IF EXISTS public.wish_list CASCADE;
DROP TABLE IF EXISTS public.todo_list CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
DROP TABLE IF EXISTS public.months CASCADE;
DROP TABLE IF EXISTS public.monthly_transactions_jan CASCADE;
DROP TABLE IF EXISTS public.monthly_transactions_feb CASCADE;
DROP TABLE IF EXISTS public.monthly_transactions_mar CASCADE;
DROP TABLE IF EXISTS public.monthly_transactions_apr CASCADE;
DROP TABLE IF EXISTS public.monthly_transactions_may CASCADE;
DROP TABLE IF EXISTS public.monthly_transactions_jun CASCADE;
DROP TABLE IF EXISTS public.monthly_transactions_jul CASCADE;
DROP TABLE IF EXISTS public.monthly_transactions_aug CASCADE;
DROP TABLE IF EXISTS public.monthly_transactions_sep CASCADE;
DROP TABLE IF EXISTS public.monthly_transactions_oct CASCADE;
DROP TABLE IF EXISTS public.monthly_transactions_nov CASCADE;
DROP TABLE IF EXISTS public.monthly_transactions_dec CASCADE;

-- Drop all views
DROP VIEW IF EXISTS public.view_annual_summary CASCADE;
DROP VIEW IF EXISTS public.view_monthly_summary CASCADE;
DROP VIEW IF EXISTS public.view_settings_all CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_ai_conversation_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_conversation_on_message() CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Clear migration history so migrations can be re-run
DELETE FROM supabase_migrations.schema_migrations;

-- Success message
SELECT 'Database reset complete. You can now run supabase db push' AS status;
