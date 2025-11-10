-- Complete Phase 2: Add remaining trigger functions for Mar-Dec

-- MARCH triggers
CREATE OR REPLACE FUNCTION calculate_debt_ending_balance_mar()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ending_balance := NEW.starting_balance 
    + (NEW.starting_balance * NEW.interest_rate_apr / 100 / 12) 
    - NEW.payment_made;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_ending_balance_mar
  BEFORE INSERT OR UPDATE ON public.monthly_debts_mar
  FOR EACH ROW
  EXECUTE FUNCTION calculate_debt_ending_balance_mar();

CREATE OR REPLACE FUNCTION update_budget_variance_mar()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance := NEW.assigned - NEW.actual;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_variance_mar
  BEFORE INSERT OR UPDATE ON public.monthly_budget_mar
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance_mar();

-- APRIL triggers
CREATE OR REPLACE FUNCTION calculate_debt_ending_balance_apr()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ending_balance := NEW.starting_balance 
    + (NEW.starting_balance * NEW.interest_rate_apr / 100 / 12) 
    - NEW.payment_made;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_ending_balance_apr
  BEFORE INSERT OR UPDATE ON public.monthly_debts_apr
  FOR EACH ROW
  EXECUTE FUNCTION calculate_debt_ending_balance_apr();

CREATE OR REPLACE FUNCTION update_budget_variance_apr()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance := NEW.assigned - NEW.actual;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_variance_apr
  BEFORE INSERT OR UPDATE ON public.monthly_budget_apr
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance_apr();

-- MAY triggers
CREATE OR REPLACE FUNCTION calculate_debt_ending_balance_may()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ending_balance := NEW.starting_balance 
    + (NEW.starting_balance * NEW.interest_rate_apr / 100 / 12) 
    - NEW.payment_made;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_ending_balance_may
  BEFORE INSERT OR UPDATE ON public.monthly_debts_may
  FOR EACH ROW
  EXECUTE FUNCTION calculate_debt_ending_balance_may();

CREATE OR REPLACE FUNCTION update_budget_variance_may()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance := NEW.assigned - NEW.actual;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_variance_may
  BEFORE INSERT OR UPDATE ON public.monthly_budget_may
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance_may();

-- JUNE triggers
CREATE OR REPLACE FUNCTION calculate_debt_ending_balance_jun()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ending_balance := NEW.starting_balance 
    + (NEW.starting_balance * NEW.interest_rate_apr / 100 / 12) 
    - NEW.payment_made;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_ending_balance_jun
  BEFORE INSERT OR UPDATE ON public.monthly_debts_jun
  FOR EACH ROW
  EXECUTE FUNCTION calculate_debt_ending_balance_jun();

CREATE OR REPLACE FUNCTION update_budget_variance_jun()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance := NEW.assigned - NEW.actual;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_variance_jun
  BEFORE INSERT OR UPDATE ON public.monthly_budget_jun
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance_jun();

-- JULY triggers
CREATE OR REPLACE FUNCTION calculate_debt_ending_balance_jul()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ending_balance := NEW.starting_balance 
    + (NEW.starting_balance * NEW.interest_rate_apr / 100 / 12) 
    - NEW.payment_made;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_ending_balance_jul
  BEFORE INSERT OR UPDATE ON public.monthly_debts_jul
  FOR EACH ROW
  EXECUTE FUNCTION calculate_debt_ending_balance_jul();

CREATE OR REPLACE FUNCTION update_budget_variance_jul()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance := NEW.assigned - NEW.actual;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_variance_jul
  BEFORE INSERT OR UPDATE ON public.monthly_budget_jul
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance_jul();

-- AUGUST triggers
CREATE OR REPLACE FUNCTION calculate_debt_ending_balance_aug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ending_balance := NEW.starting_balance 
    + (NEW.starting_balance * NEW.interest_rate_apr / 100 / 12) 
    - NEW.payment_made;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_ending_balance_aug
  BEFORE INSERT OR UPDATE ON public.monthly_debts_aug
  FOR EACH ROW
  EXECUTE FUNCTION calculate_debt_ending_balance_aug();

CREATE OR REPLACE FUNCTION update_budget_variance_aug()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance := NEW.assigned - NEW.actual;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_variance_aug
  BEFORE INSERT OR UPDATE ON public.monthly_budget_aug
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance_aug();

-- SEPTEMBER triggers
CREATE OR REPLACE FUNCTION calculate_debt_ending_balance_sep()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ending_balance := NEW.starting_balance 
    + (NEW.starting_balance * NEW.interest_rate_apr / 100 / 12) 
    - NEW.payment_made;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_ending_balance_sep
  BEFORE INSERT OR UPDATE ON public.monthly_debts_sep
  FOR EACH ROW
  EXECUTE FUNCTION calculate_debt_ending_balance_sep();

CREATE OR REPLACE FUNCTION update_budget_variance_sep()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance := NEW.assigned - NEW.actual;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_variance_sep
  BEFORE INSERT OR UPDATE ON public.monthly_budget_sep
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance_sep();

-- OCTOBER triggers
CREATE OR REPLACE FUNCTION calculate_debt_ending_balance_oct()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ending_balance := NEW.starting_balance 
    + (NEW.starting_balance * NEW.interest_rate_apr / 100 / 12) 
    - NEW.payment_made;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_ending_balance_oct
  BEFORE INSERT OR UPDATE ON public.monthly_debts_oct
  FOR EACH ROW
  EXECUTE FUNCTION calculate_debt_ending_balance_oct();

CREATE OR REPLACE FUNCTION update_budget_variance_oct()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance := NEW.assigned - NEW.actual;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_variance_oct
  BEFORE INSERT OR UPDATE ON public.monthly_budget_oct
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance_oct();

-- NOVEMBER triggers
CREATE OR REPLACE FUNCTION calculate_debt_ending_balance_nov()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ending_balance := NEW.starting_balance 
    + (NEW.starting_balance * NEW.interest_rate_apr / 100 / 12) 
    - NEW.payment_made;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_ending_balance_nov
  BEFORE INSERT OR UPDATE ON public.monthly_debts_nov
  FOR EACH ROW
  EXECUTE FUNCTION calculate_debt_ending_balance_nov();

CREATE OR REPLACE FUNCTION update_budget_variance_nov()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance := NEW.assigned - NEW.actual;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_variance_nov
  BEFORE INSERT OR UPDATE ON public.monthly_budget_nov
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance_nov();

-- DECEMBER triggers
CREATE OR REPLACE FUNCTION calculate_debt_ending_balance_dec()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ending_balance := NEW.starting_balance 
    + (NEW.starting_balance * NEW.interest_rate_apr / 100 / 12) 
    - NEW.payment_made;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_ending_balance_dec
  BEFORE INSERT OR UPDATE ON public.monthly_debts_dec
  FOR EACH ROW
  EXECUTE FUNCTION calculate_debt_ending_balance_dec();

CREATE OR REPLACE FUNCTION update_budget_variance_dec()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance := NEW.assigned - NEW.actual;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_variance_dec
  BEFORE INSERT OR UPDATE ON public.monthly_budget_dec
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance_dec();