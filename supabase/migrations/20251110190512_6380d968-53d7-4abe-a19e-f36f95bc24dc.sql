-- Phase 3: Create unified analytics views combining all 12 months

-- View 1: All transactions across all months
CREATE OR REPLACE VIEW view_transactions_all AS
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'jan' as month_abbr FROM public.monthly_transactions_jan
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'feb' as month_abbr FROM public.monthly_transactions_feb
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'mar' as month_abbr FROM public.monthly_transactions_mar
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'apr' as month_abbr FROM public.monthly_transactions_apr
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'may' as month_abbr FROM public.monthly_transactions_may
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'jun' as month_abbr FROM public.monthly_transactions_jun
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'jul' as month_abbr FROM public.monthly_transactions_jul
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'aug' as month_abbr FROM public.monthly_transactions_aug
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'sep' as month_abbr FROM public.monthly_transactions_sep
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'oct' as month_abbr FROM public.monthly_transactions_oct
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'nov' as month_abbr FROM public.monthly_transactions_nov
UNION ALL
SELECT id, user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code, notes, created_at, 'dec' as month_abbr FROM public.monthly_transactions_dec;

-- View 2: All income across all months
CREATE OR REPLACE VIEW view_income_all AS
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'jan' as month_abbr FROM public.monthly_income_jan
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'feb' as month_abbr FROM public.monthly_income_feb
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'mar' as month_abbr FROM public.monthly_income_mar
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'apr' as month_abbr FROM public.monthly_income_apr
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'may' as month_abbr FROM public.monthly_income_may
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'jun' as month_abbr FROM public.monthly_income_jun
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'jul' as month_abbr FROM public.monthly_income_jul
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'aug' as month_abbr FROM public.monthly_income_aug
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'sep' as month_abbr FROM public.monthly_income_sep
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'oct' as month_abbr FROM public.monthly_income_oct
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'nov' as month_abbr FROM public.monthly_income_nov
UNION ALL
SELECT id, user_id, month_id, date, source, amount, account_id, currency_code, notes, created_at, 'dec' as month_abbr FROM public.monthly_income_dec;

-- View 3: All budget entries across all months
CREATE OR REPLACE VIEW view_budget_all AS
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'jan' as month_abbr FROM public.monthly_budget_jan
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'feb' as month_abbr FROM public.monthly_budget_feb
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'mar' as month_abbr FROM public.monthly_budget_mar
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'apr' as month_abbr FROM public.monthly_budget_apr
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'may' as month_abbr FROM public.monthly_budget_may
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'jun' as month_abbr FROM public.monthly_budget_jun
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'jul' as month_abbr FROM public.monthly_budget_jul
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'aug' as month_abbr FROM public.monthly_budget_aug
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'sep' as month_abbr FROM public.monthly_budget_sep
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'oct' as month_abbr FROM public.monthly_budget_oct
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'nov' as month_abbr FROM public.monthly_budget_nov
UNION ALL
SELECT id, user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, created_at, updated_at, 'dec' as month_abbr FROM public.monthly_budget_dec;

-- View 4: All debts across all months
CREATE OR REPLACE VIEW view_debts_all AS
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'jan' as month_abbr FROM public.monthly_debts_jan
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'feb' as month_abbr FROM public.monthly_debts_feb
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'mar' as month_abbr FROM public.monthly_debts_mar
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'apr' as month_abbr FROM public.monthly_debts_apr
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'may' as month_abbr FROM public.monthly_debts_may
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'jun' as month_abbr FROM public.monthly_debts_jun
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'jul' as month_abbr FROM public.monthly_debts_jul
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'aug' as month_abbr FROM public.monthly_debts_aug
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'sep' as month_abbr FROM public.monthly_debts_sep
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'oct' as month_abbr FROM public.monthly_debts_oct
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'nov' as month_abbr FROM public.monthly_debts_nov
UNION ALL
SELECT id, user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, created_at, 'dec' as month_abbr FROM public.monthly_debts_dec;

-- View 5: All wishlist items across all months
CREATE OR REPLACE VIEW view_wishlist_all AS
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'jan' as month_abbr FROM public.monthly_wishlist_jan
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'feb' as month_abbr FROM public.monthly_wishlist_feb
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'mar' as month_abbr FROM public.monthly_wishlist_mar
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'apr' as month_abbr FROM public.monthly_wishlist_apr
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'may' as month_abbr FROM public.monthly_wishlist_may
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'jun' as month_abbr FROM public.monthly_wishlist_jun
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'jul' as month_abbr FROM public.monthly_wishlist_jul
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'aug' as month_abbr FROM public.monthly_wishlist_aug
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'sep' as month_abbr FROM public.monthly_wishlist_sep
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'oct' as month_abbr FROM public.monthly_wishlist_oct
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'nov' as month_abbr FROM public.monthly_wishlist_nov
UNION ALL
SELECT id, user_id, month_id, item, estimated_cost, category_id, priority, acquired, created_at, 'dec' as month_abbr FROM public.monthly_wishlist_dec;

-- View 6: All settings across all months
CREATE OR REPLACE VIEW view_settings_all AS
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'jan' as month_abbr FROM public.monthly_settings_jan
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'feb' as month_abbr FROM public.monthly_settings_feb
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'mar' as month_abbr FROM public.monthly_settings_mar
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'apr' as month_abbr FROM public.monthly_settings_apr
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'may' as month_abbr FROM public.monthly_settings_may
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'jun' as month_abbr FROM public.monthly_settings_jun
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'jul' as month_abbr FROM public.monthly_settings_jul
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'aug' as month_abbr FROM public.monthly_settings_aug
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'sep' as month_abbr FROM public.monthly_settings_sep
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'oct' as month_abbr FROM public.monthly_settings_oct
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'nov' as month_abbr FROM public.monthly_settings_nov
UNION ALL
SELECT id, user_id, month_id, budget_mode, carryover_prev_balance, unassigned_pool, monthly_challenge, created_at, updated_at, 'dec' as month_abbr FROM public.monthly_settings_dec;

-- View 7: Monthly summary aggregating key metrics per month
CREATE OR REPLACE VIEW view_monthly_summary AS
SELECT 
  m.id as month_id,
  m.name as month_name,
  m.start_date,
  m.end_date,
  i.user_id,
  COALESCE(SUM(i.amount), 0) as total_income,
  COALESCE(SUM(CASE WHEN t.direction = 'EXPENSE' THEN ABS(t.amount) ELSE 0 END), 0) as total_expenses,
  COALESCE(SUM(i.amount), 0) - COALESCE(SUM(CASE WHEN t.direction = 'EXPENSE' THEN ABS(t.amount) ELSE 0 END), 0) as net_cash_flow,
  COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN b.actual ELSE 0 END), 0) as needs_actual,
  COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN b.actual ELSE 0 END), 0) as wants_actual,
  COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN b.actual ELSE 0 END), 0) as future_actual,
  COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'NEEDS' THEN b.assigned ELSE 0 END), 0) as needs_assigned,
  COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'WANTS' THEN b.assigned ELSE 0 END), 0) as wants_assigned,
  COALESCE(SUM(CASE WHEN b.bucket_50_30_20 = 'FUTURE' THEN b.assigned ELSE 0 END), 0) as future_assigned,
  COALESCE(SUM(d.payment_made), 0) as debt_payments,
  COALESCE(SUM(w.estimated_cost), 0) as wishlist_total_cost,
  COUNT(DISTINCT w.id) as wishlist_item_count
FROM public.months m
LEFT JOIN view_income_all i ON m.id = i.month_id
LEFT JOIN view_transactions_all t ON m.id = t.month_id AND t.user_id = i.user_id
LEFT JOIN view_budget_all b ON m.id = b.month_id AND b.user_id = i.user_id
LEFT JOIN view_debts_all d ON m.id = d.month_id AND d.user_id = i.user_id
LEFT JOIN view_wishlist_all w ON m.id = w.month_id AND w.user_id = i.user_id
GROUP BY m.id, m.name, m.start_date, m.end_date, i.user_id;

-- View 8: Annual summary with totals and averages across all months
CREATE OR REPLACE VIEW view_annual_summary AS
SELECT 
  user_id,
  SUM(total_income) as annual_income,
  SUM(total_expenses) as annual_expenses,
  SUM(net_cash_flow) as annual_net_cash_flow,
  AVG(total_income) as avg_monthly_income,
  AVG(total_expenses) as avg_monthly_expenses,
  AVG(net_cash_flow) as avg_monthly_net_cash_flow,
  SUM(needs_actual) as annual_needs_actual,
  SUM(wants_actual) as annual_wants_actual,
  SUM(future_actual) as annual_future_actual,
  SUM(needs_assigned) as annual_needs_assigned,
  SUM(wants_assigned) as annual_wants_assigned,
  SUM(future_assigned) as annual_future_assigned,
  SUM(debt_payments) as annual_debt_payments,
  SUM(wishlist_total_cost) as annual_wishlist_cost,
  SUM(wishlist_item_count) as total_wishlist_items
FROM view_monthly_summary
GROUP BY user_id;