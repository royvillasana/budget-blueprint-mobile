-- Migration: Fix annual summary view column names

DROP VIEW IF EXISTS public.view_annual_summary;

CREATE VIEW public.view_annual_summary AS
SELECT 
  year,
  SUM(total_income) as annual_income,
  SUM(total_expenses) as annual_expenses,
  SUM(net_cash_flow) as annual_net_cash_flow,
  SUM(total_budget) as annual_budget,
  SUM(total_spent) as annual_spent,
  SUM(total_variance) as annual_variance,
  SUM(total_debt_balance) as annual_debt,
  COUNT(*) as months_count
FROM public.view_monthly_summary
GROUP BY year
ORDER BY year DESC;
