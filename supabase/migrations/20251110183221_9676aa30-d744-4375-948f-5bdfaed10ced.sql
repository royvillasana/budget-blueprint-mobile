-- ============================================
-- PHASE 1: Global Tables + January Month Tables
-- ============================================

-- Global Tables
-- ============================================

-- 1. Months table
CREATE TABLE public.months (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER NOT NULL DEFAULT 2025,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT,
  bucket_50_30_20 TEXT NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE')),
  is_active BOOLEAN DEFAULT true,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Payment Methods table
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CASH', 'CREDIT', 'DEBIT', 'TRANSFER', 'OTHER')),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment methods"
  ON public.payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment methods"
  ON public.payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
  ON public.payment_methods FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
  ON public.payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Accounts table
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'LOAN', 'OTHER')),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own accounts"
  ON public.accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON public.accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON public.accounts FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Currencies table
CREATE TABLE public.currencies (
  code TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  rate_to_eur DECIMAL(10, 6),
  rate_to_usd DECIMAL(10, 6),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default currencies
INSERT INTO public.currencies (code, symbol, rate_to_eur, rate_to_usd) VALUES
  ('EUR', '€', 1.0, 1.09),
  ('USD', '$', 0.92, 1.0),
  ('CLP', '$', 0.00095, 0.00103);

-- ============================================
-- JANUARY MONTHLY TABLES
-- ============================================

-- 1. Monthly Transactions (January)
CREATE TABLE public.monthly_transactions_jan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id INTEGER NOT NULL REFERENCES public.months(id),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  amount DECIMAL(12, 2) NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('EXPENSE', 'ADJUSTMENT')),
  payment_method_id UUID REFERENCES public.payment_methods(id),
  account_id UUID REFERENCES public.accounts(id),
  currency_code TEXT NOT NULL REFERENCES public.currencies(code),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.monthly_transactions_jan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON public.monthly_transactions_jan FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
  ON public.monthly_transactions_jan FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.monthly_transactions_jan FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.monthly_transactions_jan FOR DELETE
  USING (auth.uid() = user_id);

-- 2. Monthly Income (January)
CREATE TABLE public.monthly_income_jan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id INTEGER NOT NULL REFERENCES public.months(id),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  source TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  account_id UUID REFERENCES public.accounts(id),
  currency_code TEXT NOT NULL REFERENCES public.currencies(code),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.monthly_income_jan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income"
  ON public.monthly_income_jan FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income"
  ON public.monthly_income_jan FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income"
  ON public.monthly_income_jan FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income"
  ON public.monthly_income_jan FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Monthly Budget (January)
CREATE TABLE public.monthly_budget_jan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id INTEGER NOT NULL REFERENCES public.months(id),
  user_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  bucket_50_30_20 TEXT NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE')),
  estimated DECIMAL(12, 2) DEFAULT 0,
  assigned DECIMAL(12, 2) DEFAULT 0,
  actual DECIMAL(12, 2) DEFAULT 0,
  variance DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.monthly_budget_jan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget"
  ON public.monthly_budget_jan FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget"
  ON public.monthly_budget_jan FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget"
  ON public.monthly_budget_jan FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget"
  ON public.monthly_budget_jan FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Monthly Debts (January)
CREATE TABLE public.monthly_debts_jan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id INTEGER NOT NULL REFERENCES public.months(id),
  user_id UUID NOT NULL,
  debt_account_id UUID NOT NULL REFERENCES public.accounts(id),
  starting_balance DECIMAL(12, 2) NOT NULL,
  min_payment DECIMAL(12, 2) NOT NULL,
  payment_made DECIMAL(12, 2) DEFAULT 0,
  interest_rate_apr DECIMAL(5, 2) DEFAULT 0,
  due_day INTEGER CHECK (due_day >= 1 AND due_day <= 31),
  ending_balance DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.monthly_debts_jan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts"
  ON public.monthly_debts_jan FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts"
  ON public.monthly_debts_jan FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts"
  ON public.monthly_debts_jan FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts"
  ON public.monthly_debts_jan FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Monthly Wishlist (January)
CREATE TABLE public.monthly_wishlist_jan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id INTEGER NOT NULL REFERENCES public.months(id),
  user_id UUID NOT NULL,
  item TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  estimated_cost DECIMAL(12, 2) DEFAULT 0,
  priority TEXT CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  acquired BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.monthly_wishlist_jan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist"
  ON public.monthly_wishlist_jan FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist"
  ON public.monthly_wishlist_jan FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist"
  ON public.monthly_wishlist_jan FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist"
  ON public.monthly_wishlist_jan FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Monthly Settings (January)
CREATE TABLE public.monthly_settings_jan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id INTEGER NOT NULL REFERENCES public.months(id),
  user_id UUID NOT NULL,
  carryover_prev_balance DECIMAL(12, 2) DEFAULT 0,
  budget_mode TEXT NOT NULL DEFAULT 'ZERO_BASED' CHECK (budget_mode IN ('ZERO_BASED', 'COPY_PREVIOUS')),
  unassigned_pool DECIMAL(12, 2) DEFAULT 0,
  monthly_challenge TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.monthly_settings_jan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON public.monthly_settings_jan FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
  ON public.monthly_settings_jan FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.monthly_settings_jan FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings"
  ON public.monthly_settings_jan FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS FOR AUTOMATED CALCULATIONS
-- ============================================

-- Function to recalculate budget actuals (January)
CREATE OR REPLACE FUNCTION recalculate_budget_actuals_jan()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.monthly_budget_jan
  SET 
    actual = (
      SELECT COALESCE(SUM(ABS(amount)), 0)
      FROM public.monthly_transactions_jan
      WHERE category_id = monthly_budget_jan.category_id
        AND month_id = monthly_budget_jan.month_id
        AND direction = 'EXPENSE'
    ),
    variance = assigned - actual,
    updated_at = now()
  WHERE month_id = COALESCE(NEW.month_id, OLD.month_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on transactions to update budget actuals
CREATE TRIGGER update_budget_on_transaction_jan
  AFTER INSERT OR UPDATE OR DELETE ON public.monthly_transactions_jan
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_budget_actuals_jan();

-- Function to calculate debt ending balance
CREATE OR REPLACE FUNCTION calculate_debt_ending_balance_jan()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ending_balance := NEW.starting_balance 
    + (NEW.starting_balance * NEW.interest_rate_apr / 100 / 12) 
    - NEW.payment_made;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_ending_balance_jan
  BEFORE INSERT OR UPDATE ON public.monthly_debts_jan
  FOR EACH ROW
  EXECUTE FUNCTION calculate_debt_ending_balance_jan();

-- Trigger to update variance on budget changes
CREATE OR REPLACE FUNCTION update_budget_variance_jan()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance := NEW.assigned - NEW.actual;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_variance_jan
  BEFORE INSERT OR UPDATE ON public.monthly_budget_jan
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance_jan();

-- ============================================
-- SEED DATA FOR MONTHS
-- ============================================

INSERT INTO public.months (id, name, year, start_date, end_date) VALUES
  (1, 'January', 2025, '2025-01-01', '2025-01-31'),
  (2, 'February', 2025, '2025-02-01', '2025-02-28'),
  (3, 'March', 2025, '2025-03-01', '2025-03-31'),
  (4, 'April', 2025, '2025-04-01', '2025-04-30'),
  (5, 'May', 2025, '2025-05-01', '2025-05-31'),
  (6, 'June', 2025, '2025-06-01', '2025-06-30'),
  (7, 'July', 2025, '2025-07-01', '2025-07-31'),
  (8, 'August', 2025, '2025-08-01', '2025-08-31'),
  (9, 'September', 2025, '2025-09-01', '2025-09-30'),
  (10, 'October', 2025, '2025-10-01', '2025-10-31'),
  (11, 'November', 2025, '2025-11-01', '2025-11-30'),
  (12, 'December', 2025, '2025-12-01', '2025-12-31');