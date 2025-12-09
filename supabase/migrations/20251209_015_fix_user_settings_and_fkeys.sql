-- Migration: Fix RLS policies for REST API access

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON public.user_settings;

-- Create new policies that work with Supabase REST API
CREATE POLICY "Enable select for authenticated users" ON public.user_settings
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON public.user_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for authenticated users" ON public.user_settings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for authenticated users" ON public.user_settings
    FOR DELETE
    USING (auth.uid() = user_id);

-- Ensure all monthly transaction tables have proper foreign key constraints
-- This fixes the issue where Supabase can't find relationships

DO $$
DECLARE
  months_array VARCHAR[] := ARRAY['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  month_abbr VARCHAR;
  table_name VARCHAR;
BEGIN
  FOREACH month_abbr IN ARRAY months_array LOOP
    table_name := 'monthly_transactions_' || month_abbr;
    
    -- Add foreign key constraints if they don't exist
    BEGIN
      EXECUTE format('
        ALTER TABLE public.%I
        ADD CONSTRAINT %I_category_id_fkey 
        FOREIGN KEY (category_id) 
        REFERENCES public.categories(id)
        ON DELETE CASCADE
      ', table_name, table_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    BEGIN
      EXECUTE format('
        ALTER TABLE public.%I
        ADD CONSTRAINT %I_payment_method_id_fkey 
        FOREIGN KEY (payment_method_id) 
        REFERENCES public.payment_methods(id)
        ON DELETE SET NULL
      ', table_name, table_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
    
    BEGIN
      EXECUTE format('
        ALTER TABLE public.%I
        ADD CONSTRAINT %I_account_id_fkey 
        FOREIGN KEY (account_id) 
        REFERENCES public.accounts(id)
        ON DELETE SET NULL
      ', table_name, table_name);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END $$;
