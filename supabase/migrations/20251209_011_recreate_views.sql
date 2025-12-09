-- Migration: Recreate views with correct schema
-- Now that budget and wishlist columns are fixed, create the views

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop views if they exist
DROP VIEW IF EXISTS public.view_annual_summary;
DROP VIEW IF EXISTS public.view_monthly_summary;

-- View for monthly summary (aggregates all monthly data)
CREATE VIEW public.view_monthly_summary AS
SELECT 
  m.id as month_id,
  m.name,
  m.year,
  COALESCE(SUM(CASE WHEN t.direction = 'INCOME' THEN t.amount ELSE 0 END), 0) as total_income,
  COALESCE(SUM(CASE WHEN t.direction = 'EXPENSE' THEN t.amount ELSE 0 END), 0) as total_expenses,
  COALESCE(SUM(CASE WHEN t.direction = 'INCOME' THEN t.amount ELSE 0 END), 0) - 
  COALESCE(SUM(CASE WHEN t.direction = 'EXPENSE' THEN t.amount ELSE 0 END), 0) as net_cash_flow,
  COALESCE(SUM(CASE WHEN b.planned_amount > 0 THEN b.planned_amount ELSE 0 END), 0) as total_budget,
  COALESCE(SUM(CASE WHEN b.spent_amount > 0 THEN b.spent_amount ELSE 0 END), 0) as total_spent,
  COALESCE(SUM(CASE WHEN b.planned_amount > 0 THEN b.variance ELSE 0 END), 0) as total_variance,
  COUNT(DISTINCT CASE WHEN d.id IS NOT NULL THEN d.id END) as debt_count,
  COALESCE(SUM(d.ending_balance), 0) as total_debt_balance,
  COUNT(DISTINCT CASE WHEN w.id IS NOT NULL THEN w.id END) as wishlist_count,
  COALESCE(SUM(w.remaining), 0) as wishlist_remaining,
  NOW() as created_at,
  NOW() as updated_at
FROM public.months m
LEFT JOIN (
  SELECT month_id, amount, direction FROM public.monthly_transactions_jan
  UNION ALL
  SELECT month_id, amount, direction FROM public.monthly_transactions_feb
  UNION ALL
  SELECT month_id, amount, direction FROM public.monthly_transactions_mar
  UNION ALL
  SELECT month_id, amount, direction FROM public.monthly_transactions_apr
  UNION ALL
  SELECT month_id, amount, direction FROM public.monthly_transactions_may
  UNION ALL
  SELECT month_id, amount, direction FROM public.monthly_transactions_jun
  UNION ALL
  SELECT month_id, amount, direction FROM public.monthly_transactions_jul
  UNION ALL
  SELECT month_id, amount, direction FROM public.monthly_transactions_aug
  UNION ALL
  SELECT month_id, amount, direction FROM public.monthly_transactions_sep
  UNION ALL
  SELECT month_id, amount, direction FROM public.monthly_transactions_oct
  UNION ALL
  SELECT month_id, amount, direction FROM public.monthly_transactions_nov
  UNION ALL
  SELECT month_id, amount, direction FROM public.monthly_transactions_dec
) t ON m.id = t.month_id
LEFT JOIN (
  SELECT month_id, planned_amount, spent_amount, variance FROM public.monthly_budget_jan
  UNION ALL
  SELECT month_id, planned_amount, spent_amount, variance FROM public.monthly_budget_feb
  UNION ALL
  SELECT month_id, planned_amount, spent_amount, variance FROM public.monthly_budget_mar
  UNION ALL
  SELECT month_id, planned_amount, spent_amount, variance FROM public.monthly_budget_apr
  UNION ALL
  SELECT month_id, planned_amount, spent_amount, variance FROM public.monthly_budget_may
  UNION ALL
  SELECT month_id, planned_amount, spent_amount, variance FROM public.monthly_budget_jun
  UNION ALL
  SELECT month_id, planned_amount, spent_amount, variance FROM public.monthly_budget_jul
  UNION ALL
  SELECT month_id, planned_amount, spent_amount, variance FROM public.monthly_budget_aug
  UNION ALL
  SELECT month_id, planned_amount, spent_amount, variance FROM public.monthly_budget_sep
  UNION ALL
  SELECT month_id, planned_amount, spent_amount, variance FROM public.monthly_budget_oct
  UNION ALL
  SELECT month_id, planned_amount, spent_amount, variance FROM public.monthly_budget_nov
  UNION ALL
  SELECT month_id, planned_amount, spent_amount, variance FROM public.monthly_budget_dec
) b ON m.id = b.month_id
LEFT JOIN (
  SELECT month_id, id, ending_balance FROM public.monthly_debts_jan
  UNION ALL
  SELECT month_id, id, ending_balance FROM public.monthly_debts_feb
  UNION ALL
  SELECT month_id, id, ending_balance FROM public.monthly_debts_mar
  UNION ALL
  SELECT month_id, id, ending_balance FROM public.monthly_debts_apr
  UNION ALL
  SELECT month_id, id, ending_balance FROM public.monthly_debts_may
  UNION ALL
  SELECT month_id, id, ending_balance FROM public.monthly_debts_jun
  UNION ALL
  SELECT month_id, id, ending_balance FROM public.monthly_debts_jul
  UNION ALL
  SELECT month_id, id, ending_balance FROM public.monthly_debts_aug
  UNION ALL
  SELECT month_id, id, ending_balance FROM public.monthly_debts_sep
  UNION ALL
  SELECT month_id, id, ending_balance FROM public.monthly_debts_oct
  UNION ALL
  SELECT month_id, id, ending_balance FROM public.monthly_debts_nov
  UNION ALL
  SELECT month_id, id, ending_balance FROM public.monthly_debts_dec
) d ON m.id = d.month_id
LEFT JOIN (
  SELECT month_id, id, remaining FROM public.monthly_wishlist_jan
  UNION ALL
  SELECT month_id, id, remaining FROM public.monthly_wishlist_feb
  UNION ALL
  SELECT month_id, id, remaining FROM public.monthly_wishlist_mar
  UNION ALL
  SELECT month_id, id, remaining FROM public.monthly_wishlist_apr
  UNION ALL
  SELECT month_id, id, remaining FROM public.monthly_wishlist_may
  UNION ALL
  SELECT month_id, id, remaining FROM public.monthly_wishlist_jun
  UNION ALL
  SELECT month_id, id, remaining FROM public.monthly_wishlist_jul
  UNION ALL
  SELECT month_id, id, remaining FROM public.monthly_wishlist_aug
  UNION ALL
  SELECT month_id, id, remaining FROM public.monthly_wishlist_sep
  UNION ALL
  SELECT month_id, id, remaining FROM public.monthly_wishlist_oct
  UNION ALL
  SELECT month_id, id, remaining FROM public.monthly_wishlist_nov
  UNION ALL
  SELECT month_id, id, remaining FROM public.monthly_wishlist_dec
) w ON m.id = w.month_id
GROUP BY m.id, m.name, m.year
ORDER BY m.id;

-- View for annual summary
CREATE VIEW public.view_annual_summary AS
SELECT 
  year,
  SUM(total_income) as total_annual_income,
  SUM(total_expenses) as total_annual_expenses,
  SUM(net_cash_flow) as total_annual_net_cash_flow,
  SUM(total_budget) as total_annual_budget,
  SUM(total_spent) as total_annual_spent,
  SUM(total_variance) as total_annual_variance,
  SUM(total_debt_balance) as total_annual_debt,
  COUNT(*) as months_count
FROM public.view_monthly_summary
GROUP BY year
ORDER BY year DESC;
