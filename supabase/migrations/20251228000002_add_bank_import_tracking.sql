-- Migration: 20251228000002_add_bank_import_tracking.sql
-- Add bank transaction tracking to monthly_transactions tables

-- Add bank_transaction_id to all monthly_transactions tables (for all 12 months)
-- This links imported transactions back to their source

DO $$
DECLARE
  month_suffix TEXT;
BEGIN
  FOR month_suffix IN
    SELECT unnest(ARRAY['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])
  LOOP
    -- Add bank_transaction_id column if it doesn't exist
    EXECUTE format('
      ALTER TABLE public.monthly_transactions_%s
      ADD COLUMN IF NOT EXISTS bank_transaction_id UUID REFERENCES public.bank_transactions(id) ON DELETE SET NULL
    ', month_suffix);

    -- Add index for faster lookups
    EXECUTE format('
      CREATE INDEX IF NOT EXISTS idx_monthly_transactions_%s_bank_txn
      ON public.monthly_transactions_%s(bank_transaction_id)
    ', month_suffix, month_suffix);

    -- Add unique index to prevent duplicate imports (only for non-NULL values)
    EXECUTE format('
      DROP INDEX IF EXISTS unique_bank_import_%s
    ', month_suffix);

    EXECUTE format('
      CREATE UNIQUE INDEX unique_bank_import_%s
      ON public.monthly_transactions_%s(bank_transaction_id)
      WHERE bank_transaction_id IS NOT NULL
    ', month_suffix, month_suffix);
  END LOOP;
END $$;

-- Similarly for monthly_income tables
DO $$
DECLARE
  month_suffix TEXT;
BEGIN
  FOR month_suffix IN
    SELECT unnest(ARRAY['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'])
  LOOP
    EXECUTE format('
      ALTER TABLE public.monthly_income_%s
      ADD COLUMN IF NOT EXISTS bank_transaction_id UUID REFERENCES public.bank_transactions(id) ON DELETE SET NULL
    ', month_suffix);

    EXECUTE format('
      CREATE INDEX IF NOT EXISTS idx_monthly_income_%s_bank_txn
      ON public.monthly_income_%s(bank_transaction_id)
    ', month_suffix, month_suffix);

    EXECUTE format('
      DROP INDEX IF EXISTS unique_bank_import_income_%s
    ', month_suffix);

    EXECUTE format('
      CREATE UNIQUE INDEX unique_bank_import_income_%s
      ON public.monthly_income_%s(bank_transaction_id)
      WHERE bank_transaction_id IS NOT NULL
    ', month_suffix, month_suffix);
  END LOOP;
END $$;

-- Create a helper function to auto-categorize transactions
CREATE OR REPLACE FUNCTION auto_categorize_transaction(
  merchant_name TEXT,
  description TEXT,
  amount NUMERIC
) RETURNS UUID AS $$
DECLARE
  category_id UUID;
  merchant_lower TEXT;
  description_lower TEXT;
BEGIN
  merchant_lower := LOWER(COALESCE(merchant_name, ''));
  description_lower := LOWER(COALESCE(description, ''));

  -- Try to match by merchant/description keywords
  -- Groceries
  IF merchant_lower ~ '(mercadona|carrefour|lidl|dia|alcampo|eroski|super|market)'
     OR description_lower ~ '(grocery|groceries|supermercado|alimentacion)' THEN
    SELECT id INTO category_id FROM public.categories
    WHERE name ILIKE '%grocery%' OR name ILIKE '%groceries%' OR name ILIKE '%alimentación%' OR emoji = '🛒'
    LIMIT 1;
    IF category_id IS NOT NULL THEN RETURN category_id; END IF;
  END IF;

  -- Restaurants
  IF merchant_lower ~ '(restaurant|cafe|cafeteria|bar|mcdonald|burger|pizza|kebab)'
     OR description_lower ~ '(restaurant|dining|comida|cena)' THEN
    SELECT id INTO category_id FROM public.categories
    WHERE name ILIKE '%restaurant%' OR name ILIKE '%dining%' OR name ILIKE '%comida%' OR emoji = '🍽️'
    LIMIT 1;
    IF category_id IS NOT NULL THEN RETURN category_id; END IF;
  END IF;

  -- Transportation
  IF merchant_lower ~ '(uber|cabify|taxi|gasolinera|shell|repsol|cepsa|parking|renfe|metro)'
     OR description_lower ~ '(transport|fuel|gasolina|parking)' THEN
    SELECT id INTO category_id FROM public.categories
    WHERE name ILIKE '%transport%' OR name ILIKE '%transporte%' OR emoji IN ('🚗', '⛽', '🚕')
    LIMIT 1;
    IF category_id IS NOT NULL THEN RETURN category_id; END IF;
  END IF;

  -- Entertainment
  IF merchant_lower ~ '(netflix|spotify|amazon prime|hbo|disney|cinema|cine)'
     OR description_lower ~ '(entertainment|streaming|subscription)' THEN
    SELECT id INTO category_id FROM public.categories
    WHERE name ILIKE '%entertainment%' OR name ILIKE '%entretenimiento%' OR emoji = '🎬'
    LIMIT 1;
    IF category_id IS NOT NULL THEN RETURN category_id; END IF;
  END IF;

  -- Utilities
  IF merchant_lower ~ '(iberdrola|endesa|gas natural|telefonica|vodafone|orange|movistar|agua)'
     OR description_lower ~ '(utilities|luz|agua|gas|telefono|internet)' THEN
    SELECT id INTO category_id FROM public.categories
    WHERE name ILIKE '%utilities%' OR name ILIKE '%servicios%' OR emoji IN ('💡', '💧', '📱')
    LIMIT 1;
    IF category_id IS NOT NULL THEN RETURN category_id; END IF;
  END IF;

  -- Shopping
  IF merchant_lower ~ '(amazon|zara|h&m|mango|el corte|fnac|media markt)'
     OR description_lower ~ '(shopping|compras|tienda)' THEN
    SELECT id INTO category_id FROM public.categories
    WHERE name ILIKE '%shopping%' OR name ILIKE '%compras%' OR emoji = '🛍️'
    LIMIT 1;
    IF category_id IS NOT NULL THEN RETURN category_id; END IF;
  END IF;

  -- Health
  IF merchant_lower ~ '(farmacia|pharmacy|hospital|clinica|medico|doctor)'
     OR description_lower ~ '(health|salud|medical|medico)' THEN
    SELECT id INTO category_id FROM public.categories
    WHERE name ILIKE '%health%' OR name ILIKE '%salud%' OR emoji IN ('🏥', '💊')
    LIMIT 1;
    IF category_id IS NOT NULL THEN RETURN category_id; END IF;
  END IF;

  -- Default: Return first "Other" or "Miscellaneous" category
  SELECT id INTO category_id FROM public.categories
  WHERE name ILIKE '%other%' OR name ILIKE '%misc%' OR name ILIKE '%otros%'
  LIMIT 1;

  -- If still no category, return first available category
  IF category_id IS NULL THEN
    SELECT id INTO category_id FROM public.categories LIMIT 1;
  END IF;

  RETURN category_id;
END;
$$ LANGUAGE plpgsql;
