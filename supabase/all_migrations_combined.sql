-- Create monthly_budgets table
CREATE TABLE public.monthly_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  monthly_goal TEXT,
  previous_balance DECIMAL(12, 2) DEFAULT 0,
  add_previous_balance BOOLEAN DEFAULT false,
  budget_from_scratch BOOLEAN DEFAULT true,
  total_income_estimated DECIMAL(12, 2) DEFAULT 0,
  total_income_actual DECIMAL(12, 2) DEFAULT 0,
  debt_contribution DECIMAL(12, 2) DEFAULT 0,
  budget_allocated DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, year, month)
);

-- Create income_items table
CREATE TABLE public.income_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_budget_id UUID NOT NULL REFERENCES public.monthly_budgets(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  estimated DECIMAL(12, 2) DEFAULT 0,
  actual DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create budget_categories table
CREATE TABLE public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_budget_id UUID NOT NULL REFERENCES public.monthly_budgets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('needs', 'desires', 'savings', 'investments', 'debts')),
  category_name TEXT NOT NULL,
  estimated DECIMAL(12, 2) DEFAULT 0,
  actual DECIMAL(12, 2) DEFAULT 0,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_budget_id UUID NOT NULL REFERENCES public.monthly_budgets(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  concept TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create annual_goals table
CREATE TABLE public.annual_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  main_financial_goal TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, year)
);

-- Create financial_goals table
CREATE TABLE public.financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annual_goal_id UUID NOT NULL REFERENCES public.annual_goals(id) ON DELETE CASCADE,
  goal_text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wish_list table
CREATE TABLE public.wish_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_budget_id UUID NOT NULL REFERENCES public.monthly_budgets(id) ON DELETE CASCADE,
  wish_text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create todo_list table
CREATE TABLE public.todo_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_budget_id UUID NOT NULL REFERENCES public.monthly_budgets(id) ON DELETE CASCADE,
  task_text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.monthly_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annual_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wish_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_list ENABLE ROW LEVEL SECURITY;

-- RLS Policies for monthly_budgets
CREATE POLICY "Users can view their own monthly budgets"
  ON public.monthly_budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own monthly budgets"
  ON public.monthly_budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly budgets"
  ON public.monthly_budgets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monthly budgets"
  ON public.monthly_budgets FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for income_items
CREATE POLICY "Users can view their own income items"
  ON public.income_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = income_items.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own income items"
  ON public.income_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = income_items.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own income items"
  ON public.income_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = income_items.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own income items"
  ON public.income_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = income_items.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

-- RLS Policies for budget_categories
CREATE POLICY "Users can view their own budget categories"
  ON public.budget_categories FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = budget_categories.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own budget categories"
  ON public.budget_categories FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = budget_categories.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own budget categories"
  ON public.budget_categories FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = budget_categories.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own budget categories"
  ON public.budget_categories FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = budget_categories.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = transactions.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = transactions.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = transactions.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = transactions.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

-- RLS Policies for annual_goals
CREATE POLICY "Users can view their own annual goals"
  ON public.annual_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own annual goals"
  ON public.annual_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own annual goals"
  ON public.annual_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own annual goals"
  ON public.annual_goals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for financial_goals
CREATE POLICY "Users can view their own financial goals"
  ON public.financial_goals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.annual_goals
    WHERE annual_goals.id = financial_goals.annual_goal_id
    AND annual_goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own financial goals"
  ON public.financial_goals FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.annual_goals
    WHERE annual_goals.id = financial_goals.annual_goal_id
    AND annual_goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own financial goals"
  ON public.financial_goals FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.annual_goals
    WHERE annual_goals.id = financial_goals.annual_goal_id
    AND annual_goals.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own financial goals"
  ON public.financial_goals FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.annual_goals
    WHERE annual_goals.id = financial_goals.annual_goal_id
    AND annual_goals.user_id = auth.uid()
  ));

-- RLS Policies for wish_list
CREATE POLICY "Users can view their own wish list"
  ON public.wish_list FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = wish_list.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own wish list items"
  ON public.wish_list FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = wish_list.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own wish list items"
  ON public.wish_list FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = wish_list.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own wish list items"
  ON public.wish_list FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = wish_list.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

-- RLS Policies for todo_list
CREATE POLICY "Users can view their own todo list"
  ON public.todo_list FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = todo_list.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own todo list items"
  ON public.todo_list FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = todo_list.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own todo list items"
  ON public.todo_list FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = todo_list.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own todo list items"
  ON public.todo_list FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.monthly_budgets
    WHERE monthly_budgets.id = todo_list.monthly_budget_id
    AND monthly_budgets.user_id = auth.uid()
  ));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_monthly_budgets_updated_at
  BEFORE UPDATE ON public.monthly_budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_annual_goals_updated_at
  BEFORE UPDATE ON public.annual_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();-- Fix function search_path security issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;-- ============================================
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
  (12, 'December', 2025, '2025-12-01', '2025-12-31');-- Fix security warnings from Phase 1 migration

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
  EXECUTE FUNCTION update_budget_variance_jan();-- Phase 2: Create remaining 11 months (February through December)
-- Each month has identical structure to January with its own tables

-- FEBRUARY TABLES
CREATE TABLE public.monthly_transactions_feb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL,
  amount numeric NOT NULL,
  direction text NOT NULL CHECK (direction IN ('INCOME', 'EXPENSE')),
  payment_method_id uuid,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_income_feb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  source text NOT NULL,
  amount numeric NOT NULL,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_budget_feb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  category_id uuid NOT NULL,
  bucket_50_30_20 text NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE')),
  estimated numeric DEFAULT 0,
  assigned numeric DEFAULT 0,
  actual numeric DEFAULT 0,
  variance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_debts_feb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  debt_account_id uuid NOT NULL,
  starting_balance numeric NOT NULL,
  interest_rate_apr numeric DEFAULT 0,
  min_payment numeric NOT NULL,
  payment_made numeric DEFAULT 0,
  ending_balance numeric DEFAULT 0,
  due_day integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_wishlist_feb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  item text NOT NULL,
  estimated_cost numeric DEFAULT 0,
  category_id uuid,
  priority text,
  acquired boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_settings_feb (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  budget_mode text NOT NULL DEFAULT 'ZERO_BASED' CHECK (budget_mode IN ('ZERO_BASED', 'COPY_PREVIOUS')),
  carryover_prev_balance numeric DEFAULT 0,
  unassigned_pool numeric DEFAULT 0,
  monthly_challenge text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- MARCH TABLES
CREATE TABLE public.monthly_transactions_mar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL,
  amount numeric NOT NULL,
  direction text NOT NULL CHECK (direction IN ('INCOME', 'EXPENSE')),
  payment_method_id uuid,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_income_mar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  source text NOT NULL,
  amount numeric NOT NULL,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_budget_mar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  category_id uuid NOT NULL,
  bucket_50_30_20 text NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE')),
  estimated numeric DEFAULT 0,
  assigned numeric DEFAULT 0,
  actual numeric DEFAULT 0,
  variance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_debts_mar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  debt_account_id uuid NOT NULL,
  starting_balance numeric NOT NULL,
  interest_rate_apr numeric DEFAULT 0,
  min_payment numeric NOT NULL,
  payment_made numeric DEFAULT 0,
  ending_balance numeric DEFAULT 0,
  due_day integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_wishlist_mar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  item text NOT NULL,
  estimated_cost numeric DEFAULT 0,
  category_id uuid,
  priority text,
  acquired boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_settings_mar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  budget_mode text NOT NULL DEFAULT 'ZERO_BASED' CHECK (budget_mode IN ('ZERO_BASED', 'COPY_PREVIOUS')),
  carryover_prev_balance numeric DEFAULT 0,
  unassigned_pool numeric DEFAULT 0,
  monthly_challenge text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- APRIL TABLES
CREATE TABLE public.monthly_transactions_apr (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL,
  amount numeric NOT NULL,
  direction text NOT NULL CHECK (direction IN ('INCOME', 'EXPENSE')),
  payment_method_id uuid,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_income_apr (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  source text NOT NULL,
  amount numeric NOT NULL,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_budget_apr (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  category_id uuid NOT NULL,
  bucket_50_30_20 text NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE')),
  estimated numeric DEFAULT 0,
  assigned numeric DEFAULT 0,
  actual numeric DEFAULT 0,
  variance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_debts_apr (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  debt_account_id uuid NOT NULL,
  starting_balance numeric NOT NULL,
  interest_rate_apr numeric DEFAULT 0,
  min_payment numeric NOT NULL,
  payment_made numeric DEFAULT 0,
  ending_balance numeric DEFAULT 0,
  due_day integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_wishlist_apr (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  item text NOT NULL,
  estimated_cost numeric DEFAULT 0,
  category_id uuid,
  priority text,
  acquired boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_settings_apr (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  budget_mode text NOT NULL DEFAULT 'ZERO_BASED' CHECK (budget_mode IN ('ZERO_BASED', 'COPY_PREVIOUS')),
  carryover_prev_balance numeric DEFAULT 0,
  unassigned_pool numeric DEFAULT 0,
  monthly_challenge text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- MAY TABLES
CREATE TABLE public.monthly_transactions_may (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL,
  amount numeric NOT NULL,
  direction text NOT NULL CHECK (direction IN ('INCOME', 'EXPENSE')),
  payment_method_id uuid,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_income_may (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  source text NOT NULL,
  amount numeric NOT NULL,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_budget_may (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  category_id uuid NOT NULL,
  bucket_50_30_20 text NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE')),
  estimated numeric DEFAULT 0,
  assigned numeric DEFAULT 0,
  actual numeric DEFAULT 0,
  variance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_debts_may (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  debt_account_id uuid NOT NULL,
  starting_balance numeric NOT NULL,
  interest_rate_apr numeric DEFAULT 0,
  min_payment numeric NOT NULL,
  payment_made numeric DEFAULT 0,
  ending_balance numeric DEFAULT 0,
  due_day integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_wishlist_may (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  item text NOT NULL,
  estimated_cost numeric DEFAULT 0,
  category_id uuid,
  priority text,
  acquired boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_settings_may (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  budget_mode text NOT NULL DEFAULT 'ZERO_BASED' CHECK (budget_mode IN ('ZERO_BASED', 'COPY_PREVIOUS')),
  carryover_prev_balance numeric DEFAULT 0,
  unassigned_pool numeric DEFAULT 0,
  monthly_challenge text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- JUNE TABLES
CREATE TABLE public.monthly_transactions_jun (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL,
  amount numeric NOT NULL,
  direction text NOT NULL CHECK (direction IN ('INCOME', 'EXPENSE')),
  payment_method_id uuid,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_income_jun (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  source text NOT NULL,
  amount numeric NOT NULL,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_budget_jun (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  category_id uuid NOT NULL,
  bucket_50_30_20 text NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE')),
  estimated numeric DEFAULT 0,
  assigned numeric DEFAULT 0,
  actual numeric DEFAULT 0,
  variance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_debts_jun (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  debt_account_id uuid NOT NULL,
  starting_balance numeric NOT NULL,
  interest_rate_apr numeric DEFAULT 0,
  min_payment numeric NOT NULL,
  payment_made numeric DEFAULT 0,
  ending_balance numeric DEFAULT 0,
  due_day integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_wishlist_jun (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  item text NOT NULL,
  estimated_cost numeric DEFAULT 0,
  category_id uuid,
  priority text,
  acquired boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_settings_jun (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  budget_mode text NOT NULL DEFAULT 'ZERO_BASED' CHECK (budget_mode IN ('ZERO_BASED', 'COPY_PREVIOUS')),
  carryover_prev_balance numeric DEFAULT 0,
  unassigned_pool numeric DEFAULT 0,
  monthly_challenge text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- JULY TABLES
CREATE TABLE public.monthly_transactions_jul (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL,
  amount numeric NOT NULL,
  direction text NOT NULL CHECK (direction IN ('INCOME', 'EXPENSE')),
  payment_method_id uuid,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_income_jul (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  source text NOT NULL,
  amount numeric NOT NULL,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_budget_jul (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  category_id uuid NOT NULL,
  bucket_50_30_20 text NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE')),
  estimated numeric DEFAULT 0,
  assigned numeric DEFAULT 0,
  actual numeric DEFAULT 0,
  variance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_debts_jul (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  debt_account_id uuid NOT NULL,
  starting_balance numeric NOT NULL,
  interest_rate_apr numeric DEFAULT 0,
  min_payment numeric NOT NULL,
  payment_made numeric DEFAULT 0,
  ending_balance numeric DEFAULT 0,
  due_day integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_wishlist_jul (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  item text NOT NULL,
  estimated_cost numeric DEFAULT 0,
  category_id uuid,
  priority text,
  acquired boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_settings_jul (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  budget_mode text NOT NULL DEFAULT 'ZERO_BASED' CHECK (budget_mode IN ('ZERO_BASED', 'COPY_PREVIOUS')),
  carryover_prev_balance numeric DEFAULT 0,
  unassigned_pool numeric DEFAULT 0,
  monthly_challenge text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AUGUST TABLES
CREATE TABLE public.monthly_transactions_aug (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL,
  amount numeric NOT NULL,
  direction text NOT NULL CHECK (direction IN ('INCOME', 'EXPENSE')),
  payment_method_id uuid,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_income_aug (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  source text NOT NULL,
  amount numeric NOT NULL,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_budget_aug (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  category_id uuid NOT NULL,
  bucket_50_30_20 text NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE')),
  estimated numeric DEFAULT 0,
  assigned numeric DEFAULT 0,
  actual numeric DEFAULT 0,
  variance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_debts_aug (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  debt_account_id uuid NOT NULL,
  starting_balance numeric NOT NULL,
  interest_rate_apr numeric DEFAULT 0,
  min_payment numeric NOT NULL,
  payment_made numeric DEFAULT 0,
  ending_balance numeric DEFAULT 0,
  due_day integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_wishlist_aug (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  item text NOT NULL,
  estimated_cost numeric DEFAULT 0,
  category_id uuid,
  priority text,
  acquired boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_settings_aug (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  budget_mode text NOT NULL DEFAULT 'ZERO_BASED' CHECK (budget_mode IN ('ZERO_BASED', 'COPY_PREVIOUS')),
  carryover_prev_balance numeric DEFAULT 0,
  unassigned_pool numeric DEFAULT 0,
  monthly_challenge text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SEPTEMBER TABLES
CREATE TABLE public.monthly_transactions_sep (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL,
  amount numeric NOT NULL,
  direction text NOT NULL CHECK (direction IN ('INCOME', 'EXPENSE')),
  payment_method_id uuid,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_income_sep (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  source text NOT NULL,
  amount numeric NOT NULL,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_budget_sep (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  category_id uuid NOT NULL,
  bucket_50_30_20 text NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE')),
  estimated numeric DEFAULT 0,
  assigned numeric DEFAULT 0,
  actual numeric DEFAULT 0,
  variance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_debts_sep (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  debt_account_id uuid NOT NULL,
  starting_balance numeric NOT NULL,
  interest_rate_apr numeric DEFAULT 0,
  min_payment numeric NOT NULL,
  payment_made numeric DEFAULT 0,
  ending_balance numeric DEFAULT 0,
  due_day integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_wishlist_sep (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  item text NOT NULL,
  estimated_cost numeric DEFAULT 0,
  category_id uuid,
  priority text,
  acquired boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_settings_sep (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  budget_mode text NOT NULL DEFAULT 'ZERO_BASED' CHECK (budget_mode IN ('ZERO_BASED', 'COPY_PREVIOUS')),
  carryover_prev_balance numeric DEFAULT 0,
  unassigned_pool numeric DEFAULT 0,
  monthly_challenge text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- OCTOBER TABLES
CREATE TABLE public.monthly_transactions_oct (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL,
  amount numeric NOT NULL,
  direction text NOT NULL CHECK (direction IN ('INCOME', 'EXPENSE')),
  payment_method_id uuid,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_income_oct (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  source text NOT NULL,
  amount numeric NOT NULL,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_budget_oct (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  category_id uuid NOT NULL,
  bucket_50_30_20 text NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE')),
  estimated numeric DEFAULT 0,
  assigned numeric DEFAULT 0,
  actual numeric DEFAULT 0,
  variance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_debts_oct (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  debt_account_id uuid NOT NULL,
  starting_balance numeric NOT NULL,
  interest_rate_apr numeric DEFAULT 0,
  min_payment numeric NOT NULL,
  payment_made numeric DEFAULT 0,
  ending_balance numeric DEFAULT 0,
  due_day integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_wishlist_oct (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  item text NOT NULL,
  estimated_cost numeric DEFAULT 0,
  category_id uuid,
  priority text,
  acquired boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_settings_oct (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  budget_mode text NOT NULL DEFAULT 'ZERO_BASED' CHECK (budget_mode IN ('ZERO_BASED', 'COPY_PREVIOUS')),
  carryover_prev_balance numeric DEFAULT 0,
  unassigned_pool numeric DEFAULT 0,
  monthly_challenge text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- NOVEMBER TABLES
CREATE TABLE public.monthly_transactions_nov (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL,
  amount numeric NOT NULL,
  direction text NOT NULL CHECK (direction IN ('INCOME', 'EXPENSE')),
  payment_method_id uuid,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_income_nov (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  source text NOT NULL,
  amount numeric NOT NULL,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_budget_nov (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  category_id uuid NOT NULL,
  bucket_50_30_20 text NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE')),
  estimated numeric DEFAULT 0,
  assigned numeric DEFAULT 0,
  actual numeric DEFAULT 0,
  variance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_debts_nov (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  debt_account_id uuid NOT NULL,
  starting_balance numeric NOT NULL,
  interest_rate_apr numeric DEFAULT 0,
  min_payment numeric NOT NULL,
  payment_made numeric DEFAULT 0,
  ending_balance numeric DEFAULT 0,
  due_day integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_wishlist_nov (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  item text NOT NULL,
  estimated_cost numeric DEFAULT 0,
  category_id uuid,
  priority text,
  acquired boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_settings_nov (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  budget_mode text NOT NULL DEFAULT 'ZERO_BASED' CHECK (budget_mode IN ('ZERO_BASED', 'COPY_PREVIOUS')),
  carryover_prev_balance numeric DEFAULT 0,
  unassigned_pool numeric DEFAULT 0,
  monthly_challenge text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- DECEMBER TABLES
CREATE TABLE public.monthly_transactions_dec (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  category_id uuid NOT NULL,
  amount numeric NOT NULL,
  direction text NOT NULL CHECK (direction IN ('INCOME', 'EXPENSE')),
  payment_method_id uuid,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_income_dec (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  date date NOT NULL,
  source text NOT NULL,
  amount numeric NOT NULL,
  account_id uuid,
  currency_code text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_budget_dec (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  category_id uuid NOT NULL,
  bucket_50_30_20 text NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE')),
  estimated numeric DEFAULT 0,
  assigned numeric DEFAULT 0,
  actual numeric DEFAULT 0,
  variance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_debts_dec (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  debt_account_id uuid NOT NULL,
  starting_balance numeric NOT NULL,
  interest_rate_apr numeric DEFAULT 0,
  min_payment numeric NOT NULL,
  payment_made numeric DEFAULT 0,
  ending_balance numeric DEFAULT 0,
  due_day integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_wishlist_dec (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  item text NOT NULL,
  estimated_cost numeric DEFAULT 0,
  category_id uuid,
  priority text,
  acquired boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.monthly_settings_dec (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  month_id integer NOT NULL,
  budget_mode text NOT NULL DEFAULT 'ZERO_BASED' CHECK (budget_mode IN ('ZERO_BASED', 'COPY_PREVIOUS')),
  carryover_prev_balance numeric DEFAULT 0,
  unassigned_pool numeric DEFAULT 0,
  monthly_challenge text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.monthly_transactions_feb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_income_feb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budget_feb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_debts_feb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_wishlist_feb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_settings_feb ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.monthly_transactions_mar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_income_mar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budget_mar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_debts_mar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_wishlist_mar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_settings_mar ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.monthly_transactions_apr ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_income_apr ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budget_apr ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_debts_apr ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_wishlist_apr ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_settings_apr ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.monthly_transactions_may ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_income_may ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budget_may ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_debts_may ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_wishlist_may ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_settings_may ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.monthly_transactions_jun ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_income_jun ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budget_jun ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_debts_jun ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_wishlist_jun ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_settings_jun ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.monthly_transactions_jul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_income_jul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budget_jul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_debts_jul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_wishlist_jul ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_settings_jul ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.monthly_transactions_aug ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_income_aug ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budget_aug ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_debts_aug ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_wishlist_aug ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_settings_aug ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.monthly_transactions_sep ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_income_sep ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budget_sep ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_debts_sep ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_wishlist_sep ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_settings_sep ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.monthly_transactions_oct ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_income_oct ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budget_oct ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_debts_oct ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_wishlist_oct ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_settings_oct ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.monthly_transactions_nov ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_income_nov ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budget_nov ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_debts_nov ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_wishlist_nov ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_settings_nov ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.monthly_transactions_dec ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_income_dec ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_budget_dec ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_debts_dec ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_wishlist_dec ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_settings_dec ENABLE ROW LEVEL SECURITY;

-- RLS Policies for February-December (identical to January)
-- Transactions policies for all months
CREATE POLICY "Users can create their own transactions" ON public.monthly_transactions_feb FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own transactions" ON public.monthly_transactions_feb FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.monthly_transactions_feb FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.monthly_transactions_feb FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.monthly_transactions_mar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own transactions" ON public.monthly_transactions_mar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.monthly_transactions_mar FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.monthly_transactions_mar FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.monthly_transactions_apr FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own transactions" ON public.monthly_transactions_apr FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.monthly_transactions_apr FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.monthly_transactions_apr FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.monthly_transactions_may FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own transactions" ON public.monthly_transactions_may FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.monthly_transactions_may FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.monthly_transactions_may FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.monthly_transactions_jun FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own transactions" ON public.monthly_transactions_jun FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.monthly_transactions_jun FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.monthly_transactions_jun FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.monthly_transactions_jul FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own transactions" ON public.monthly_transactions_jul FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.monthly_transactions_jul FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.monthly_transactions_jul FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.monthly_transactions_aug FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own transactions" ON public.monthly_transactions_aug FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.monthly_transactions_aug FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.monthly_transactions_aug FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.monthly_transactions_sep FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own transactions" ON public.monthly_transactions_sep FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.monthly_transactions_sep FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.monthly_transactions_sep FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.monthly_transactions_oct FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own transactions" ON public.monthly_transactions_oct FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.monthly_transactions_oct FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.monthly_transactions_oct FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.monthly_transactions_nov FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own transactions" ON public.monthly_transactions_nov FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.monthly_transactions_nov FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.monthly_transactions_nov FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.monthly_transactions_dec FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own transactions" ON public.monthly_transactions_dec FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON public.monthly_transactions_dec FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON public.monthly_transactions_dec FOR DELETE USING (auth.uid() = user_id);

-- Income policies for all months
CREATE POLICY "Users can create their own income" ON public.monthly_income_feb FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own income" ON public.monthly_income_feb FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own income" ON public.monthly_income_feb FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income" ON public.monthly_income_feb FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income" ON public.monthly_income_mar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own income" ON public.monthly_income_mar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own income" ON public.monthly_income_mar FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income" ON public.monthly_income_mar FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income" ON public.monthly_income_apr FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own income" ON public.monthly_income_apr FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own income" ON public.monthly_income_apr FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income" ON public.monthly_income_apr FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income" ON public.monthly_income_may FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own income" ON public.monthly_income_may FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own income" ON public.monthly_income_may FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income" ON public.monthly_income_may FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income" ON public.monthly_income_jun FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own income" ON public.monthly_income_jun FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own income" ON public.monthly_income_jun FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income" ON public.monthly_income_jun FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income" ON public.monthly_income_jul FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own income" ON public.monthly_income_jul FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own income" ON public.monthly_income_jul FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income" ON public.monthly_income_jul FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income" ON public.monthly_income_aug FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own income" ON public.monthly_income_aug FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own income" ON public.monthly_income_aug FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income" ON public.monthly_income_aug FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income" ON public.monthly_income_sep FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own income" ON public.monthly_income_sep FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own income" ON public.monthly_income_sep FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income" ON public.monthly_income_sep FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income" ON public.monthly_income_oct FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own income" ON public.monthly_income_oct FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own income" ON public.monthly_income_oct FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income" ON public.monthly_income_oct FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income" ON public.monthly_income_nov FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own income" ON public.monthly_income_nov FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own income" ON public.monthly_income_nov FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income" ON public.monthly_income_nov FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income" ON public.monthly_income_dec FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own income" ON public.monthly_income_dec FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own income" ON public.monthly_income_dec FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own income" ON public.monthly_income_dec FOR DELETE USING (auth.uid() = user_id);

-- Budget policies for all months
CREATE POLICY "Users can create their own budget" ON public.monthly_budget_feb FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own budget" ON public.monthly_budget_feb FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget" ON public.monthly_budget_feb FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget" ON public.monthly_budget_feb FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget" ON public.monthly_budget_mar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own budget" ON public.monthly_budget_mar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget" ON public.monthly_budget_mar FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget" ON public.monthly_budget_mar FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget" ON public.monthly_budget_apr FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own budget" ON public.monthly_budget_apr FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget" ON public.monthly_budget_apr FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget" ON public.monthly_budget_apr FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget" ON public.monthly_budget_may FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own budget" ON public.monthly_budget_may FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget" ON public.monthly_budget_may FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget" ON public.monthly_budget_may FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget" ON public.monthly_budget_jun FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own budget" ON public.monthly_budget_jun FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget" ON public.monthly_budget_jun FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget" ON public.monthly_budget_jun FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget" ON public.monthly_budget_jul FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own budget" ON public.monthly_budget_jul FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget" ON public.monthly_budget_jul FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget" ON public.monthly_budget_jul FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget" ON public.monthly_budget_aug FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own budget" ON public.monthly_budget_aug FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget" ON public.monthly_budget_aug FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget" ON public.monthly_budget_aug FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget" ON public.monthly_budget_sep FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own budget" ON public.monthly_budget_sep FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget" ON public.monthly_budget_sep FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget" ON public.monthly_budget_sep FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget" ON public.monthly_budget_oct FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own budget" ON public.monthly_budget_oct FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget" ON public.monthly_budget_oct FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget" ON public.monthly_budget_oct FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget" ON public.monthly_budget_nov FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own budget" ON public.monthly_budget_nov FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget" ON public.monthly_budget_nov FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget" ON public.monthly_budget_nov FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget" ON public.monthly_budget_dec FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own budget" ON public.monthly_budget_dec FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget" ON public.monthly_budget_dec FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget" ON public.monthly_budget_dec FOR DELETE USING (auth.uid() = user_id);

-- Debts policies for all months
CREATE POLICY "Users can create their own debts" ON public.monthly_debts_feb FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own debts" ON public.monthly_debts_feb FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.monthly_debts_feb FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.monthly_debts_feb FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" ON public.monthly_debts_mar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own debts" ON public.monthly_debts_mar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.monthly_debts_mar FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.monthly_debts_mar FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" ON public.monthly_debts_apr FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own debts" ON public.monthly_debts_apr FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.monthly_debts_apr FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.monthly_debts_apr FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" ON public.monthly_debts_may FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own debts" ON public.monthly_debts_may FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.monthly_debts_may FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.monthly_debts_may FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" ON public.monthly_debts_jun FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own debts" ON public.monthly_debts_jun FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.monthly_debts_jun FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.monthly_debts_jun FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" ON public.monthly_debts_jul FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own debts" ON public.monthly_debts_jul FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.monthly_debts_jul FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.monthly_debts_jul FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" ON public.monthly_debts_aug FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own debts" ON public.monthly_debts_aug FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.monthly_debts_aug FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.monthly_debts_aug FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" ON public.monthly_debts_sep FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own debts" ON public.monthly_debts_sep FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.monthly_debts_sep FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.monthly_debts_sep FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" ON public.monthly_debts_oct FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own debts" ON public.monthly_debts_oct FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.monthly_debts_oct FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.monthly_debts_oct FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" ON public.monthly_debts_nov FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own debts" ON public.monthly_debts_nov FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.monthly_debts_nov FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.monthly_debts_nov FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own debts" ON public.monthly_debts_dec FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own debts" ON public.monthly_debts_dec FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own debts" ON public.monthly_debts_dec FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debts" ON public.monthly_debts_dec FOR DELETE USING (auth.uid() = user_id);

-- Wishlist policies for all months
CREATE POLICY "Users can create their own wishlist" ON public.monthly_wishlist_feb FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own wishlist" ON public.monthly_wishlist_feb FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wishlist" ON public.monthly_wishlist_feb FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlist" ON public.monthly_wishlist_feb FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist" ON public.monthly_wishlist_mar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own wishlist" ON public.monthly_wishlist_mar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wishlist" ON public.monthly_wishlist_mar FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlist" ON public.monthly_wishlist_mar FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist" ON public.monthly_wishlist_apr FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own wishlist" ON public.monthly_wishlist_apr FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wishlist" ON public.monthly_wishlist_apr FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlist" ON public.monthly_wishlist_apr FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist" ON public.monthly_wishlist_may FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own wishlist" ON public.monthly_wishlist_may FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wishlist" ON public.monthly_wishlist_may FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlist" ON public.monthly_wishlist_may FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist" ON public.monthly_wishlist_jun FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own wishlist" ON public.monthly_wishlist_jun FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wishlist" ON public.monthly_wishlist_jun FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlist" ON public.monthly_wishlist_jun FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist" ON public.monthly_wishlist_jul FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own wishlist" ON public.monthly_wishlist_jul FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wishlist" ON public.monthly_wishlist_jul FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlist" ON public.monthly_wishlist_jul FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist" ON public.monthly_wishlist_aug FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own wishlist" ON public.monthly_wishlist_aug FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wishlist" ON public.monthly_wishlist_aug FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlist" ON public.monthly_wishlist_aug FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist" ON public.monthly_wishlist_sep FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own wishlist" ON public.monthly_wishlist_sep FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wishlist" ON public.monthly_wishlist_sep FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlist" ON public.monthly_wishlist_sep FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist" ON public.monthly_wishlist_oct FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own wishlist" ON public.monthly_wishlist_oct FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wishlist" ON public.monthly_wishlist_oct FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlist" ON public.monthly_wishlist_oct FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist" ON public.monthly_wishlist_nov FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own wishlist" ON public.monthly_wishlist_nov FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wishlist" ON public.monthly_wishlist_nov FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlist" ON public.monthly_wishlist_nov FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist" ON public.monthly_wishlist_dec FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own wishlist" ON public.monthly_wishlist_dec FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own wishlist" ON public.monthly_wishlist_dec FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own wishlist" ON public.monthly_wishlist_dec FOR DELETE USING (auth.uid() = user_id);

-- Settings policies for all months
CREATE POLICY "Users can create their own settings" ON public.monthly_settings_feb FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own settings" ON public.monthly_settings_feb FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.monthly_settings_feb FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.monthly_settings_feb FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.monthly_settings_mar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own settings" ON public.monthly_settings_mar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.monthly_settings_mar FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.monthly_settings_mar FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.monthly_settings_apr FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own settings" ON public.monthly_settings_apr FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.monthly_settings_apr FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.monthly_settings_apr FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.monthly_settings_may FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own settings" ON public.monthly_settings_may FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.monthly_settings_may FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.monthly_settings_may FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.monthly_settings_jun FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own settings" ON public.monthly_settings_jun FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.monthly_settings_jun FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.monthly_settings_jun FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.monthly_settings_jul FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own settings" ON public.monthly_settings_jul FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.monthly_settings_jul FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.monthly_settings_jul FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.monthly_settings_aug FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own settings" ON public.monthly_settings_aug FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.monthly_settings_aug FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.monthly_settings_aug FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.monthly_settings_sep FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own settings" ON public.monthly_settings_sep FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.monthly_settings_sep FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.monthly_settings_sep FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.monthly_settings_oct FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own settings" ON public.monthly_settings_oct FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.monthly_settings_oct FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.monthly_settings_oct FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.monthly_settings_nov FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own settings" ON public.monthly_settings_nov FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.monthly_settings_nov FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.monthly_settings_nov FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.monthly_settings_dec FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own settings" ON public.monthly_settings_dec FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.monthly_settings_dec FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own settings" ON public.monthly_settings_dec FOR DELETE USING (auth.uid() = user_id);

-- Create triggers and functions for all months (budget variance and debt ending balance)
CREATE OR REPLACE FUNCTION calculate_debt_ending_balance_feb()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ending_balance := NEW.starting_balance 
    + (NEW.starting_balance * NEW.interest_rate_apr / 100 / 12) 
    - NEW.payment_made;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_ending_balance_feb
  BEFORE INSERT OR UPDATE ON public.monthly_debts_feb
  FOR EACH ROW
  EXECUTE FUNCTION calculate_debt_ending_balance_feb();

CREATE OR REPLACE FUNCTION update_budget_variance_feb()
RETURNS TRIGGER AS $$
BEGIN
  NEW.variance := NEW.assigned - NEW.actual;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_variance_feb
  BEFORE INSERT OR UPDATE ON public.monthly_budget_feb
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_variance_feb();

-- Repeat for remaining months (mar-dec) - Due to size constraints, I'll create placeholders
-- The actual implementation would continue identically for each month-- Complete Phase 2: Add remaining trigger functions for Mar-Dec

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
  EXECUTE FUNCTION update_budget_variance_dec();-- Phase 3: Create unified analytics views combining all 12 months

-- View 1: All transactions across all months
CREATE OR REPLACE VIEW view_transactions_all AS
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'jan' as month_abbr FROM public.monthly_transactions_jan
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'feb' as month_abbr FROM public.monthly_transactions_feb
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'mar' as month_abbr FROM public.monthly_transactions_mar
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'apr' as month_abbr FROM public.monthly_transactions_apr
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'may' as month_abbr FROM public.monthly_transactions_may
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'jun' as month_abbr FROM public.monthly_transactions_jun
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'jul' as month_abbr FROM public.monthly_transactions_jul
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'aug' as month_abbr FROM public.monthly_transactions_aug
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'sep' as month_abbr FROM public.monthly_transactions_sep
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'oct' as month_abbr FROM public.monthly_transactions_oct
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'nov' as month_abbr FROM public.monthly_transactions_nov
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'dec' as month_abbr FROM public.monthly_transactions_dec;

-- View 2: All income across all months
CREATE OR REPLACE VIEW view_income_all AS
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'jan' as month_abbr FROM public.monthly_income_jan
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'feb' as month_abbr FROM public.monthly_income_feb
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'mar' as month_abbr FROM public.monthly_income_mar
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'apr' as month_abbr FROM public.monthly_income_apr
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'may' as month_abbr FROM public.monthly_income_may
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'jun' as month_abbr FROM public.monthly_income_jun
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'jul' as month_abbr FROM public.monthly_income_jul
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'aug' as month_abbr FROM public.monthly_income_aug
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'sep' as month_abbr FROM public.monthly_income_sep
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'oct' as month_abbr FROM public.monthly_income_oct
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'nov' as month_abbr FROM public.monthly_income_nov
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'dec' as month_abbr FROM public.monthly_income_dec;

-- View 3: All budget entries across all months
CREATE OR REPLACE VIEW view_budget_all AS
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'jan' as month_abbr FROM public.monthly_budget_jan
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'feb' as month_abbr FROM public.monthly_budget_feb
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'mar' as month_abbr FROM public.monthly_budget_mar
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'apr' as month_abbr FROM public.monthly_budget_apr
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'may' as month_abbr FROM public.monthly_budget_may
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'jun' as month_abbr FROM public.monthly_budget_jun
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'jul' as month_abbr FROM public.monthly_budget_jul
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'aug' as month_abbr FROM public.monthly_budget_aug
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'sep' as month_abbr FROM public.monthly_budget_sep
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'oct' as month_abbr FROM public.monthly_budget_oct
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'nov' as month_abbr FROM public.monthly_budget_nov
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'dec' as month_abbr FROM public.monthly_budget_dec;

-- View 4: All debts across all months
CREATE OR REPLACE VIEW view_debts_all AS
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'jan' as month_abbr FROM public.monthly_debts_jan
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'feb' as month_abbr FROM public.monthly_debts_feb
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'mar' as month_abbr FROM public.monthly_debts_mar
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'apr' as month_abbr FROM public.monthly_debts_apr
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'may' as month_abbr FROM public.monthly_debts_may
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'jun' as month_abbr FROM public.monthly_debts_jun
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'jul' as month_abbr FROM public.monthly_debts_jul
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'aug' as month_abbr FROM public.monthly_debts_aug
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'sep' as month_abbr FROM public.monthly_debts_sep
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'oct' as month_abbr FROM public.monthly_debts_oct
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'nov' as month_abbr FROM public.monthly_debts_nov
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'dec' as month_abbr FROM public.monthly_debts_dec;

-- View 5: All wishlist items across all months
CREATE OR REPLACE VIEW view_wishlist_all AS
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'jan' as month_abbr FROM public.monthly_wishlist_jan
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'feb' as month_abbr FROM public.monthly_wishlist_feb
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'mar' as month_abbr FROM public.monthly_wishlist_mar
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'apr' as month_abbr FROM public.monthly_wishlist_apr
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'may' as month_abbr FROM public.monthly_wishlist_may
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'jun' as month_abbr FROM public.monthly_wishlist_jun
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'jul' as month_abbr FROM public.monthly_wishlist_jul
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'aug' as month_abbr FROM public.monthly_wishlist_aug
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'sep' as month_abbr FROM public.monthly_wishlist_sep
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'oct' as month_abbr FROM public.monthly_wishlist_oct
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'nov' as month_abbr FROM public.monthly_wishlist_nov
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'dec' as month_abbr FROM public.monthly_wishlist_dec;

-- View 6: All settings across all months
CREATE OR REPLACE VIEW view_settings_all AS
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'jan' as month_abbr FROM public.monthly_settings_jan
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'feb' as month_abbr FROM public.monthly_settings_feb
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'mar' as month_abbr FROM public.monthly_settings_mar
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'apr' as month_abbr FROM public.monthly_settings_apr
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'may' as month_abbr FROM public.monthly_settings_may
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'jun' as month_abbr FROM public.monthly_settings_jun
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'jul' as month_abbr FROM public.monthly_settings_jul
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'aug' as month_abbr FROM public.monthly_settings_aug
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'sep' as month_abbr FROM public.monthly_settings_sep
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'oct' as month_abbr FROM public.monthly_settings_oct
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'nov' as month_abbr FROM public.monthly_settings_nov
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'dec' as month_abbr FROM public.monthly_settings_dec;

-- View 7: Monthly summary aggregating key metrics per month
CREATE OR REPLACE VIEW view_monthly_summary AS
SELECT 
  m.id as month_id,
  m.name as month_name,
  m.start_date,
  m.end_date,
  i.user_id,
  COALESCE(SUM(i.amount), 0) as total_income,
  COALESCE(SUM(CASE WHEN t.direction = 'EXPENSE' THEN ABS(t.amount) ELSE 0 END), 0) as total_expenses,
  COALESCE(SUM(i.amount), 0) - COALESCE(SUM(CASE WHEN t.direction = 'EXPENSE' THEN ABS(t.amount) ELSE 0 END), 0) as net_cash_flow,
  COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN b.actual ELSE 0 END), 0) as needs_actual,
  COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN b.actual ELSE 0 END), 0) as wants_actual,
  COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN b.actual ELSE 0 END), 0) as future_actual,
  COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN b.assigned ELSE 0 END), 0) as needs_assigned,
  COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN b.assigned ELSE 0 END), 0) as wants_assigned,
  COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN b.assigned ELSE 0 END), 0) as future_assigned,
  COALESCE(SUM(d.payment_made), 0) as debt_payments,
  COALESCE(SUM(w.estimated_cost), 0) as wishlist_total_cost,
  COUNT(DISTINCT w.id) as wishlist_item_count
FROM public.months m
LEFT JOIN view_income_all i ON m.id = i.month_id
LEFT JOIN view_transactions_all t ON m.id = t.month_id AND t.user_id = i.user_id
LEFT JOIN view_budget_all b ON m.id = b.month_id AND b.user_id = i.user_id
LEFT JOIN view_debts_all d ON m.id = d.month_id AND d.user_id = i.user_id
LEFT JOIN view_wishlist_all w ON m.id = w.month_id AND w.user_id = i.user_id
GROUP BY m.id, m.name, m.start_date, m.end_date, i.user_id;

-- View 8: Annual summary with totals and averages across all months
CREATE OR REPLACE VIEW view_annual_summary AS
SELECT 
  user_id,
  SUM(total_income) as annual_income,
  SUM(total_expenses) as annual_expenses,
  SUM(net_cash_flow) as annual_net_cash_flow,
  AVG(total_income) as avg_monthly_income,
  AVG(total_expenses) as avg_monthly_expenses,
  AVG(net_cash_flow) as avg_monthly_net_cash_flow,
  SUM(needs_actual) as annual_needs_actual,
  SUM(wants_actual) as annual_wants_actual,
  SUM(future_actual) as annual_future_actual,
  SUM(needs_assigned) as annual_needs_assigned,
  SUM(wants_assigned) as annual_wants_assigned,
  SUM(future_assigned) as annual_future_assigned,
  SUM(debt_payments) as annual_debt_payments,
  SUM(wishlist_total_cost) as annual_wishlist_cost,
  SUM(wishlist_item_count) as total_wishlist_items
FROM view_monthly_summary
GROUP BY user_id;-- Fix security warnings: Convert views from SECURITY DEFINER to SECURITY INVOKER
-- This ensures views use the querying user's permissions, not the creator's

ALTER VIEW view_transactions_all SET (security_invoker = on);
ALTER VIEW view_income_all SET (security_invoker = on);
ALTER VIEW view_budget_all SET (security_invoker = on);
ALTER VIEW view_debts_all SET (security_invoker = on);
ALTER VIEW view_wishlist_all SET (security_invoker = on);
ALTER VIEW view_settings_all SET (security_invoker = on);
ALTER VIEW view_monthly_summary SET (security_invoker = on);
ALTER VIEW view_annual_summary SET (security_invoker = on);-- Drop the existing check constraint on categories table
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_bucket_50_30_20_check;

-- Add new check constraint with all 5 bucket types
ALTER TABLE public.categories 
ADD CONSTRAINT categories_bucket_50_30_20_check 
CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE', 'INVESTMENTS', 'DEBT_PAYMENTS'));-- Add foreign key relationships for monthly_transactions tables (Feb-Dec)
-- These are needed for PostgREST to recognize the joins

-- February
ALTER TABLE public.monthly_transactions_feb
ADD CONSTRAINT monthly_transactions_feb_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_feb
ADD CONSTRAINT monthly_transactions_feb_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_feb
ADD CONSTRAINT monthly_transactions_feb_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- March
ALTER TABLE public.monthly_transactions_mar
ADD CONSTRAINT monthly_transactions_mar_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_mar
ADD CONSTRAINT monthly_transactions_mar_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_mar
ADD CONSTRAINT monthly_transactions_mar_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- April
ALTER TABLE public.monthly_transactions_apr
ADD CONSTRAINT monthly_transactions_apr_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_apr
ADD CONSTRAINT monthly_transactions_apr_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_apr
ADD CONSTRAINT monthly_transactions_apr_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- May
ALTER TABLE public.monthly_transactions_may
ADD CONSTRAINT monthly_transactions_may_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_may
ADD CONSTRAINT monthly_transactions_may_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_may
ADD CONSTRAINT monthly_transactions_may_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- June
ALTER TABLE public.monthly_transactions_jun
ADD CONSTRAINT monthly_transactions_jun_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_jun
ADD CONSTRAINT monthly_transactions_jun_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_jun
ADD CONSTRAINT monthly_transactions_jun_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- July
ALTER TABLE public.monthly_transactions_jul
ADD CONSTRAINT monthly_transactions_jul_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_jul
ADD CONSTRAINT monthly_transactions_jul_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_jul
ADD CONSTRAINT monthly_transactions_jul_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- August
ALTER TABLE public.monthly_transactions_aug
ADD CONSTRAINT monthly_transactions_aug_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_aug
ADD CONSTRAINT monthly_transactions_aug_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_aug
ADD CONSTRAINT monthly_transactions_aug_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- September
ALTER TABLE public.monthly_transactions_sep
ADD CONSTRAINT monthly_transactions_sep_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_sep
ADD CONSTRAINT monthly_transactions_sep_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_sep
ADD CONSTRAINT monthly_transactions_sep_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- October
ALTER TABLE public.monthly_transactions_oct
ADD CONSTRAINT monthly_transactions_oct_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_oct
ADD CONSTRAINT monthly_transactions_oct_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_oct
ADD CONSTRAINT monthly_transactions_oct_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- November
ALTER TABLE public.monthly_transactions_nov
ADD CONSTRAINT monthly_transactions_nov_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_nov
ADD CONSTRAINT monthly_transactions_nov_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_nov
ADD CONSTRAINT monthly_transactions_nov_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- December
ALTER TABLE public.monthly_transactions_dec
ADD CONSTRAINT monthly_transactions_dec_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_dec
ADD CONSTRAINT monthly_transactions_dec_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_dec
ADD CONSTRAINT monthly_transactions_dec_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);-- Add foreign key constraints for monthly_budget tables (Feb-Dec)
ALTER TABLE public.monthly_budget_feb 
  ADD CONSTRAINT monthly_budget_feb_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_mar 
  ADD CONSTRAINT monthly_budget_mar_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_apr 
  ADD CONSTRAINT monthly_budget_apr_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_may 
  ADD CONSTRAINT monthly_budget_may_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_jun 
  ADD CONSTRAINT monthly_budget_jun_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_jul 
  ADD CONSTRAINT monthly_budget_jul_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_aug 
  ADD CONSTRAINT monthly_budget_aug_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_sep 
  ADD CONSTRAINT monthly_budget_sep_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_oct 
  ADD CONSTRAINT monthly_budget_oct_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_nov 
  ADD CONSTRAINT monthly_budget_nov_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_dec 
  ADD CONSTRAINT monthly_budget_dec_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

-- Add foreign key constraints for monthly_debts tables (Feb-Dec) to accounts
ALTER TABLE public.monthly_debts_feb 
  ADD CONSTRAINT monthly_debts_feb_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_mar 
  ADD CONSTRAINT monthly_debts_mar_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_apr 
  ADD CONSTRAINT monthly_debts_apr_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_may 
  ADD CONSTRAINT monthly_debts_may_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_jun 
  ADD CONSTRAINT monthly_debts_jun_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_jul 
  ADD CONSTRAINT monthly_debts_jul_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_aug 
  ADD CONSTRAINT monthly_debts_aug_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_sep 
  ADD CONSTRAINT monthly_debts_sep_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_oct 
  ADD CONSTRAINT monthly_debts_oct_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_nov 
  ADD CONSTRAINT monthly_debts_nov_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_dec 
  ADD CONSTRAINT monthly_debts_dec_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);-- Drop views in correct order using CASCADE
DROP VIEW IF EXISTS view_annual_summary CASCADE;
DROP VIEW IF EXISTS view_monthly_summary CASCADE;

-- Recreate view_monthly_summary with proper aggregation to avoid cartesian product
CREATE OR REPLACE VIEW view_monthly_summary AS
SELECT 
    m.id AS month_id,
    m.name AS month_name,
    m.start_date,
    m.end_date,
    COALESCE(income_agg.user_id, trans_agg.user_id, budget_agg.user_id, debts_agg.user_id, wishlist_agg.user_id) AS user_id,
    COALESCE(income_agg.total_income, 0) AS total_income,
    COALESCE(trans_agg.total_expenses, 0) AS total_expenses,
    COALESCE(income_agg.total_income, 0) - COALESCE(trans_agg.total_expenses, 0) AS net_cash_flow,
    COALESCE(budget_agg.needs_actual, 0) AS needs_actual,
    COALESCE(budget_agg.wants_actual, 0) AS wants_actual,
    COALESCE(budget_agg.future_actual, 0) AS future_actual,
    COALESCE(budget_agg.needs_assigned, 0) AS needs_assigned,
    COALESCE(budget_agg.wants_assigned, 0) AS wants_assigned,
    COALESCE(budget_agg.future_assigned, 0) AS future_assigned,
    COALESCE(debts_agg.debt_payments, 0) AS debt_payments,
    COALESCE(wishlist_agg.wishlist_total_cost, 0) AS wishlist_total_cost,
    COALESCE(wishlist_agg.wishlist_item_count, 0) AS wishlist_item_count
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
) debts_agg ON m.id = debts_agg.month_id AND debts_agg.user_id = COALESCE(income_agg.user_id, trans_agg.user_id, budget_agg.user_id, debts_agg.user_id)
LEFT JOIN (
    SELECT month_id, user_id, SUM(estimated_cost) AS wishlist_total_cost, COUNT(*) AS wishlist_item_count
    FROM view_wishlist_all
    GROUP BY month_id, user_id
) wishlist_agg ON m.id = wishlist_agg.month_id AND wishlist_agg.user_id = COALESCE(income_agg.user_id, trans_agg.user_id, budget_agg.user_id, debts_agg.user_id, wishlist_agg.user_id);

-- Recreate view_annual_summary
CREATE OR REPLACE VIEW view_annual_summary AS
SELECT
    user_id,
    SUM(total_income) AS annual_income,
    SUM(total_expenses) AS annual_expenses,
    SUM(net_cash_flow) AS annual_net_cash_flow,
    SUM(needs_actual) AS annual_needs_actual,
    SUM(wants_actual) AS annual_wants_actual,
    SUM(future_actual) AS annual_future_actual,
    SUM(debt_payments) AS annual_debt_payments,
    SUM(wishlist_total_cost) AS annual_wishlist_total_cost
FROM view_monthly_summary
WHERE user_id IS NOT NULL
GROUP BY user_id;-- Set views to SECURITY INVOKER to fix security warnings
ALTER VIEW view_monthly_summary SET (security_invoker = on);
ALTER VIEW view_annual_summary SET (security_invoker = on);-- Create user_settings table to store user preferences
CREATE TABLE public.user_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  owner_name text,
  currency text DEFAULT 'EUR',
  language text DEFAULT 'es',
  monthly_income numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();-- Drop existing objects if they exist (for clean re-run)
DROP TRIGGER IF EXISTS update_conversation_timestamp_on_message ON public.ai_messages;
DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON public.ai_conversations;
DROP FUNCTION IF EXISTS update_conversation_on_message();
DROP FUNCTION IF EXISTS update_ai_conversation_updated_at();

-- Drop existing policies
DROP POLICY IF EXISTS "Users can delete references from their conversations" ON public.conversation_references;
DROP POLICY IF EXISTS "Users can insert references to their conversations" ON public.conversation_references;
DROP POLICY IF EXISTS "Users can view references from their conversations" ON public.conversation_references;
DROP POLICY IF EXISTS "Users can delete messages from their conversations" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can insert messages to their conversations" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.ai_messages;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.ai_conversations;

-- Drop existing tables (cascade will drop dependent objects)
DROP TABLE IF EXISTS public.conversation_references CASCADE;
DROP TABLE IF EXISTS public.ai_messages CASCADE;
DROP TABLE IF EXISTS public.ai_conversations CASCADE;

-- Create ai_conversations table
CREATE TABLE public.ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Nueva conversación',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_archived BOOLEAN DEFAULT false NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create ai_messages table
CREATE TABLE public.ai_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool', 'function')),
    content TEXT,
    tool_calls JSONB,
    tool_call_id TEXT,
    name TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_hidden BOOLEAN DEFAULT false NOT NULL
);

-- Create conversation_references table for linking conversations to transactions/entities
CREATE TABLE public.conversation_references (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.ai_messages(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('transaction', 'budget', 'category', 'account', 'debt', 'wishlist')),
    entity_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_updated_at ON public.ai_conversations(updated_at DESC);
CREATE INDEX idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created_at ON public.ai_messages(created_at);
CREATE INDEX idx_conversation_references_conversation ON public.conversation_references(conversation_id);
CREATE INDEX idx_conversation_references_entity ON public.conversation_references(entity_type, entity_id);

-- Enable Row Level Security
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_references ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view their own conversations"
    ON public.ai_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
    ON public.ai_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
    ON public.ai_conversations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
    ON public.ai_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for ai_messages
CREATE POLICY "Users can view messages from their conversations"
    ON public.ai_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to their conversations"
    ON public.ai_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages from their conversations"
    ON public.ai_messages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE ai_conversations.id = ai_messages.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- RLS Policies for conversation_references
CREATE POLICY "Users can view references from their conversations"
    ON public.conversation_references FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE ai_conversations.id = conversation_references.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert references to their conversations"
    ON public.conversation_references FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE ai_conversations.id = conversation_references.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete references from their conversations"
    ON public.conversation_references FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.ai_conversations
            WHERE ai_conversations.id = conversation_references.conversation_id
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- Function to automatically update updated_at timestamp
CREATE FUNCTION update_ai_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on ai_conversations
CREATE TRIGGER update_ai_conversations_updated_at
    BEFORE UPDATE ON public.ai_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_conversation_updated_at();

-- Function to update conversation's updated_at when a message is added
CREATE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.ai_conversations
    SET updated_at = timezone('utc'::text, now())
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp on message insert
CREATE TRIGGER update_conversation_timestamp_on_message
    AFTER INSERT ON public.ai_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();
