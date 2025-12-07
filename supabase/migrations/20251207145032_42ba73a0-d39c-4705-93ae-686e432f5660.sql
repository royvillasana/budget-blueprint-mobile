-- Drop views in correct order using CASCADE
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
GROUP BY user_id;