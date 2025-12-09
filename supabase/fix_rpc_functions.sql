-- Fix RPC functions to use correct view names
-- The functions were using old view names (all_budget, all_debts, all_transactions)
-- But fix_column_types.sql renamed them to view_budget_all, view_debts_all, view_transactions_all

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_user_budget(UUID, INT);
DROP FUNCTION IF EXISTS get_user_debts(UUID, INT);
DROP FUNCTION IF EXISTS get_user_transactions(UUID, INT);

-- Fix get_user_budget to use view_budget_all instead of all_budget
CREATE OR REPLACE FUNCTION get_user_budget(p_user_id UUID, p_month_id INT)
RETURNS TABLE (
  id UUID,
  month_id INT,
  user_id UUID,
  category_id UUID,
  category_name TEXT,
  category_emoji TEXT,
  bucket_50_30_20 TEXT,
  planned_amount DECIMAL,
  spent_amount DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.month_id,
    b.user_id,
    b.category_id,
    c.name,
    c.emoji,
    c.bucket_50_30_20,
    COALESCE(b.assigned, 0) as planned_amount,  -- Changed from planned_amount to assigned
    COALESCE(b.actual, 0) as spent_amount,      -- Changed from spent_amount to actual
    b.created_at,
    b.updated_at
  FROM view_budget_all b  -- Changed from all_budget to view_budget_all
  LEFT JOIN categories c ON b.category_id = c.id
  WHERE b.user_id = p_user_id AND b.month_id = p_month_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_user_debts to use view_debts_all instead of all_debts
CREATE OR REPLACE FUNCTION get_user_debts(p_user_id UUID, p_month_id INT)
RETURNS TABLE (
  id UUID,
  month_id INT,
  user_id UUID,
  debt_account_id UUID,
  account_name TEXT,
  starting_balance DECIMAL,
  payment_made DECIMAL,
  ending_balance DECIMAL,
  interest_rate_apr DECIMAL,
  min_payment DECIMAL,
  due_day INT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.month_id,
    d.user_id,
    d.debt_account_id,
    a.name,
    d.starting_balance,
    d.payment_made,
    d.ending_balance,
    d.interest_rate_apr,
    d.min_payment,
    d.due_day,
    d.created_at
  FROM view_debts_all d  -- Changed from all_debts to view_debts_all
  LEFT JOIN accounts a ON d.debt_account_id = a.id
  WHERE d.user_id = p_user_id AND d.month_id = p_month_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_user_transactions to use view_transactions_all instead of all_transactions
CREATE OR REPLACE FUNCTION get_user_transactions(p_user_id UUID, p_month_id INT)
RETURNS TABLE (
  id UUID,
  month_id INT,
  user_id UUID,
  date DATE,
  description TEXT,
  category_id UUID,
  category_name TEXT,
  category_emoji TEXT,
  amount DECIMAL,
  direction TEXT,
  payment_method_id UUID,
  payment_method_name TEXT,
  account_id UUID,
  account_name TEXT,
  currency_code TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.month_id,
    t.user_id,
    t.date,
    t.description,
    t.category_id,
    c.name,
    c.emoji,
    t.amount,
    t.direction,
    t.payment_method_id,
    pm.name,
    t.account_id,
    a.name,
    t.currency_code,
    t.notes,
    t.created_at
  FROM view_transactions_all t  -- Changed from all_transactions to view_transactions_all
  LEFT JOIN categories c ON t.category_id = c.id
  LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
  LEFT JOIN accounts a ON t.account_id = a.id
  WHERE t.user_id = p_user_id AND t.month_id = p_month_id
  ORDER BY t.date DESC, t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'RPC functions fixed!' AS status;
