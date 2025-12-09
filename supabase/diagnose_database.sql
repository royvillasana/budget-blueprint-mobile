-- Diagnostic script to check database state
-- Run this in Supabase SQL Editor to see what exists

-- Check which core tables exist
SELECT 'Core Tables Status' as section, table_name,
  CASE
    WHEN table_name IN (
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    ) THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status
FROM (
  VALUES
    ('months'),
    ('categories'),
    ('accounts'),
    ('payment_methods'),
    ('user_settings')
) AS t(table_name);

-- Check which monthly tables exist
SELECT 'Monthly Budget Tables' as section, table_name,
  CASE
    WHEN table_name IN (
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    ) THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END as status
FROM (
  VALUES
    ('monthly_budget_jan'),
    ('monthly_budget_feb'),
    ('monthly_budget_mar'),
    ('monthly_transactions_jan'),
    ('monthly_income_jan'),
    ('monthly_debts_jan')
) AS t(table_name);

-- Check if monthly_budget_jan has required columns (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'monthly_budget_jan'
  ) THEN
    RAISE NOTICE 'Monthly_budget_jan columns:';
    PERFORM column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'monthly_budget_jan';
  ELSE
    RAISE NOTICE 'Table monthly_budget_jan does not exist';
  END IF;
END $$;

-- Check which views exist
SELECT 'Views Status' as section, viewname as view_name, '✓ EXISTS' as status
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN (
  'view_monthly_summary',
  'view_annual_summary',
  'view_transactions_all',
  'view_income_all',
  'view_budget_all',
  'view_debts_all'
);

-- Check which functions exist
SELECT 'Functions Status' as section, routine_name as function_name, '✓ EXISTS' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
AND routine_name IN (
  'get_user_transactions',
  'get_user_debts',
  'get_user_budget'
);

SELECT '=== DIAGNOSTIC COMPLETE ===' as result;
