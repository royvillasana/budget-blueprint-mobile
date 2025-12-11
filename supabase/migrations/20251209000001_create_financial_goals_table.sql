-- Create financial_goals table for tracking user financial goals
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  month_id INT NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('savings', 'debt_reduction', 'expense_limit', 'income_increase')),
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON public.financial_goals(user_id);

-- Create index on month_id for faster queries
CREATE INDEX IF NOT EXISTS idx_financial_goals_month_id ON public.financial_goals(month_id);

-- Enable Row Level Security
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own goals
CREATE POLICY "Users can view own goals"
  ON public.financial_goals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own goals
CREATE POLICY "Users can insert own goals"
  ON public.financial_goals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own goals
CREATE POLICY "Users can update own goals"
  ON public.financial_goals
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own goals
CREATE POLICY "Users can delete own goals"
  ON public.financial_goals
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_financial_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER trigger_update_financial_goals_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_goals_updated_at();

-- Add comment to table
COMMENT ON TABLE public.financial_goals IS 'Stores user financial goals and tracks progress';
