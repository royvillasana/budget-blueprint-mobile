-- Fix column type mismatches and missing tables
-- This fixes:
-- 1. "Returned type character varying(20) does not match expected type text" error
-- 2. Missing user_settings table (406 errors)

-- ============================================================================
-- PART 1: Fix direction column type in monthly_transactions tables
-- ============================================================================

-- Step 1: Drop ALL dependent views (using CASCADE to handle dependencies)
DROP VIEW IF EXISTS all_transactions CASCADE;
DROP VIEW IF EXISTS view_transactions_all CASCADE;
DROP VIEW IF EXISTS view_monthly_summary CASCADE;
DROP VIEW IF EXISTS view_annual_summary CASCADE;
DROP VIEW IF EXISTS view_income_all CASCADE;
DROP VIEW IF EXISTS view_budget_all CASCADE;
DROP VIEW IF EXISTS view_debts_all CASCADE;

-- Step 2: Fix column types in monthly_transactions tables
DO $$
DECLARE
  month_suffix TEXT;
BEGIN
  FOR month_suffix IN
    SELECT unnest(ARRAY['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])
  LOOP
    -- Change direction column from VARCHAR to TEXT
    EXECUTE format('
      ALTER TABLE public.monthly_transactions_%s
      ALTER COLUMN direction TYPE TEXT;
    ', month_suffix);

    -- Change currency_code column from VARCHAR to TEXT
    EXECUTE format('
      ALTER TABLE public.monthly_transactions_%s
      ALTER COLUMN currency_code TYPE TEXT;
    ', month_suffix);

    RAISE NOTICE 'Fixed direction and currency_code column types for monthly_transactions_%', month_suffix;
  END LOOP;
END $$;

-- Step 2b: Fix column types in monthly_income tables
DO $$
DECLARE
  month_suffix TEXT;
BEGIN
  FOR month_suffix IN
    SELECT unnest(ARRAY['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])
  LOOP
    -- Change currency_code column from VARCHAR to TEXT in income tables
    EXECUTE format('
      ALTER TABLE public.monthly_income_%s
      ALTER COLUMN currency_code TYPE TEXT;
    ', month_suffix);

    RAISE NOTICE 'Fixed currency_code column type for monthly_income_%', month_suffix;
  END LOOP;

  RAISE NOTICE 'All column types fixed successfully!';
END $$;

-- Step 3: Recreate all the views
-- View: All transactions across all 12 months
CREATE OR REPLACE VIEW view_transactions_all AS
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'jan' as month_abbr FROM public.monthly_transactions_jan
UNION ALL SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'feb' as month_abbr FROM public.monthly_transactions_feb
UNION ALL SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'mar' as month_abbr FROM public.monthly_transactions_mar
UNION ALL SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'apr' as month_abbr FROM public.monthly_transactions_apr
UNION ALL SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'may' as month_abbr FROM public.monthly_transactions_may
UNION ALL SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'jun' as month_abbr FROM public.monthly_transactions_jun
UNION ALL SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'jul' as month_abbr FROM public.monthly_transactions_jul
UNION ALL SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'aug' as month_abbr FROM public.monthly_transactions_aug
UNION ALL SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'sep' as month_abbr FROM public.monthly_transactions_sep
UNION ALL SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'oct' as month_abbr FROM public.monthly_transactions_oct
UNION ALL SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'nov' as month_abbr FROM public.monthly_transactions_nov
UNION ALL SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'dec' as month_abbr FROM public.monthly_transactions_dec;

-- View: All income across all 12 months
CREATE OR REPLACE VIEW view_income_all AS
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'jan' as month_abbr FROM public.monthly_income_jan
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'feb' as month_abbr FROM public.monthly_income_feb
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'mar' as month_abbr FROM public.monthly_income_mar
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'apr' as month_abbr FROM public.monthly_income_apr
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'may' as month_abbr FROM public.monthly_income_may
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'jun' as month_abbr FROM public.monthly_income_jun
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'jul' as month_abbr FROM public.monthly_income_jul
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'aug' as month_abbr FROM public.monthly_income_aug
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'sep' as month_abbr FROM public.monthly_income_sep
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'oct' as month_abbr FROM public.monthly_income_oct
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'nov' as month_abbr FROM public.monthly_income_nov
UNION ALL SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'dec' as month_abbr FROM public.monthly_income_dec;

-- View: All budget entries across all 12 months
CREATE OR REPLACE VIEW view_budget_all AS
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'jan' as month_abbr FROM public.monthly_budget_jan
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'feb' as month_abbr FROM public.monthly_budget_feb
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'mar' as month_abbr FROM public.monthly_budget_mar
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'apr' as month_abbr FROM public.monthly_budget_apr
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'may' as month_abbr FROM public.monthly_budget_may
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'jun' as month_abbr FROM public.monthly_budget_jun
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'jul' as month_abbr FROM public.monthly_budget_jul
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'aug' as month_abbr FROM public.monthly_budget_aug
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'sep' as month_abbr FROM public.monthly_budget_sep
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'oct' as month_abbr FROM public.monthly_budget_oct
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'nov' as month_abbr FROM public.monthly_budget_nov
UNION ALL SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'dec' as month_abbr FROM public.monthly_budget_dec;

-- View: All debts across all 12 months
CREATE OR REPLACE VIEW view_debts_all AS
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'jan' as month_abbr FROM public.monthly_debts_jan
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'feb' as month_abbr FROM public.monthly_debts_feb
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'mar' as month_abbr FROM public.monthly_debts_mar
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'apr' as month_abbr FROM public.monthly_debts_apr
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'may' as month_abbr FROM public.monthly_debts_may
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'jun' as month_abbr FROM public.monthly_debts_jun
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'jul' as month_abbr FROM public.monthly_debts_jul
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'aug' as month_abbr FROM public.monthly_debts_aug
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'sep' as month_abbr FROM public.monthly_debts_sep
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'oct' as month_abbr FROM public.monthly_debts_oct
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'nov' as month_abbr FROM public.monthly_debts_nov
UNION ALL SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'dec' as month_abbr FROM public.monthly_debts_dec;

-- Recreate monthly and annual summary views
CREATE OR REPLACE VIEW view_monthly_summary AS
SELECT
    m.id AS month_id,
    m.name AS month_name,
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
    COALESCE(debts_agg.total_debt_balance, 0) AS total_debt_balance,
    COALESCE(debts_agg.total_debt_payment, 0) AS total_debt_payment
FROM months m
LEFT JOIN (
    SELECT month_id, user_id, SUM(amount) AS total_income
    FROM view_income_all
    GROUP BY month_id, user_id
) income_agg ON m.id = income_agg.month_id
LEFT JOIN (
    SELECT month_id, user_id, SUM(amount) AS total_expenses
    FROM view_transactions_all
    WHERE direction = 'EXPENSE'
    GROUP BY month_id, user_id
) trans_agg ON m.id = trans_agg.month_id AND income_agg.user_id = trans_agg.user_id
LEFT JOIN (
    SELECT
        month_id,
        user_id,
        SUM(CASE WHEN bucket_50_30_20 = 'NEEDS' THEN actual ELSE 0 END) AS needs_actual,
        SUM(CASE WHEN bucket_50_30_20 = 'WANTS' THEN actual ELSE 0 END) AS wants_actual,
        SUM(CASE WHEN bucket_50_30_20 = 'FUTURE' THEN actual ELSE 0 END) AS future_actual,
        SUM(CASE WHEN bucket_50_30_20 = 'NEEDS' THEN assigned ELSE 0 END) AS needs_assigned,
        SUM(CASE WHEN bucket_50_30_20 = 'WANTS' THEN assigned ELSE 0 END) AS wants_assigned,
        SUM(CASE WHEN bucket_50_30_20 = 'FUTURE' THEN assigned ELSE 0 END) AS future_assigned
    FROM view_budget_all
    GROUP BY month_id, user_id
) budget_agg ON m.id = budget_agg.month_id AND COALESCE(income_agg.user_id, trans_agg.user_id) = budget_agg.user_id
LEFT JOIN (
    SELECT month_id, user_id,
           SUM(ending_balance) AS total_debt_balance,
           SUM(payment_made) AS total_debt_payment
    FROM view_debts_all
    GROUP BY month_id, user_id
) debts_agg ON m.id = debts_agg.month_id AND COALESCE(income_agg.user_id, trans_agg.user_id, budget_agg.user_id) = debts_agg.user_id;

CREATE OR REPLACE VIEW view_annual_summary AS
SELECT
    user_id,
    SUM(total_income) AS annual_income,
    SUM(total_expenses) AS annual_expenses,
    SUM(net_cash_flow) AS annual_net_cash_flow,
    SUM(needs_actual) AS annual_needs_actual,
    SUM(wants_actual) AS annual_wants_actual,
    SUM(future_actual) AS annual_future_actual,
    SUM(needs_assigned) AS annual_needs_assigned,
    SUM(wants_assigned) AS annual_wants_assigned,
    SUM(future_assigned) AS annual_future_assigned,
    AVG(total_debt_balance) AS annual_avg_debt_balance,
    SUM(total_debt_payment) AS annual_debt_payments
FROM view_monthly_summary
GROUP BY user_id;

-- Set security invoker on all views
ALTER VIEW view_transactions_all SET (security_invoker = on);
ALTER VIEW view_income_all SET (security_invoker = on);
ALTER VIEW view_budget_all SET (security_invoker = on);
ALTER VIEW view_debts_all SET (security_invoker = on);
ALTER VIEW view_monthly_summary SET (security_invoker = on);
ALTER VIEW view_annual_summary SET (security_invoker = on);

-- ============================================================================
-- PART 2: Create user_settings table if it doesn't exist
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  owner_name TEXT,
  currency TEXT DEFAULT 'EUR',
  language TEXT DEFAULT 'es',
  monthly_income NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;

-- Create policies
CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings FOR UPDATE
USING (auth.uid() = user_id);

SELECT 'Fix completed! Column types updated and user_settings table verified.' AS status;
