-- Migration: Add ONLY missing views and RPC functions (no table creation)
-- Date: 2025-12-09
-- Use this when tables already exist but views/functions are missing

-- ============================================================================
-- PART 0: Verify prerequisite tables exist
-- ============================================================================

DO $$
DECLARE
  missing_tables TEXT[];
BEGIN
  -- Check for required core tables
  SELECT ARRAY_AGG(table_name)
  INTO missing_tables
  FROM (
    VALUES ('months'), ('categories'), ('accounts')
  ) AS required(table_name)
  WHERE NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = required.table_name
  );

  IF missing_tables IS NOT NULL THEN
    RAISE EXCEPTION 'Missing required tables: %. Please run the full migration first.', array_to_string(missing_tables, ', ');
  END IF;

  -- Check for at least one monthly table of each type
  IF NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND (
      table_name LIKE 'monthly_transactions_%' OR
      table_name LIKE 'monthly_income_%' OR
      table_name LIKE 'monthly_debts_%'
    )
  ) THEN
    RAISE NOTICE 'Warning: Some monthly tables (transactions, income, debts) may be missing. Views will be created but may be empty.';
  END IF;

  RAISE NOTICE 'Prerequisite check passed. Proceeding with migration...';
END $$;

-- Ensure months table is populated with the 12 months
-- Only insert columns that exist in the table
DO $$
BEGIN
  -- Check if year column exists
  IF EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'months' AND column_name = 'year'
  ) THEN
    -- Insert with year column
    INSERT INTO public.months (id, name, year)
    VALUES
      (1, 'Enero', 2025),
      (2, 'Febrero', 2025),
      (3, 'Marzo', 2025),
      (4, 'Abril', 2025),
      (5, 'Mayo', 2025),
      (6, 'Junio', 2025),
      (7, 'Julio', 2025),
      (8, 'Agosto', 2025),
      (9, 'Septiembre', 2025),
      (10, 'Octubre', 2025),
      (11, 'Noviembre', 2025),
      (12, 'Diciembre', 2025)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      year = EXCLUDED.year;
  ELSE
    -- Insert without year column
    INSERT INTO public.months (id, name)
    VALUES
      (1, 'Enero'),
      (2, 'Febrero'),
      (3, 'Marzo'),
      (4, 'Abril'),
      (5, 'Mayo'),
      (6, 'Junio'),
      (7, 'Julio'),
      (8, 'Agosto'),
      (9, 'Septiembre'),
      (10, 'Octubre'),
      (11, 'Noviembre'),
      (12, 'Diciembre')
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name;
  END IF;
END $$;

-- ============================================================================
-- PART 1: Ensure monthly budget tables exist with correct schema
-- ============================================================================

-- Create monthly_budget tables if they don't exist, or ensure columns exist if they do
DO $$
DECLARE
  month_suffix TEXT;
  table_exists BOOLEAN;
BEGIN
  FOR month_suffix IN
    SELECT unnest(ARRAY['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])
  LOOP
    -- Check if table exists
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'monthly_budget_' || month_suffix
    ) INTO table_exists;

    IF NOT table_exists THEN
      -- Create the table if it doesn't exist
      EXECUTE format('
        CREATE TABLE public.monthly_budget_%s (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          month_id INTEGER NOT NULL REFERENCES public.months(id),
          user_id UUID NOT NULL,
          category_id UUID NOT NULL REFERENCES public.categories(id),
          bucket_50_30_20 TEXT NOT NULL CHECK (bucket_50_30_20 IN (''NEEDS'', ''WANTS'', ''FUTURE'')),
          estimated DECIMAL(12, 2) DEFAULT 0,
          assigned DECIMAL(12, 2) DEFAULT 0,
          actual DECIMAL(12, 2) DEFAULT 0,
          variance DECIMAL(12, 2) DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );

        ALTER TABLE public.monthly_budget_%s ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own budget"
          ON public.monthly_budget_%s FOR SELECT
          USING (auth.uid() = user_id);

        CREATE POLICY "Users can create their own budget"
          ON public.monthly_budget_%s FOR INSERT
          WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own budget"
          ON public.monthly_budget_%s FOR UPDATE
          USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own budget"
          ON public.monthly_budget_%s FOR DELETE
          USING (auth.uid() = user_id);
      ', month_suffix, month_suffix, month_suffix, month_suffix, month_suffix, month_suffix);
    ELSE
      -- Add columns if they don't exist
      EXECUTE format('ALTER TABLE public.monthly_budget_%s ADD COLUMN IF NOT EXISTS estimated DECIMAL(12, 2) DEFAULT 0;', month_suffix);
      EXECUTE format('ALTER TABLE public.monthly_budget_%s ADD COLUMN IF NOT EXISTS assigned DECIMAL(12, 2) DEFAULT 0;', month_suffix);
      EXECUTE format('ALTER TABLE public.monthly_budget_%s ADD COLUMN IF NOT EXISTS actual DECIMAL(12, 2) DEFAULT 0;', month_suffix);
      EXECUTE format('ALTER TABLE public.monthly_budget_%s ADD COLUMN IF NOT EXISTS variance DECIMAL(12, 2) DEFAULT 0;', month_suffix);
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- PART 2: Create intermediate UNION ALL views
-- ============================================================================

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

-- ============================================================================
-- PART 3: Create aggregated summary views
-- ============================================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS view_annual_summary CASCADE;
DROP VIEW IF EXISTS view_monthly_summary CASCADE;

-- View: Monthly summary with proper aggregation (avoiding cartesian product)
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
    COALESCE(debts_agg.debt_payments, 0) AS debt_payments
FROM months m
LEFT JOIN (
    SELECT month_id, user_id, SUM(amount) AS total_income
    FROM view_income_all
    GROUP BY month_id, user_id
) income_agg ON m.id = income_agg.month_id
LEFT JOIN (
    SELECT month_id, user_id, SUM(CASE WHEN direction = 'EXPENSE' THEN ABS(amount) ELSE 0 END) AS total_expenses
    FROM view_transactions_all
    GROUP BY month_id, user_id
) trans_agg ON m.id = trans_agg.month_id AND trans_agg.user_id = COALESCE(income_agg.user_id, trans_agg.user_id)
LEFT JOIN (
    SELECT month_id, user_id,
        SUM(CASE WHEN bucket_50_30_20 = 'NEEDS' THEN actual ELSE 0 END) AS needs_actual,
        SUM(CASE WHEN bucket_50_30_20 = 'WANTS' THEN actual ELSE 0 END) AS wants_actual,
        SUM(CASE WHEN bucket_50_30_20 = 'FUTURE' THEN actual ELSE 0 END) AS future_actual,
        SUM(CASE WHEN bucket_50_30_20 = 'NEEDS' THEN assigned ELSE 0 END) AS needs_assigned,
        SUM(CASE WHEN bucket_50_30_20 = 'WANTS' THEN assigned ELSE 0 END) AS wants_assigned,
        SUM(CASE WHEN bucket_50_30_20 = 'FUTURE' THEN assigned ELSE 0 END) AS future_assigned
    FROM view_budget_all
    GROUP BY month_id, user_id
) budget_agg ON m.id = budget_agg.month_id AND budget_agg.user_id = COALESCE(income_agg.user_id, trans_agg.user_id, budget_agg.user_id)
LEFT JOIN (
    SELECT month_id, user_id, SUM(payment_made) AS debt_payments
    FROM view_debts_all
    GROUP BY month_id, user_id
) debts_agg ON m.id = debts_agg.month_id AND debts_agg.user_id = COALESCE(income_agg.user_id, trans_agg.user_id, budget_agg.user_id, debts_agg.user_id);

-- View: Annual summary aggregating all months
CREATE OR REPLACE VIEW view_annual_summary AS
SELECT
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
GROUP BY user_id;

-- Set views to use querying user's permissions (security_invoker = on)
ALTER VIEW view_transactions_all SET (security_invoker = on);
ALTER VIEW view_income_all SET (security_invoker = on);
ALTER VIEW view_budget_all SET (security_invoker = on);
ALTER VIEW view_debts_all SET (security_invoker = on);
ALTER VIEW view_monthly_summary SET (security_invoker = on);
ALTER VIEW view_annual_summary SET (security_invoker = on);

-- ============================================================================
-- PART 4: Create RPC functions
-- ============================================================================

-- Drop existing functions if they exist (to handle signature changes)
DROP FUNCTION IF EXISTS get_user_transactions(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_user_debts(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_user_budget(UUID, INTEGER);

-- Function: get_user_transactions
CREATE OR REPLACE FUNCTION get_user_transactions(p_user_id UUID, p_month_id INTEGER)
RETURNS TABLE (
  id UUID,
  month_id INTEGER,
  user_id UUID,
  date DATE,
  description TEXT,
  category_id UUID,
  category_name TEXT,
  category_emoji TEXT,
  amount DECIMAL(12, 2),
  direction TEXT,
  payment_method_id UUID,
  account_id UUID,
  currency_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  table_name TEXT;
BEGIN
  table_name := CASE p_month_id
    WHEN 1 THEN 'monthly_transactions_jan'
    WHEN 2 THEN 'monthly_transactions_feb'
    WHEN 3 THEN 'monthly_transactions_mar'
    WHEN 4 THEN 'monthly_transactions_apr'
    WHEN 5 THEN 'monthly_transactions_may'
    WHEN 6 THEN 'monthly_transactions_jun'
    WHEN 7 THEN 'monthly_transactions_jul'
    WHEN 8 THEN 'monthly_transactions_aug'
    WHEN 9 THEN 'monthly_transactions_sep'
    WHEN 10 THEN 'monthly_transactions_oct'
    WHEN 11 THEN 'monthly_transactions_nov'
    WHEN 12 THEN 'monthly_transactions_dec'
  END;

  RETURN QUERY EXECUTE format('
    SELECT
      t.id, t.month_id, t.user_id, t.date, t.description, t.category_id,
      c.name as category_name, c.emoji as category_emoji,
      t.amount, t.direction, t.payment_method_id, t.account_id, t.currency_code, t.notes, t.created_at
    FROM public.%I t
    LEFT JOIN public.categories c ON t.category_id = c.id
    WHERE t.user_id = $1 AND t.month_id = $2
    ORDER BY t.date DESC, t.created_at DESC
  ', table_name) USING p_user_id, p_month_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_user_debts
CREATE OR REPLACE FUNCTION get_user_debts(p_user_id UUID, p_month_id INTEGER)
RETURNS TABLE (
  id UUID,
  month_id INTEGER,
  user_id UUID,
  debt_account_id UUID,
  account_name TEXT,
  starting_balance DECIMAL(12, 2),
  min_payment DECIMAL(12, 2),
  payment_made DECIMAL(12, 2),
  interest_rate_apr DECIMAL(5, 2),
  due_day INTEGER,
  ending_balance DECIMAL(12, 2),
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  table_name TEXT;
BEGIN
  table_name := CASE p_month_id
    WHEN 1 THEN 'monthly_debts_jan'
    WHEN 2 THEN 'monthly_debts_feb'
    WHEN 3 THEN 'monthly_debts_mar'
    WHEN 4 THEN 'monthly_debts_apr'
    WHEN 5 THEN 'monthly_debts_may'
    WHEN 6 THEN 'monthly_debts_jun'
    WHEN 7 THEN 'monthly_debts_jul'
    WHEN 8 THEN 'monthly_debts_aug'
    WHEN 9 THEN 'monthly_debts_sep'
    WHEN 10 THEN 'monthly_debts_oct'
    WHEN 11 THEN 'monthly_debts_nov'
    WHEN 12 THEN 'monthly_debts_dec'
  END;

  RETURN QUERY EXECUTE format('
    SELECT
      d.id, d.month_id, d.user_id, d.debt_account_id,
      a.name as account_name,
      d.starting_balance, d.min_payment, d.payment_made, d.interest_rate_apr, d.due_day, d.ending_balance, d.created_at
    FROM public.%I d
    LEFT JOIN public.accounts a ON d.debt_account_id = a.id
    WHERE d.user_id = $1 AND d.month_id = $2
    ORDER BY d.created_at DESC
  ', table_name) USING p_user_id, p_month_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: get_user_budget
CREATE OR REPLACE FUNCTION get_user_budget(p_user_id UUID, p_month_id INTEGER)
RETURNS TABLE (
  id UUID,
  month_id INTEGER,
  user_id UUID,
  category_id UUID,
  category_name TEXT,
  category_emoji TEXT,
  bucket_50_30_20 TEXT,
  estimated DECIMAL(12, 2),
  assigned DECIMAL(12, 2),
  actual DECIMAL(12, 2),
  variance DECIMAL(12, 2),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  table_name TEXT;
BEGIN
  table_name := CASE p_month_id
    WHEN 1 THEN 'monthly_budget_jan'
    WHEN 2 THEN 'monthly_budget_feb'
    WHEN 3 THEN 'monthly_budget_mar'
    WHEN 4 THEN 'monthly_budget_apr'
    WHEN 5 THEN 'monthly_budget_may'
    WHEN 6 THEN 'monthly_budget_jun'
    WHEN 7 THEN 'monthly_budget_jul'
    WHEN 8 THEN 'monthly_budget_aug'
    WHEN 9 THEN 'monthly_budget_sep'
    WHEN 10 THEN 'monthly_budget_oct'
    WHEN 11 THEN 'monthly_budget_nov'
    WHEN 12 THEN 'monthly_budget_dec'
  END;

  RETURN QUERY EXECUTE format('
    SELECT
      b.id, b.month_id, b.user_id, b.category_id,
      c.name as category_name, c.emoji as category_emoji,
      b.bucket_50_30_20, b.estimated, b.assigned, b.actual, b.variance,
      b.created_at, b.updated_at
    FROM public.%I b
    LEFT JOIN public.categories c ON b.category_id = c.id
    WHERE b.user_id = $1 AND b.month_id = $2
    ORDER BY b.bucket_50_30_20, c.name
  ', table_name) USING p_user_id, p_month_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 'Migration completed! All views and functions created successfully.' AS status;
