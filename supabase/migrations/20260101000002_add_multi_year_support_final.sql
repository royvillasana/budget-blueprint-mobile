-- Migration: Add Multi-Year Support to Monthly Tables (Final - Fixed)
-- Created: 2026-01-01
-- Description: Adds year support to monthly transaction, income, and budget tables

-- ============================================================================
-- Add year column to existing monthly tables
-- ============================================================================

-- Add year column to all monthly_transactions tables (defaulting to 2025)
ALTER TABLE public.monthly_transactions_jan ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
ALTER TABLE public.monthly_transactions_feb ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
ALTER TABLE public.monthly_transactions_mar ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
ALTER TABLE public.monthly_transactions_apr ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
ALTER TABLE public.monthly_transactions_may ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
ALTER TABLE public.monthly_transactions_jun ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
ALTER TABLE public.monthly_transactions_jul ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
ALTER TABLE public.monthly_transactions_aug ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
ALTER TABLE public.monthly_transactions_sep ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
ALTER TABLE public.monthly_transactions_oct ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
ALTER TABLE public.monthly_transactions_nov ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
ALTER TABLE public.monthly_transactions_dec ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;

-- Create indexes on year column for better query performance
CREATE INDEX IF NOT EXISTS idx_monthly_transactions_jan_year ON public.monthly_transactions_jan(year);
CREATE INDEX IF NOT EXISTS idx_monthly_transactions_feb_year ON public.monthly_transactions_feb(year);
CREATE INDEX IF NOT EXISTS idx_monthly_transactions_mar_year ON public.monthly_transactions_mar(year);
CREATE INDEX IF NOT EXISTS idx_monthly_transactions_apr_year ON public.monthly_transactions_apr(year);
CREATE INDEX IF NOT EXISTS idx_monthly_transactions_may_year ON public.monthly_transactions_may(year);
CREATE INDEX IF NOT EXISTS idx_monthly_transactions_jun_year ON public.monthly_transactions_jun(year);
CREATE INDEX IF NOT EXISTS idx_monthly_transactions_jul_year ON public.monthly_transactions_jul(year);
CREATE INDEX IF NOT EXISTS idx_monthly_transactions_aug_year ON public.monthly_transactions_aug(year);
CREATE INDEX IF NOT EXISTS idx_monthly_transactions_sep_year ON public.monthly_transactions_sep(year);
CREATE INDEX IF NOT EXISTS idx_monthly_transactions_oct_year ON public.monthly_transactions_oct(year);
CREATE INDEX IF NOT EXISTS idx_monthly_transactions_nov_year ON public.monthly_transactions_nov(year);
CREATE INDEX IF NOT EXISTS idx_monthly_transactions_dec_year ON public.monthly_transactions_dec(year);

-- Add year column to monthly_income tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'monthly_income_jan') THEN
    ALTER TABLE public.monthly_income_jan ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_income_feb ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_income_mar ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_income_apr ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_income_may ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_income_jun ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_income_jul ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_income_aug ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_income_sep ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_income_oct ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_income_nov ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_income_dec ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;

    CREATE INDEX IF NOT EXISTS idx_monthly_income_jan_year ON public.monthly_income_jan(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_income_feb_year ON public.monthly_income_feb(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_income_mar_year ON public.monthly_income_mar(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_income_apr_year ON public.monthly_income_apr(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_income_may_year ON public.monthly_income_may(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_income_jun_year ON public.monthly_income_jun(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_income_jul_year ON public.monthly_income_jul(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_income_aug_year ON public.monthly_income_aug(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_income_sep_year ON public.monthly_income_sep(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_income_oct_year ON public.monthly_income_oct(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_income_nov_year ON public.monthly_income_nov(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_income_dec_year ON public.monthly_income_dec(year);
  END IF;
END $$;

-- Add year column to monthly_budget tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'monthly_budget_jan') THEN
    ALTER TABLE public.monthly_budget_jan ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_budget_feb ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_budget_mar ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_budget_apr ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_budget_may ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_budget_jun ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_budget_jul ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_budget_aug ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_budget_sep ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_budget_oct ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_budget_nov ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_budget_dec ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;

    CREATE INDEX IF NOT EXISTS idx_monthly_budget_jan_year ON public.monthly_budget_jan(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_budget_feb_year ON public.monthly_budget_feb(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_budget_mar_year ON public.monthly_budget_mar(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_budget_apr_year ON public.monthly_budget_apr(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_budget_may_year ON public.monthly_budget_may(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_budget_jun_year ON public.monthly_budget_jun(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_budget_jul_year ON public.monthly_budget_jul(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_budget_aug_year ON public.monthly_budget_aug(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_budget_sep_year ON public.monthly_budget_sep(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_budget_oct_year ON public.monthly_budget_oct(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_budget_nov_year ON public.monthly_budget_nov(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_budget_dec_year ON public.monthly_budget_dec(year);
  END IF;
END $$;

-- Add year column to monthly_debts tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'monthly_debts_jan') THEN
    ALTER TABLE public.monthly_debts_jan ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_debts_feb ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_debts_mar ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_debts_apr ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_debts_may ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_debts_jun ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_debts_jul ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_debts_aug ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_debts_sep ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_debts_oct ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_debts_nov ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;
    ALTER TABLE public.monthly_debts_dec ADD COLUMN IF NOT EXISTS year INT NOT NULL DEFAULT 2025;

    CREATE INDEX IF NOT EXISTS idx_monthly_debts_jan_year ON public.monthly_debts_jan(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_debts_feb_year ON public.monthly_debts_feb(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_debts_mar_year ON public.monthly_debts_mar(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_debts_apr_year ON public.monthly_debts_apr(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_debts_may_year ON public.monthly_debts_may(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_debts_jun_year ON public.monthly_debts_jun(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_debts_jul_year ON public.monthly_debts_jul(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_debts_aug_year ON public.monthly_debts_aug(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_debts_sep_year ON public.monthly_debts_sep(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_debts_oct_year ON public.monthly_debts_oct(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_debts_nov_year ON public.monthly_debts_nov(year);
    CREATE INDEX IF NOT EXISTS idx_monthly_debts_dec_year ON public.monthly_debts_dec(year);
  END IF;
END $$;

-- ============================================================================
-- Create helper function to get available years and months
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_available_months_and_years()
RETURNS TABLE (
  year INT,
  month INT,
  month_name TEXT,
  transaction_count BIGINT,
  income_count BIGINT
) AS $$
DECLARE
  month_suffix TEXT;
  table_name TEXT;
  query TEXT;
BEGIN
  -- Loop through all months
  FOR month_num IN 1..12 LOOP
    month_suffix := CASE month_num
      WHEN 1 THEN 'jan'
      WHEN 2 THEN 'feb'
      WHEN 3 THEN 'mar'
      WHEN 4 THEN 'apr'
      WHEN 5 THEN 'may'
      WHEN 6 THEN 'jun'
      WHEN 7 THEN 'jul'
      WHEN 8 THEN 'aug'
      WHEN 9 THEN 'sep'
      WHEN 10 THEN 'oct'
      WHEN 11 THEN 'nov'
      WHEN 12 THEN 'dec'
    END;

    -- Get distinct years from transactions table
    query := format('
      SELECT DISTINCT
        t.year,
        %s as month,
        %L as month_name,
        COUNT(t.id) as transaction_count,
        0::BIGINT as income_count
      FROM public.monthly_transactions_%s t
      WHERE t.user_id = auth.uid()
      GROUP BY t.year
    ', month_num, month_suffix, month_suffix);

    RETURN QUERY EXECUTE query;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Drop all views before recreating them with year column
-- ============================================================================

-- Drop all views that need to be recreated
-- view_transactions_all CASCADE will also drop view_monthly_summary and view_annual_summary
DROP VIEW IF EXISTS public.view_transactions_all CASCADE;
DROP VIEW IF EXISTS public.view_income_all CASCADE;
DROP VIEW IF EXISTS public.view_budget_all CASCADE;
DROP VIEW IF EXISTS public.view_debts_all CASCADE;

-- Recreate view with year column
CREATE OR REPLACE VIEW public.view_transactions_all AS
SELECT
  t.id,
  t.user_id,
  t.month_id,
  t.date,
  t.description,
  t.category_id,
  c.name as category_name,
  t.amount,
  t.direction,
  t.payment_method_id,
  pm.name as payment_method_name,
  t.account_id,
  a.name as account_name,
  t.currency_code,
  t.notes,
  t.year,
  t.created_at,
  t.updated_at,
  'expense' as type
FROM public.monthly_transactions_jan t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts a ON t.account_id = a.id

UNION ALL

SELECT
  t.id,
  t.user_id,
  t.month_id,
  t.date,
  t.description,
  t.category_id,
  c.name as category_name,
  t.amount,
  t.direction,
  t.payment_method_id,
  pm.name as payment_method_name,
  t.account_id,
  a.name as account_name,
  t.currency_code,
  t.notes,
  t.year,
  t.created_at,
  t.updated_at,
  'expense' as type
FROM public.monthly_transactions_feb t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts a ON t.account_id = a.id

UNION ALL

SELECT
  t.id,
  t.user_id,
  t.month_id,
  t.date,
  t.description,
  t.category_id,
  c.name as category_name,
  t.amount,
  t.direction,
  t.payment_method_id,
  pm.name as payment_method_name,
  t.account_id,
  a.name as account_name,
  t.currency_code,
  t.notes,
  t.year,
  t.created_at,
  t.updated_at,
  'expense' as type
FROM public.monthly_transactions_mar t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts a ON t.account_id = a.id

UNION ALL

SELECT
  t.id,
  t.user_id,
  t.month_id,
  t.date,
  t.description,
  t.category_id,
  c.name as category_name,
  t.amount,
  t.direction,
  t.payment_method_id,
  pm.name as payment_method_name,
  t.account_id,
  a.name as account_name,
  t.currency_code,
  t.notes,
  t.year,
  t.created_at,
  t.updated_at,
  'expense' as type
FROM public.monthly_transactions_apr t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts a ON t.account_id = a.id

UNION ALL

SELECT
  t.id,
  t.user_id,
  t.month_id,
  t.date,
  t.description,
  t.category_id,
  c.name as category_name,
  t.amount,
  t.direction,
  t.payment_method_id,
  pm.name as payment_method_name,
  t.account_id,
  a.name as account_name,
  t.currency_code,
  t.notes,
  t.year,
  t.created_at,
  t.updated_at,
  'expense' as type
FROM public.monthly_transactions_may t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts a ON t.account_id = a.id

UNION ALL

SELECT
  t.id,
  t.user_id,
  t.month_id,
  t.date,
  t.description,
  t.category_id,
  c.name as category_name,
  t.amount,
  t.direction,
  t.payment_method_id,
  pm.name as payment_method_name,
  t.account_id,
  a.name as account_name,
  t.currency_code,
  t.notes,
  t.year,
  t.created_at,
  t.updated_at,
  'expense' as type
FROM public.monthly_transactions_jun t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts a ON t.account_id = a.id

UNION ALL

SELECT
  t.id,
  t.user_id,
  t.month_id,
  t.date,
  t.description,
  t.category_id,
  c.name as category_name,
  t.amount,
  t.direction,
  t.payment_method_id,
  pm.name as payment_method_name,
  t.account_id,
  a.name as account_name,
  t.currency_code,
  t.notes,
  t.year,
  t.created_at,
  t.updated_at,
  'expense' as type
FROM public.monthly_transactions_jul t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts a ON t.account_id = a.id

UNION ALL

SELECT
  t.id,
  t.user_id,
  t.month_id,
  t.date,
  t.description,
  t.category_id,
  c.name as category_name,
  t.amount,
  t.direction,
  t.payment_method_id,
  pm.name as payment_method_name,
  t.account_id,
  a.name as account_name,
  t.currency_code,
  t.notes,
  t.year,
  t.created_at,
  t.updated_at,
  'expense' as type
FROM public.monthly_transactions_aug t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts a ON t.account_id = a.id

UNION ALL

SELECT
  t.id,
  t.user_id,
  t.month_id,
  t.date,
  t.description,
  t.category_id,
  c.name as category_name,
  t.amount,
  t.direction,
  t.payment_method_id,
  pm.name as payment_method_name,
  t.account_id,
  a.name as account_name,
  t.currency_code,
  t.notes,
  t.year,
  t.created_at,
  t.updated_at,
  'expense' as type
FROM public.monthly_transactions_sep t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts a ON t.account_id = a.id

UNION ALL

SELECT
  t.id,
  t.user_id,
  t.month_id,
  t.date,
  t.description,
  t.category_id,
  c.name as category_name,
  t.amount,
  t.direction,
  t.payment_method_id,
  pm.name as payment_method_name,
  t.account_id,
  a.name as account_name,
  t.currency_code,
  t.notes,
  t.year,
  t.created_at,
  t.updated_at,
  'expense' as type
FROM public.monthly_transactions_oct t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts a ON t.account_id = a.id

UNION ALL

SELECT
  t.id,
  t.user_id,
  t.month_id,
  t.date,
  t.description,
  t.category_id,
  c.name as category_name,
  t.amount,
  t.direction,
  t.payment_method_id,
  pm.name as payment_method_name,
  t.account_id,
  a.name as account_name,
  t.currency_code,
  t.notes,
  t.year,
  t.created_at,
  t.updated_at,
  'expense' as type
FROM public.monthly_transactions_nov t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts a ON t.account_id = a.id

UNION ALL

SELECT
  t.id,
  t.user_id,
  t.month_id,
  t.date,
  t.description,
  t.category_id,
  c.name as category_name,
  t.amount,
  t.direction,
  t.payment_method_id,
  pm.name as payment_method_name,
  t.account_id,
  a.name as account_name,
  t.currency_code,
  t.notes,
  t.year,
  t.created_at,
  t.updated_at,
  'expense' as type
FROM public.monthly_transactions_dec t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts a ON t.account_id = a.id;

-- ============================================================================
-- Recreate all other views with year support
-- ============================================================================

-- View: All income entries across all 12 months with year
CREATE OR REPLACE VIEW public.view_income_all AS
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, year, 'jan' as month_abbr FROM public.monthly_income_jan
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, year, 'feb' as month_abbr FROM public.monthly_income_feb
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, year, 'mar' as month_abbr FROM public.monthly_income_mar
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, year, 'apr' as month_abbr FROM public.monthly_income_apr
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, year, 'may' as month_abbr FROM public.monthly_income_may
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, year, 'jun' as month_abbr FROM public.monthly_income_jun
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, year, 'jul' as month_abbr FROM public.monthly_income_jul
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, year, 'aug' as month_abbr FROM public.monthly_income_aug
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, year, 'sep' as month_abbr FROM public.monthly_income_sep
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, year, 'oct' as month_abbr FROM public.monthly_income_oct
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, year, 'nov' as month_abbr FROM public.monthly_income_nov
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, year, 'dec' as month_abbr FROM public.monthly_income_dec;

-- View: All budget entries across all 12 months with year
CREATE OR REPLACE VIEW public.view_budget_all AS
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, year, 'jan' as month_abbr FROM public.monthly_budget_jan
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, year, 'feb' as month_abbr FROM public.monthly_budget_feb
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, year, 'mar' as month_abbr FROM public.monthly_budget_mar
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, year, 'apr' as month_abbr FROM public.monthly_budget_apr
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, year, 'may' as month_abbr FROM public.monthly_budget_may
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, year, 'jun' as month_abbr FROM public.monthly_budget_jun
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, year, 'jul' as month_abbr FROM public.monthly_budget_jul
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, year, 'aug' as month_abbr FROM public.monthly_budget_aug
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, year, 'sep' as month_abbr FROM public.monthly_budget_sep
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, year, 'oct' as month_abbr FROM public.monthly_budget_oct
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, year, 'nov' as month_abbr FROM public.monthly_budget_nov
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, year, 'dec' as month_abbr FROM public.monthly_budget_dec;

-- View: All debts across all 12 months with year
CREATE OR REPLACE VIEW public.view_debts_all AS
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, year, 'jan' as month_abbr FROM public.monthly_debts_jan
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, year, 'feb' as month_abbr FROM public.monthly_debts_feb
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, year, 'mar' as month_abbr FROM public.monthly_debts_mar
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, year, 'apr' as month_abbr FROM public.monthly_debts_apr
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, year, 'may' as month_abbr FROM public.monthly_debts_may
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, year, 'jun' as month_abbr FROM public.monthly_debts_jun
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, year, 'jul' as month_abbr FROM public.monthly_debts_jul
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, year, 'aug' as month_abbr FROM public.monthly_debts_aug
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, year, 'sep' as month_abbr FROM public.monthly_debts_sep
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, year, 'oct' as month_abbr FROM public.monthly_debts_oct
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, year, 'nov' as month_abbr FROM public.monthly_debts_nov
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, year, 'dec' as month_abbr FROM public.monthly_debts_dec;

-- View: Monthly summary with year grouping
CREATE OR REPLACE VIEW public.view_monthly_summary AS
SELECT
    m.id AS month_id,
    m.name AS month_name,
    COALESCE(income_agg.year, trans_agg.year, budget_agg.year, debts_agg.year) AS year,
    COALESCE(income_agg.user_id, trans_agg.user_id, budget_agg.user_id, debts_agg.user_id) AS user_id,
    COALESCE(income_agg.total_income, 0) AS total_income,
    COALESCE(trans_agg.total_expenses, 0) AS total_expenses,
    COALESCE(income_agg.total_income, 0) - COALESCE(trans_agg.total_expenses, 0) AS net_cash_flow,
    COALESCE(budget_agg.needs_actual, 0) AS needs_actual,
    COALESCE(budget_agg.wants_actual, 0) AS wants_actual,
    COALESCE(budget_agg.future_actual, 0) AS future_actual,
    COALESCE(budget_agg.needs_assigned, 0) AS needs_assigned,
    COALESCE(budget_agg.wants_assigned, 0) AS wants_assigned,
    COALESCE(budget_agg.future_assigned, 0) AS future_assigned,
    COALESCE(debts_agg.debt_payments, 0) AS debt_payments
FROM months m
CROSS JOIN (SELECT DISTINCT year FROM view_transactions_all) years
LEFT JOIN (
    SELECT month_id, year, user_id, SUM(amount) AS total_income
    FROM view_income_all
    GROUP BY month_id, year, user_id
) income_agg ON m.id = income_agg.month_id AND years.year = income_agg.year
LEFT JOIN (
    SELECT month_id, year, user_id, SUM(CASE WHEN direction = 'EXPENSE' THEN ABS(amount) ELSE 0 END) AS total_expenses
    FROM view_transactions_all
    GROUP BY month_id, year, user_id
) trans_agg ON m.id = trans_agg.month_id AND years.year = trans_agg.year AND trans_agg.user_id = COALESCE(income_agg.user_id, trans_agg.user_id)
LEFT JOIN (
    SELECT month_id, year, user_id,
        SUM(CASE WHEN bucket_50_30_20 = 'NEEDS' THEN actual ELSE 0 END) AS needs_actual,
        SUM(CASE WHEN bucket_50_30_20 = 'WANTS' THEN actual ELSE 0 END) AS wants_actual,
        SUM(CASE WHEN bucket_50_30_20 = 'FUTURE' THEN actual ELSE 0 END) AS future_actual,
        SUM(CASE WHEN bucket_50_30_20 = 'NEEDS' THEN assigned ELSE 0 END) AS needs_assigned,
        SUM(CASE WHEN bucket_50_30_20 = 'WANTS' THEN assigned ELSE 0 END) AS wants_assigned,
        SUM(CASE WHEN bucket_50_30_20 = 'FUTURE' THEN assigned ELSE 0 END) AS future_assigned
    FROM view_budget_all
    GROUP BY month_id, year, user_id
) budget_agg ON m.id = budget_agg.month_id AND years.year = budget_agg.year AND budget_agg.user_id = COALESCE(income_agg.user_id, trans_agg.user_id, budget_agg.user_id)
LEFT JOIN (
    SELECT month_id, year, user_id, SUM(payment_made) AS debt_payments
    FROM view_debts_all
    GROUP BY month_id, year, user_id
) debts_agg ON m.id = debts_agg.month_id AND years.year = debts_agg.year AND debts_agg.user_id = COALESCE(income_agg.user_id, trans_agg.user_id, budget_agg.user_id, debts_agg.user_id)
WHERE COALESCE(income_agg.user_id, trans_agg.user_id, budget_agg.user_id, debts_agg.user_id) IS NOT NULL;

-- View: Annual summary with year grouping
CREATE OR REPLACE VIEW public.view_annual_summary AS
SELECT
    year,
    user_id,
    SUM(total_income) AS annual_income,
    SUM(total_expenses) AS annual_expenses,
    SUM(net_cash_flow) AS annual_net_cash_flow,
    SUM(needs_actual) AS annual_needs_actual,
    SUM(wants_actual) AS annual_wants_actual,
    SUM(future_actual) AS annual_future_actual,
    SUM(debt_payments) AS annual_debt_payments
FROM view_monthly_summary
WHERE user_id IS NOT NULL
GROUP BY year, user_id;

-- ============================================================================
-- Set security invoker for all views
-- ============================================================================

ALTER VIEW view_transactions_all SET (security_invoker = on);
ALTER VIEW view_income_all SET (security_invoker = on);
ALTER VIEW view_budget_all SET (security_invoker = on);
ALTER VIEW view_debts_all SET (security_invoker = on);
ALTER VIEW view_monthly_summary SET (security_invoker = on);
ALTER VIEW view_annual_summary SET (security_invoker = on);

-- ============================================================================
-- Grant permissions for all views
-- ============================================================================

GRANT SELECT ON public.view_transactions_all TO authenticated, anon;
GRANT SELECT ON public.view_income_all TO authenticated, anon;
GRANT SELECT ON public.view_budget_all TO authenticated, anon;
GRANT SELECT ON public.view_debts_all TO authenticated, anon;
GRANT SELECT ON public.view_monthly_summary TO authenticated, anon;
GRANT SELECT ON public.view_annual_summary TO authenticated, anon;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.monthly_transactions_jan.year IS 'Year for this transaction (enables multi-year support)';
COMMENT ON FUNCTION public.get_available_months_and_years IS 'Returns all months and years that have transaction data for the current user';
