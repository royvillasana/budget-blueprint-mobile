-- 1. Find user ID
SELECT id, email, created_at
FROM auth.users
WHERE email LIKE '%royvillasana%' OR email LIKE '%roviliasana%';

-- 2. View November data (to use as template for December)
-- After running step 1, replace 'USER_ID_HERE' with the actual user ID

-- Income data from November
SELECT *
FROM monthly_income_nov
WHERE user_id = 'USER_ID_HERE'
ORDER BY date;

-- Transaction data from November
SELECT *
FROM monthly_transactions_nov
WHERE user_id = 'USER_ID_HERE'
ORDER BY date;

-- Budget data from November
SELECT *
FROM monthly_budget_nov
WHERE user_id = 'USER_ID_HERE';

-- Debt data from November (if exists)
SELECT *
FROM monthly_debts_nov
WHERE user_id = 'USER_ID_HERE';
