-- Migration: Fix budget table columns
-- Rename columns from estimated/assigned/actual to planned_amount/spent_amount
-- This ensures compatibility with application queries

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate budget variance
CREATE OR REPLACE FUNCTION update_budget_variance(
  p_month VARCHAR,
  p_planned_amount DECIMAL,
  p_spent_amount DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  RETURN p_spent_amount - p_planned_amount;
END;
$$ LANGUAGE plpgsql;

-- For each month, we'll:
-- 1. Add new columns (planned_amount, spent_amount)
-- 2. Populate them from old columns (estimated, assigned, actual)
-- 3. Drop old columns
-- 4. Rename new columns to final names

DO $$
DECLARE
  months_array VARCHAR[] := ARRAY['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  month_abbr VARCHAR;
  table_name VARCHAR;
BEGIN
  FOREACH month_abbr IN ARRAY months_array LOOP
    table_name := 'monthly_budget_' || month_abbr;
    
    -- Add new columns if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE information_schema.columns.table_name = 'monthly_budget_' || month_abbr AND column_name = 'planned_amount'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN planned_amount DECIMAL(12,2)', table_name);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE information_schema.columns.table_name = 'monthly_budget_' || month_abbr AND column_name = 'spent_amount'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN spent_amount DECIMAL(12,2)', table_name);
    END IF;
    
    -- Populate new columns from old columns
    EXECUTE format(
      'UPDATE public.%I SET planned_amount = estimated, spent_amount = actual WHERE planned_amount IS NULL',
      table_name
    );
    
    -- Set defaults for new columns
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN planned_amount SET DEFAULT 0', table_name);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN spent_amount SET DEFAULT 0', table_name);
    
    -- Drop old columns
    BEGIN
      EXECUTE format('ALTER TABLE public.%I DROP COLUMN IF EXISTS estimated', table_name);
      EXECUTE format('ALTER TABLE public.%I DROP COLUMN IF EXISTS assigned', table_name);
      EXECUTE format('ALTER TABLE public.%I DROP COLUMN IF EXISTS actual', table_name);
    EXCEPTION WHEN OTHERS THEN
      -- Ignore if column doesn't exist or has dependencies
      NULL;
    END;
    
    -- Create or replace trigger for variance calculation
    EXECUTE format(
      'CREATE OR REPLACE FUNCTION update_budget_variance_%s() RETURNS TRIGGER AS $inner$
       BEGIN
         NEW.variance = NEW.spent_amount - NEW.planned_amount;
         RETURN NEW;
       END;
       $inner$ LANGUAGE plpgsql',
      month_abbr
    );
    
    -- Drop old trigger if exists and create new one
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS update_variance_%s ON public.%I', month_abbr, table_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    EXECUTE format(
      'CREATE TRIGGER update_variance_%s BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_budget_variance_%s()',
      month_abbr,
      table_name,
      month_abbr
    );
    
  END LOOP;
END $$;

-- Add updated_at trigger to all budget tables
DO $$
DECLARE
  months_array VARCHAR[] := ARRAY['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  month_abbr VARCHAR;
  table_name VARCHAR;
BEGIN
  FOREACH month_abbr IN ARRAY months_array LOOP
    table_name := 'monthly_budget_' || month_abbr;
    
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS update_monthly_budget_%s_updated_at ON public.%I', month_abbr, table_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    EXECUTE format(
      'CREATE TRIGGER update_monthly_budget_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      month_abbr,
      table_name
    );
  END LOOP;
END $$;
