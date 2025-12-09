-- Migration: Add missing database views and RPC functions for dashboard and month pages
-- Date: 2025-12-09

-- ============================================================================
-- PART 1: Add missing columns to monthly_budget tables
-- ============================================================================

-- Add ALL necessary columns to all 12 monthly budget tables
-- This ensures the schema is complete even if migrations weren't run in order

DO $$
DECLARE
  month_suffix TEXT;
BEGIN
  FOR month_suffix IN
    SELECT unnest(ARRAY['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])
  LOOP
    -- Add base columns if they don't exist
    EXECUTE format('
      ALTER TABLE public.monthly_budget_%s
      ADD COLUMN IF NOT EXISTS estimated DECIMAL(12, 2) DEFAULT 0;
    ', month_suffix);

    EXECUTE format('
      ALTER TABLE public.monthly_budget_%s
      ADD COLUMN IF NOT EXISTS assigned DECIMAL(12, 2) DEFAULT 0;
    ', month_suffix);

    EXECUTE format('
      ALTER TABLE public.monthly_budget_%s
      ADD COLUMN IF NOT EXISTS actual DECIMAL(12, 2) DEFAULT 0;
    ', month_suffix);

    EXECUTE format('
      ALTER TABLE public.monthly_budget_%s
      ADD COLUMN IF NOT EXISTS variance DECIMAL(12, 2) DEFAULT 0;
    ', month_suffix);

    -- Add planned_amount and spent_amount columns
    EXECUTE format('
      ALTER TABLE public.monthly_budget_%s
      ADD COLUMN IF NOT EXISTS planned_amount DECIMAL(12, 2) DEFAULT 0;
    ', month_suffix);

    EXECUTE format('
      ALTER TABLE public.monthly_budget_%s
      ADD COLUMN IF NOT EXISTS spent_amount DECIMAL(12, 2) DEFAULT 0;
    ', month_suffix);
  END LOOP;
END $$;

-- Now safely copy data from estimated/actual to planned_amount/spent_amount
DO $$
DECLARE
  month_suffix TEXT;
BEGIN
  FOR month_suffix IN
    SELECT unnest(ARRAY['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])
  LOOP
    -- Copy estimated to planned_amount where planned_amount is 0
    EXECUTE format('
      UPDATE public.monthly_budget_%s
      SET planned_amount = COALESCE(estimated, 0)
      WHERE planned_amount = 0 AND COALESCE(estimated, 0) > 0;
    ', month_suffix);

    -- Copy actual to spent_amount where spent_amount is 0
    EXECUTE format('
      UPDATE public.monthly_budget_%s
      SET spent_amount = COALESCE(actual, 0)
      WHERE spent_amount = 0 AND COALESCE(actual, 0) > 0;
    ', month_suffix);
  END LOOP;
END $$;

-- ============================================================================
-- PART 2: Create RPC function to get user transactions
-- ============================================================================

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
  -- Determine which monthly table to query based on month_id
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

  -- Return transactions with category info joined
  RETURN QUERY EXECUTE format('
    SELECT
      t.id,
      t.month_id,
      t.user_id,
      t.date,
      t.description,
      t.category_id,
      c.name as category_name,
      c.emoji as category_emoji,
      t.amount,
      t.direction,
      t.payment_method_id,
      t.account_id,
      t.currency_code,
      t.notes,
      t.created_at
    FROM public.%I t
    LEFT JOIN public.categories c ON t.category_id = c.id
    WHERE t.user_id = $1 AND t.month_id = $2
    ORDER BY t.date DESC, t.created_at DESC
  ', table_name) USING p_user_id, p_month_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 3: Create RPC function to get user debts
-- ============================================================================

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
  -- Determine which monthly table to query based on month_id
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

  -- Return debts with account info joined
  RETURN QUERY EXECUTE format('
    SELECT
      d.id,
      d.month_id,
      d.user_id,
      d.debt_account_id,
      a.name as account_name,
      d.starting_balance,
      d.min_payment,
      d.payment_made,
      d.interest_rate_apr,
      d.due_day,
      d.ending_balance,
      d.created_at
    FROM public.%I d
    LEFT JOIN public.accounts a ON d.debt_account_id = a.id
    WHERE d.user_id = $1 AND d.month_id = $2
    ORDER BY d.created_at DESC
  ', table_name) USING p_user_id, p_month_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 4: Create RPC function to get user budget
-- ============================================================================

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
  planned_amount DECIMAL(12, 2),
  spent_amount DECIMAL(12, 2),
  variance DECIMAL(12, 2),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  table_name TEXT;
BEGIN
  -- Determine which monthly table to query based on month_id
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

  -- Return budget with category info joined
  RETURN QUERY EXECUTE format('
    SELECT
      b.id,
      b.month_id,
      b.user_id,
      b.category_id,
      c.name as category_name,
      c.emoji as category_emoji,
      b.bucket_50_30_20,
      b.estimated,
      b.assigned,
      b.actual,
      b.planned_amount,
      b.spent_amount,
      b.variance,
      b.created_at,
      b.updated_at
    FROM public.%I b
    LEFT JOIN public.categories c ON b.category_id = c.id
    WHERE b.user_id = $1 AND b.month_id = $2
    ORDER BY b.bucket_50_30_20, c.name
  ', table_name) USING p_user_id, p_month_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 5: Create view_monthly_summary view
-- ============================================================================

CREATE OR REPLACE VIEW view_monthly_summary AS
WITH all_months AS (
  -- January
  SELECT
    1 as month_id,
    m.name as month_name,
    m.year,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as net_cash_flow,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as needs_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as wants_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as future_actual,
    COALESCE(SUM(d.payment_made), 0) as debt_payments
  FROM public.months m
  LEFT JOIN public.monthly_income_jan i ON i.month_id = m.id
  LEFT JOIN public.monthly_transactions_jan t ON t.month_id = m.id
  LEFT JOIN public.monthly_budget_jan b ON b.month_id = m.id
  LEFT JOIN public.monthly_debts_jan d ON d.month_id = m.id
  WHERE m.id = 1
  GROUP BY m.id, m.name, m.year

  UNION ALL

  -- February
  SELECT
    2 as month_id,
    m.name as month_name,
    m.year,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as net_cash_flow,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as needs_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as wants_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as future_actual,
    COALESCE(SUM(d.payment_made), 0) as debt_payments
  FROM public.months m
  LEFT JOIN public.monthly_income_feb i ON i.month_id = m.id
  LEFT JOIN public.monthly_transactions_feb t ON t.month_id = m.id
  LEFT JOIN public.monthly_budget_feb b ON b.month_id = m.id
  LEFT JOIN public.monthly_debts_feb d ON d.month_id = m.id
  WHERE m.id = 2
  GROUP BY m.id, m.name, m.year

  UNION ALL

  -- March
  SELECT
    3 as month_id,
    m.name as month_name,
    m.year,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as net_cash_flow,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as needs_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as wants_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as future_actual,
    COALESCE(SUM(d.payment_made), 0) as debt_payments
  FROM public.months m
  LEFT JOIN public.monthly_income_mar i ON i.month_id = m.id
  LEFT JOIN public.monthly_transactions_mar t ON t.month_id = m.id
  LEFT JOIN public.monthly_budget_mar b ON b.month_id = m.id
  LEFT JOIN public.monthly_debts_mar d ON d.month_id = m.id
  WHERE m.id = 3
  GROUP BY m.id, m.name, m.year

  UNION ALL

  -- April
  SELECT
    4 as month_id,
    m.name as month_name,
    m.year,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as net_cash_flow,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as needs_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as wants_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as future_actual,
    COALESCE(SUM(d.payment_made), 0) as debt_payments
  FROM public.months m
  LEFT JOIN public.monthly_income_apr i ON i.month_id = m.id
  LEFT JOIN public.monthly_transactions_apr t ON t.month_id = m.id
  LEFT JOIN public.monthly_budget_apr b ON b.month_id = m.id
  LEFT JOIN public.monthly_debts_apr d ON d.month_id = m.id
  WHERE m.id = 4
  GROUP BY m.id, m.name, m.year

  UNION ALL

  -- May
  SELECT
    5 as month_id,
    m.name as month_name,
    m.year,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as net_cash_flow,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as needs_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as wants_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as future_actual,
    COALESCE(SUM(d.payment_made), 0) as debt_payments
  FROM public.months m
  LEFT JOIN public.monthly_income_may i ON i.month_id = m.id
  LEFT JOIN public.monthly_transactions_may t ON t.month_id = m.id
  LEFT JOIN public.monthly_budget_may b ON b.month_id = m.id
  LEFT JOIN public.monthly_debts_may d ON d.month_id = m.id
  WHERE m.id = 5
  GROUP BY m.id, m.name, m.year

  UNION ALL

  -- June
  SELECT
    6 as month_id,
    m.name as month_name,
    m.year,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as net_cash_flow,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as needs_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as wants_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as future_actual,
    COALESCE(SUM(d.payment_made), 0) as debt_payments
  FROM public.months m
  LEFT JOIN public.monthly_income_jun i ON i.month_id = m.id
  LEFT JOIN public.monthly_transactions_jun t ON t.month_id = m.id
  LEFT JOIN public.monthly_budget_jun b ON b.month_id = m.id
  LEFT JOIN public.monthly_debts_jun d ON d.month_id = m.id
  WHERE m.id = 6
  GROUP BY m.id, m.name, m.year

  UNION ALL

  -- July
  SELECT
    7 as month_id,
    m.name as month_name,
    m.year,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as net_cash_flow,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as needs_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as wants_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as future_actual,
    COALESCE(SUM(d.payment_made), 0) as debt_payments
  FROM public.months m
  LEFT JOIN public.monthly_income_jul i ON i.month_id = m.id
  LEFT JOIN public.monthly_transactions_jul t ON t.month_id = m.id
  LEFT JOIN public.monthly_budget_jul b ON b.month_id = m.id
  LEFT JOIN public.monthly_debts_jul d ON d.month_id = m.id
  WHERE m.id = 7
  GROUP BY m.id, m.name, m.year

  UNION ALL

  -- August
  SELECT
    8 as month_id,
    m.name as month_name,
    m.year,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as net_cash_flow,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as needs_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as wants_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as future_actual,
    COALESCE(SUM(d.payment_made), 0) as debt_payments
  FROM public.months m
  LEFT JOIN public.monthly_income_aug i ON i.month_id = m.id
  LEFT JOIN public.monthly_transactions_aug t ON t.month_id = m.id
  LEFT JOIN public.monthly_budget_aug b ON b.month_id = m.id
  LEFT JOIN public.monthly_debts_aug d ON d.month_id = m.id
  WHERE m.id = 8
  GROUP BY m.id, m.name, m.year

  UNION ALL

  -- September
  SELECT
    9 as month_id,
    m.name as month_name,
    m.year,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as net_cash_flow,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as needs_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as wants_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as future_actual,
    COALESCE(SUM(d.payment_made), 0) as debt_payments
  FROM public.months m
  LEFT JOIN public.monthly_income_sep i ON i.month_id = m.id
  LEFT JOIN public.monthly_transactions_sep t ON t.month_id = m.id
  LEFT JOIN public.monthly_budget_sep b ON b.month_id = m.id
  LEFT JOIN public.monthly_debts_sep d ON d.month_id = m.id
  WHERE m.id = 9
  GROUP BY m.id, m.name, m.year

  UNION ALL

  -- October
  SELECT
    10 as month_id,
    m.name as month_name,
    m.year,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as net_cash_flow,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as needs_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as wants_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as future_actual,
    COALESCE(SUM(d.payment_made), 0) as debt_payments
  FROM public.months m
  LEFT JOIN public.monthly_income_oct i ON i.month_id = m.id
  LEFT JOIN public.monthly_transactions_oct t ON t.month_id = m.id
  LEFT JOIN public.monthly_budget_oct b ON b.month_id = m.id
  LEFT JOIN public.monthly_debts_oct d ON d.month_id = m.id
  WHERE m.id = 10
  GROUP BY m.id, m.name, m.year

  UNION ALL

  -- November
  SELECT
    11 as month_id,
    m.name as month_name,
    m.year,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as net_cash_flow,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as needs_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as wants_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as future_actual,
    COALESCE(SUM(d.payment_made), 0) as debt_payments
  FROM public.months m
  LEFT JOIN public.monthly_income_nov i ON i.month_id = m.id
  LEFT JOIN public.monthly_transactions_nov t ON t.month_id = m.id
  LEFT JOIN public.monthly_budget_nov b ON b.month_id = m.id
  LEFT JOIN public.monthly_debts_nov d ON d.month_id = m.id
  WHERE m.id = 11
  GROUP BY m.id, m.name, m.year

  UNION ALL

  -- December
  SELECT
    12 as month_id,
    m.name as month_name,
    m.year,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN i.amount > 0 THEN i.amount ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN t.amount < 0 THEN t.amount ELSE 0 END), 0) as net_cash_flow,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as needs_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as wants_actual,
    COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN COALESCE(b.actual, b.spent_amount, 0) ELSE 0 END), 0) as future_actual,
    COALESCE(SUM(d.payment_made), 0) as debt_payments
  FROM public.months m
  LEFT JOIN public.monthly_income_dec i ON i.month_id = m.id
  LEFT JOIN public.monthly_transactions_dec t ON t.month_id = m.id
  LEFT JOIN public.monthly_budget_dec b ON b.month_id = m.id
  LEFT JOIN public.monthly_debts_dec d ON d.month_id = m.id
  WHERE m.id = 12
  GROUP BY m.id, m.name, m.year
)
SELECT * FROM all_months
ORDER BY month_id;

-- ============================================================================
-- PART 6: Create view_annual_summary view
-- ============================================================================

CREATE OR REPLACE VIEW view_annual_summary AS
SELECT
  SUM(total_income) as annual_income,
  SUM(total_expenses) as annual_expenses,
  SUM(net_cash_flow) as annual_net_cash_flow,
  SUM(needs_actual) as annual_needs_actual,
  SUM(wants_actual) as annual_wants_actual,
  SUM(future_actual) as annual_future_actual,
  SUM(debt_payments) as annual_debt_payments
FROM view_monthly_summary;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 'Migration completed! Views and functions created successfully.' AS status;
