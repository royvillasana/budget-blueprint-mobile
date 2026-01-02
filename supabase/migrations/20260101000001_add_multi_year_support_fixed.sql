-- Migration: Add Multi-Year Support to Monthly Tables (Fixed)
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
-- Update view_transactions_all to include year (simplified - no color/icon)
-- ============================================================================

CREATE OR REPLACE VIEW public.view_transactions_all AS
SELECT
  t.id,
  t.month_id,
  t.user_id,
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
  t.month_id,
  t.user_id,
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
  t.month_id,
  t.user_id,
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
  t.month_id,
  t.user_id,
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
  t.month_id,
  t.user_id,
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
  t.month_id,
  t.user_id,
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
  t.month_id,
  t.user_id,
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
  t.month_id,
  t.user_id,
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
  t.month_id,
  t.user_id,
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
  t.month_id,
  t.user_id,
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
  t.month_id,
  t.user_id,
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
  t.month_id,
  t.user_id,
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

-- Grant access to view
GRANT SELECT ON public.view_transactions_all TO authenticated, anon;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN public.monthly_transactions_jan.year IS 'Year for this transaction (enables multi-year support)';
COMMENT ON FUNCTION public.get_available_months_and_years IS 'Returns all months and years that have transaction data for the current user';
