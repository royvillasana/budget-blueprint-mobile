-- Create function to get all transactions for a user in a specific month
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
  direction VARCHAR,
  payment_method_id UUID,
  payment_method_name TEXT,
  account_id UUID,
  account_name TEXT,
  currency_code VARCHAR,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
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
    t.created_at,
    t.updated_at
  FROM all_transactions t
  LEFT JOIN categories c ON t.category_id = c.id
  LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
  LEFT JOIN accounts a ON t.account_id = a.id
  WHERE t.user_id = p_user_id AND t.month_id = p_month_id
  ORDER BY t.date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all budget items for a user in a specific month
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
    b.planned_amount,
    b.spent_amount,
    b.created_at,
    b.updated_at
  FROM all_budget b
  LEFT JOIN categories c ON b.category_id = c.id
  WHERE b.user_id = p_user_id AND b.month_id = p_month_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all debts for a user in a specific month
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
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
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
    d.created_at,
    d.updated_at
  FROM all_debts d
  LEFT JOIN accounts a ON d.debt_account_id = a.id
  WHERE d.user_id = p_user_id AND d.month_id = p_month_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
