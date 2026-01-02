-- Insert fictional December data based on November data
-- Replace 'USER_ID_HERE' with the actual user ID from step 1
-- This script copies November data and adjusts it for December

-- 1. Copy income from November to December with adjusted dates
INSERT INTO monthly_income_dec (user_id, month_id, source, amount, date, account_id, currency_code, notes, year)
SELECT
  user_id,
  12 as month_id, -- December
  source,
  amount * (0.95 + RANDOM() * 0.1) as amount, -- Vary amount by ±5%
  (date + INTERVAL '1 month')::date as date, -- Move to December
  account_id,
  currency_code,
  notes,
  EXTRACT(YEAR FROM CURRENT_DATE)::INT as year
FROM monthly_income_nov
WHERE user_id = 'USER_ID_HERE';

-- 2. Copy transactions from November to December with adjusted dates and amounts
INSERT INTO monthly_transactions_dec (user_id, month_id, category_id, description, amount, date, direction, currency_code, account_id, year)
SELECT
  user_id,
  12 as month_id, -- December
  category_id,
  description,
  amount * (0.90 + RANDOM() * 0.20) as amount, -- Vary amount by ±10%
  (date + INTERVAL '1 month')::date as date, -- Move to December
  direction,
  currency_code,
  account_id,
  EXTRACT(YEAR FROM CURRENT_DATE)::INT as year
FROM monthly_transactions_nov
WHERE user_id = 'USER_ID_HERE';

-- 3. Copy budget from November to December with slight variations
INSERT INTO monthly_budget_dec (user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, year)
SELECT
  user_id,
  12 as month_id, -- December
  category_id,
  bucket_50_30_20,
  estimated * (0.95 + RANDOM() * 0.1) as estimated, -- Vary by ±5%
  assigned * (0.95 + RANDOM() * 0.1) as assigned,
  actual * (0.90 + RANDOM() * 0.20) as actual, -- Vary by ±10%
  0 as variance, -- Will be recalculated
  EXTRACT(YEAR FROM CURRENT_DATE)::INT as year
FROM monthly_budget_nov
WHERE user_id = 'USER_ID_HERE';

-- 4. Copy debts from November to December (if table exists and has data)
INSERT INTO monthly_debts_dec (user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, year)
SELECT
  user_id,
  12 as month_id, -- December
  debt_account_id,
  ending_balance as starting_balance, -- Previous ending is new starting
  interest_rate_apr,
  min_payment,
  min_payment * (0.95 + RANDOM() * 0.1) as payment_made, -- Vary payment by ±5%
  ending_balance * 0.95 as ending_balance, -- Reduce debt by ~5%
  due_day,
  EXTRACT(YEAR FROM CURRENT_DATE)::INT as year
FROM monthly_debts_nov
WHERE user_id = 'USER_ID_HERE';

-- Verify insertion
SELECT 'Income' as table_name, COUNT(*) as records_inserted FROM monthly_income_dec WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Transactions', COUNT(*) FROM monthly_transactions_dec WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Budget', COUNT(*) FROM monthly_budget_dec WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Debts', COUNT(*) FROM monthly_debts_dec WHERE user_id = 'USER_ID_HERE';
