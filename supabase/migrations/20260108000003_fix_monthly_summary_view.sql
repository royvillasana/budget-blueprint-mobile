-- Fix view_monthly_summary to properly isolate user data
-- Prevents data from different users being mixed in monthly/annual summaries
--
-- PROBLEM: The original view used a CROSS JOIN with ALL years from ALL users,
-- and JOIN conditions used COALESCE which created tautologies that allowed
-- data from different users to be incorrectly matched.
--
-- SOLUTION: Use a CTE to get only (user_id, year) combinations that actually
-- exist for each user, and explicitly match user_id in all JOIN conditions.

-- Drop the existing views (view_annual_summary depends on view_monthly_summary)
DROP VIEW IF EXISTS public.view_annual_summary;
DROP VIEW IF EXISTS public.view_monthly_summary;

-- Recreate view_monthly_summary with proper user isolation
CREATE OR REPLACE VIEW public.view_monthly_summary AS
WITH user_years AS (
  -- Get distinct (user_id, year) combinations that actually exist
  -- Only includes years where the user has actual data
  SELECT DISTINCT user_id, year FROM view_income_all
  UNION
  SELECT DISTINCT user_id, year FROM view_transactions_all
  UNION
  SELECT DISTINCT user_id, year FROM view_budget_all
  UNION
  SELECT DISTINCT user_id, year FROM view_debts_all
),
user_month_year AS (
  -- Cross join with months to get all (user_id, month_id, year) combinations
  -- Now only creates rows for years that belong to the user
  SELECT uy.user_id, m.id AS month_id, m.name AS month_name, uy.year
  FROM user_years uy
  CROSS JOIN months m
)
SELECT
    umy.month_id,
    umy.month_name,
    umy.year,
    umy.user_id,
    COALESCE(income_agg.total_income, 0) AS total_income,
    COALESCE(trans_agg.total_expenses, 0) AS total_expenses,
    COALESCE(income_agg.total_income, 0) - COALESCE(trans_agg.total_expenses, 0) AS net_cash_flow,
    COALESCE(budget_agg.needs_actual, 0) AS needs_actual,
    COALESCE(budget_agg.wants_actual, 0) AS wants_actual,
    COALESCE(budget_agg.future_actual, 0) AS future_actual,
    COALESCE(budget_agg.needs_assigned, 0) AS needs_assigned,
    COALESCE(budget_agg.wants_assigned, 0) AS wants_assigned,
    COALESCE(budget_agg.future_assigned, 0) AS future_assigned,
    COALESCE(debts_agg.debt_payments, 0) AS debt_payments
FROM user_month_year umy
-- JOIN income: Now explicitly matches user_id
LEFT JOIN (
    SELECT month_id, year, user_id, SUM(amount) AS total_income
    FROM view_income_all
    GROUP BY month_id, year, user_id
) income_agg ON umy.month_id = income_agg.month_id
               AND umy.year = income_agg.year
               AND umy.user_id = income_agg.user_id
-- JOIN transactions: Explicitly matches user_id (no more COALESCE tautology)
LEFT JOIN (
    SELECT month_id, year, user_id,
           SUM(CASE WHEN direction = 'EXPENSE' THEN ABS(amount) ELSE 0 END) AS total_expenses
    FROM view_transactions_all
    GROUP BY month_id, year, user_id
) trans_agg ON umy.month_id = trans_agg.month_id
              AND umy.year = trans_agg.year
              AND umy.user_id = trans_agg.user_id
-- JOIN budget: Explicitly matches user_id
LEFT JOIN (
    SELECT month_id, year, user_id,
        SUM(CASE WHEN bucket_50_30_20 = 'NEEDS' THEN actual ELSE 0 END) AS needs_actual,
        SUM(CASE WHEN bucket_50_30_20 = 'WANTS' THEN actual ELSE 0 END) AS wants_actual,
        SUM(CASE WHEN bucket_50_30_20 = 'FUTURE' THEN actual ELSE 0 END) AS future_actual,
        SUM(CASE WHEN bucket_50_30_20 = 'NEEDS' THEN assigned ELSE 0 END) AS needs_assigned,
        SUM(CASE WHEN bucket_50_30_20 = 'WANTS' THEN assigned ELSE 0 END) AS wants_assigned,
        SUM(CASE WHEN bucket_50_30_20 = 'FUTURE' THEN assigned ELSE 0 END) AS future_assigned
    FROM view_budget_all
    GROUP BY month_id, year, user_id
) budget_agg ON umy.month_id = budget_agg.month_id
               AND umy.year = budget_agg.year
               AND umy.user_id = budget_agg.user_id
-- JOIN debts: Explicitly matches user_id
LEFT JOIN (
    SELECT month_id, year, user_id, SUM(payment_made) AS debt_payments
    FROM view_debts_all
    GROUP BY month_id, year, user_id
) debts_agg ON umy.month_id = debts_agg.month_id
              AND umy.year = debts_agg.year
              AND umy.user_id = debts_agg.user_id;

-- Recreate view_annual_summary (unchanged logic, but depends on view_monthly_summary)
CREATE OR REPLACE VIEW public.view_annual_summary AS
SELECT
    year,
    user_id,
    SUM(total_income) AS annual_income,
    SUM(total_expenses) AS annual_expenses,
    SUM(net_cash_flow) AS annual_net_cash_flow,
    SUM(needs_actual) AS annual_needs_actual,
    SUM(wants_actual) AS annual_wants_actual,
    SUM(future_actual) AS annual_future_actual,
    SUM(debt_payments) AS annual_debt_payments
FROM view_monthly_summary
WHERE user_id IS NOT NULL
GROUP BY year, user_id;

-- Restore security invoker settings
-- This ensures RLS policies are applied when querying these views
ALTER VIEW view_monthly_summary SET (security_invoker = on);
ALTER VIEW view_annual_summary SET (security_invoker = on);
