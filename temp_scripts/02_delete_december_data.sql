-- Delete all December data for the user
-- Replace 'USER_ID_HERE' with the actual user ID from step 1

-- Delete December income
DELETE FROM monthly_income_dec
WHERE user_id = 'USER_ID_HERE';

-- Delete December transactions
DELETE FROM monthly_transactions_dec
WHERE user_id = 'USER_ID_HERE';

-- Delete December budget
DELETE FROM monthly_budget_dec
WHERE user_id = 'USER_ID_HERE';

-- Delete December debts (if exists)
DELETE FROM monthly_debts_dec
WHERE user_id = 'USER_ID_HERE';

-- Verify deletion
SELECT 'Income' as table_name, COUNT(*) as remaining_records FROM monthly_income_dec WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Transactions', COUNT(*) FROM monthly_transactions_dec WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Budget', COUNT(*) FROM monthly_budget_dec WHERE user_id = 'USER_ID_HERE'
UNION ALL
SELECT 'Debts', COUNT(*) FROM monthly_debts_dec WHERE user_id = 'USER_ID_HERE';
