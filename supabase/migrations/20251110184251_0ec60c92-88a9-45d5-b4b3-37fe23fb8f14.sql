-- Fix security warnings from Phase 1 migration

-- Enable RLS on months table (publicly readable, no user ownership)
ALTER TABLE public.months ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Months are viewable by everyone"
  ON public.months FOR SELECT
  USING (true);

-- Enable RLS on currencies table (publicly readable, no user ownership)
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Currencies are viewable by everyone"
  ON public.currencies FOR SELECT
  USING (true);

-- Fix search_path for existing functions by dropping triggers first
DROP TRIGGER IF EXISTS calculate_ending_balance_jan ON public.monthly_debts_jan;
DROP TRIGGER IF EXISTS update_variance_jan ON public.monthly_budget_jan;

DROP FUNCTION IF EXISTS calculate_debt_ending_balance_jan();
DROP FUNCTION IF EXISTS update_budget_variance_jan();

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION calculate_debt_ending_balance_jan()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ending_balance := NEW.starting_balance 
    + (NEW.starting_balance * NEW.interest_rate_apr / 100 / 12) 
    - NEW.payment_made;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_budget_variance_jan()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance := NEW.assigned - NEW.actual;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate triggers
CREATE TRIGGER calculate_ending_balance_jan
  BEFORE INSERT OR UPDATE ON public.monthly_debts_jan
  FOR EACH ROW
  EXECUTE FUNCTION calculate_debt_ending_balance_jan();

CREATE TRIGGER update_variance_jan
  BEFORE INSERT OR UPDATE ON public.monthly_budget_jan
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance_jan();