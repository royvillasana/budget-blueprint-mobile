-- Create monthly_budgets table
CREATE TABLE IF NOT EXISTS public.monthly_budgets (
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
CREATE TABLE IF NOT EXISTS public.income_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_budget_id UUID NOT NULL REFERENCES public.monthly_budgets(id) ON DELETE CASCADE,
  concept TEXT NOT NULL,
  estimated DECIMAL(12, 2) DEFAULT 0,
  actual DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create budget_categories table
CREATE TABLE IF NOT EXISTS public.budget_categories (
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
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_budget_id UUID NOT NULL REFERENCES public.monthly_budgets(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  concept TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create annual_goals table
CREATE TABLE IF NOT EXISTS public.annual_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  main_financial_goal TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, year)
);

-- Create financial_goals table
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annual_goal_id UUID NOT NULL REFERENCES public.annual_goals(id) ON DELETE CASCADE,
  goal_text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create wish_list table
CREATE TABLE IF NOT EXISTS public.wish_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_budget_id UUID NOT NULL REFERENCES public.monthly_budgets(id) ON DELETE CASCADE,
  wish_text TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create todo_list table
CREATE TABLE IF NOT EXISTS public.todo_list (
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
  EXECUTE FUNCTION public.update_updated_at_column();