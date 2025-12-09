-- Fix view_annual_summary column names to match TypeScript interface
-- The frontend expects columns with 'annual_' prefix

DROP VIEW IF EXISTS view_annual_summary CASCADE;

CREATE OR REPLACE VIEW view_annual_summary AS
SELECT
    user_id,
    SUM(total_income) AS annual_income,
    SUM(total_expenses) AS annual_expenses,
    SUM(net_cash_flow) AS annual_net_cash_flow,
    SUM(needs_actual) AS annual_needs_actual,
    SUM(wants_actual) AS annual_wants_actual,
    SUM(future_actual) AS annual_future_actual,
    SUM(needs_assigned) AS annual_needs_assigned,
    SUM(wants_assigned) AS annual_wants_assigned,
    SUM(future_assigned) AS annual_future_assigned,
    AVG(total_debt_balance) AS annual_avg_debt_balance,
    SUM(total_debt_payment) AS annual_debt_payments
FROM view_monthly_summary
GROUP BY user_id;

-- Set security invoker
ALTER VIEW view_annual_summary SET (security_invoker = on);

SELECT 'view_annual_summary columns fixed!' AS status;
