-- Migration: Fix wishlist columns and add remaining calculation
-- Update wishlist tables to have remaining column

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- For each wishlist month, add remaining column if it doesn't exist
DO $$
DECLARE
  months_array VARCHAR[] := ARRAY['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  month_abbr VARCHAR;
  table_name VARCHAR;
BEGIN
  FOREACH month_abbr IN ARRAY months_array LOOP
    table_name := 'monthly_wishlist_' || month_abbr;
    
    -- Add remaining column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE information_schema.columns.table_name = 'monthly_wishlist_' || month_abbr AND column_name = 'remaining'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN remaining DECIMAL(12,2)', table_name);
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE information_schema.columns.table_name = 'monthly_wishlist_' || month_abbr AND column_name = 'updated_at'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP', table_name);
    END IF;
    
    -- Calculate remaining column (estimated_cost - (select total where acquired is true))
    EXECUTE format(
      'UPDATE public.%I SET remaining = estimated_cost WHERE remaining IS NULL OR remaining = 0',
      table_name
    );
    
    -- Create or update trigger for updated_at
    BEGIN
      EXECUTE format('DROP TRIGGER IF EXISTS update_monthly_wishlist_%s_updated_at ON public.%I', month_abbr, table_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    EXECUTE format(
      'CREATE TRIGGER update_monthly_wishlist_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      month_abbr,
      table_name
    );
    
  END LOOP;
END $$;
