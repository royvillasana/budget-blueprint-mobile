-- Create union view for all debts across all months with account data pre-joined
CREATE OR REPLACE VIEW all_debts AS
SELECT 
  d.id,
  d.month_id,
  d.user_id,
  d.debt_account_id,
  d.starting_balance,
  d.payment_made,
  d.ending_balance,
  d.interest_rate_apr,
  d.min_payment,
  d.created_at,
  d.updated_at,
  a.name as account_name
FROM monthly_debts_jan d
LEFT JOIN accounts a ON d.debt_account_id = a.id
UNION ALL
SELECT 
  d.id,
  d.month_id,
  d.user_id,
  d.debt_account_id,
  d.starting_balance,
  d.payment_made,
  d.ending_balance,
  d.interest_rate_apr,
  d.min_payment,
  d.created_at,
  d.updated_at,
  a.name as account_name
FROM monthly_debts_feb d
LEFT JOIN accounts a ON d.debt_account_id = a.id
UNION ALL
SELECT 
  d.id,
  d.month_id,
  d.user_id,
  d.debt_account_id,
  d.starting_balance,
  d.payment_made,
  d.ending_balance,
  d.interest_rate_apr,
  d.min_payment,
  d.created_at,
  d.updated_at,
  a.name as account_name
FROM monthly_debts_mar d
LEFT JOIN accounts a ON d.debt_account_id = a.id
UNION ALL
SELECT 
  d.id,
  d.month_id,
  d.user_id,
  d.debt_account_id,
  d.starting_balance,
  d.payment_made,
  d.ending_balance,
  d.interest_rate_apr,
  d.min_payment,
  d.created_at,
  d.updated_at,
  a.name as account_name
FROM monthly_debts_apr d
LEFT JOIN accounts a ON d.debt_account_id = a.id
UNION ALL
SELECT 
  d.id,
  d.month_id,
  d.user_id,
  d.debt_account_id,
  d.starting_balance,
  d.payment_made,
  d.ending_balance,
  d.interest_rate_apr,
  d.min_payment,
  d.created_at,
  d.updated_at,
  a.name as account_name
FROM monthly_debts_may d
LEFT JOIN accounts a ON d.debt_account_id = a.id
UNION ALL
SELECT 
  d.id,
  d.month_id,
  d.user_id,
  d.debt_account_id,
  d.starting_balance,
  d.payment_made,
  d.ending_balance,
  d.interest_rate_apr,
  d.min_payment,
  d.created_at,
  d.updated_at,
  a.name as account_name
FROM monthly_debts_jun d
LEFT JOIN accounts a ON d.debt_account_id = a.id
UNION ALL
SELECT 
  d.id,
  d.month_id,
  d.user_id,
  d.debt_account_id,
  d.starting_balance,
  d.payment_made,
  d.ending_balance,
  d.interest_rate_apr,
  d.min_payment,
  d.created_at,
  d.updated_at,
  a.name as account_name
FROM monthly_debts_jul d
LEFT JOIN accounts a ON d.debt_account_id = a.id
UNION ALL
SELECT 
  d.id,
  d.month_id,
  d.user_id,
  d.debt_account_id,
  d.starting_balance,
  d.payment_made,
  d.ending_balance,
  d.interest_rate_apr,
  d.min_payment,
  d.created_at,
  d.updated_at,
  a.name as account_name
FROM monthly_debts_aug d
LEFT JOIN accounts a ON d.debt_account_id = a.id
UNION ALL
SELECT 
  d.id,
  d.month_id,
  d.user_id,
  d.debt_account_id,
  d.starting_balance,
  d.payment_made,
  d.ending_balance,
  d.interest_rate_apr,
  d.min_payment,
  d.created_at,
  d.updated_at,
  a.name as account_name
FROM monthly_debts_sep d
LEFT JOIN accounts a ON d.debt_account_id = a.id
UNION ALL
SELECT 
  d.id,
  d.month_id,
  d.user_id,
  d.debt_account_id,
  d.starting_balance,
  d.payment_made,
  d.ending_balance,
  d.interest_rate_apr,
  d.min_payment,
  d.created_at,
  d.updated_at,
  a.name as account_name
FROM monthly_debts_oct d
LEFT JOIN accounts a ON d.debt_account_id = a.id
UNION ALL
SELECT 
  d.id,
  d.month_id,
  d.user_id,
  d.debt_account_id,
  d.starting_balance,
  d.payment_made,
  d.ending_balance,
  d.interest_rate_apr,
  d.min_payment,
  d.created_at,
  d.updated_at,
  a.name as account_name
FROM monthly_debts_nov d
LEFT JOIN accounts a ON d.debt_account_id = a.id
UNION ALL
SELECT 
  d.id,
  d.month_id,
  d.user_id,
  d.debt_account_id,
  d.starting_balance,
  d.payment_made,
  d.ending_balance,
  d.interest_rate_apr,
  d.min_payment,
  d.created_at,
  d.updated_at,
  a.name as account_name
FROM monthly_debts_dec d
LEFT JOIN accounts a ON d.debt_account_id = a.id;

-- Views inherit RLS from underlying tables
