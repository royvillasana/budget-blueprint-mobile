-- Migration: Create views to handle transactions with category/payment method data

-- Create a view that unions all monthly transactions with category details
CREATE OR REPLACE VIEW public.all_transactions AS
SELECT 
  t.id, t.month_id, t.user_id, t.date, t.description, 
  t.category_id, COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  t.amount, t.direction, 
  t.payment_method_id, COALESCE(pm.name, '') as payment_method_name,
  t.account_id, COALESCE(acc.name, '') as account_name,
  t.currency_code, t.notes, t.created_at, t.updated_at
FROM public.monthly_transactions_jan t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts acc ON t.account_id = acc.id

UNION ALL

SELECT 
  t.id, t.month_id, t.user_id, t.date, t.description, 
  t.category_id, COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  t.amount, t.direction, 
  t.payment_method_id, COALESCE(pm.name, '') as payment_method_name,
  t.account_id, COALESCE(acc.name, '') as account_name,
  t.currency_code, t.notes, t.created_at, t.updated_at
FROM public.monthly_transactions_feb t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts acc ON t.account_id = acc.id

UNION ALL

SELECT 
  t.id, t.month_id, t.user_id, t.date, t.description, 
  t.category_id, COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  t.amount, t.direction, 
  t.payment_method_id, COALESCE(pm.name, '') as payment_method_name,
  t.account_id, COALESCE(acc.name, '') as account_name,
  t.currency_code, t.notes, t.created_at, t.updated_at
FROM public.monthly_transactions_mar t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts acc ON t.account_id = acc.id

UNION ALL

SELECT 
  t.id, t.month_id, t.user_id, t.date, t.description, 
  t.category_id, COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  t.amount, t.direction, 
  t.payment_method_id, COALESCE(pm.name, '') as payment_method_name,
  t.account_id, COALESCE(acc.name, '') as account_name,
  t.currency_code, t.notes, t.created_at, t.updated_at
FROM public.monthly_transactions_apr t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts acc ON t.account_id = acc.id

UNION ALL

SELECT 
  t.id, t.month_id, t.user_id, t.date, t.description, 
  t.category_id, COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  t.amount, t.direction, 
  t.payment_method_id, COALESCE(pm.name, '') as payment_method_name,
  t.account_id, COALESCE(acc.name, '') as account_name,
  t.currency_code, t.notes, t.created_at, t.updated_at
FROM public.monthly_transactions_may t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts acc ON t.account_id = acc.id

UNION ALL

SELECT 
  t.id, t.month_id, t.user_id, t.date, t.description, 
  t.category_id, COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  t.amount, t.direction, 
  t.payment_method_id, COALESCE(pm.name, '') as payment_method_name,
  t.account_id, COALESCE(acc.name, '') as account_name,
  t.currency_code, t.notes, t.created_at, t.updated_at
FROM public.monthly_transactions_jun t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts acc ON t.account_id = acc.id

UNION ALL

SELECT 
  t.id, t.month_id, t.user_id, t.date, t.description, 
  t.category_id, COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  t.amount, t.direction, 
  t.payment_method_id, COALESCE(pm.name, '') as payment_method_name,
  t.account_id, COALESCE(acc.name, '') as account_name,
  t.currency_code, t.notes, t.created_at, t.updated_at
FROM public.monthly_transactions_jul t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts acc ON t.account_id = acc.id

UNION ALL

SELECT 
  t.id, t.month_id, t.user_id, t.date, t.description, 
  t.category_id, COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  t.amount, t.direction, 
  t.payment_method_id, COALESCE(pm.name, '') as payment_method_name,
  t.account_id, COALESCE(acc.name, '') as account_name,
  t.currency_code, t.notes, t.created_at, t.updated_at
FROM public.monthly_transactions_aug t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts acc ON t.account_id = acc.id

UNION ALL

SELECT 
  t.id, t.month_id, t.user_id, t.date, t.description, 
  t.category_id, COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  t.amount, t.direction, 
  t.payment_method_id, COALESCE(pm.name, '') as payment_method_name,
  t.account_id, COALESCE(acc.name, '') as account_name,
  t.currency_code, t.notes, t.created_at, t.updated_at
FROM public.monthly_transactions_sep t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts acc ON t.account_id = acc.id

UNION ALL

SELECT 
  t.id, t.month_id, t.user_id, t.date, t.description, 
  t.category_id, COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  t.amount, t.direction, 
  t.payment_method_id, COALESCE(pm.name, '') as payment_method_name,
  t.account_id, COALESCE(acc.name, '') as account_name,
  t.currency_code, t.notes, t.created_at, t.updated_at
FROM public.monthly_transactions_oct t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts acc ON t.account_id = acc.id

UNION ALL

SELECT 
  t.id, t.month_id, t.user_id, t.date, t.description, 
  t.category_id, COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  t.amount, t.direction, 
  t.payment_method_id, COALESCE(pm.name, '') as payment_method_name,
  t.account_id, COALESCE(acc.name, '') as account_name,
  t.currency_code, t.notes, t.created_at, t.updated_at
FROM public.monthly_transactions_nov t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts acc ON t.account_id = acc.id

UNION ALL

SELECT 
  t.id, t.month_id, t.user_id, t.date, t.description, 
  t.category_id, COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  t.amount, t.direction, 
  t.payment_method_id, COALESCE(pm.name, '') as payment_method_name,
  t.account_id, COALESCE(acc.name, '') as account_name,
  t.currency_code, t.notes, t.created_at, t.updated_at
FROM public.monthly_transactions_dec t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.payment_methods pm ON t.payment_method_id = pm.id
LEFT JOIN public.accounts acc ON t.account_id = acc.id;

-- Create a view for budget with category data
CREATE OR REPLACE VIEW public.all_budget AS
SELECT 
  b.id, b.month_id, b.user_id, b.category_id, 
  COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  COALESCE(c.bucket_50_30_20, '') as bucket_50_30_20,
  b.planned_amount, b.spent_amount, b.variance, 
  b.created_at, b.updated_at
FROM public.monthly_budget_jan b
LEFT JOIN public.categories c ON b.category_id = c.id

UNION ALL

SELECT 
  b.id, b.month_id, b.user_id, b.category_id, 
  COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  COALESCE(c.bucket_50_30_20, '') as bucket_50_30_20,
  b.planned_amount, b.spent_amount, b.variance, 
  b.created_at, b.updated_at
FROM public.monthly_budget_feb b
LEFT JOIN public.categories c ON b.category_id = c.id

UNION ALL

SELECT 
  b.id, b.month_id, b.user_id, b.category_id, 
  COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  COALESCE(c.bucket_50_30_20, '') as bucket_50_30_20,
  b.planned_amount, b.spent_amount, b.variance, 
  b.created_at, b.updated_at
FROM public.monthly_budget_mar b
LEFT JOIN public.categories c ON b.category_id = c.id

UNION ALL

SELECT 
  b.id, b.month_id, b.user_id, b.category_id, 
  COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  COALESCE(c.bucket_50_30_20, '') as bucket_50_30_20,
  b.planned_amount, b.spent_amount, b.variance, 
  b.created_at, b.updated_at
FROM public.monthly_budget_apr b
LEFT JOIN public.categories c ON b.category_id = c.id

UNION ALL

SELECT 
  b.id, b.month_id, b.user_id, b.category_id, 
  COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  COALESCE(c.bucket_50_30_20, '') as bucket_50_30_20,
  b.planned_amount, b.spent_amount, b.variance, 
  b.created_at, b.updated_at
FROM public.monthly_budget_may b
LEFT JOIN public.categories c ON b.category_id = c.id

UNION ALL

SELECT 
  b.id, b.month_id, b.user_id, b.category_id, 
  COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  COALESCE(c.bucket_50_30_20, '') as bucket_50_30_20,
  b.planned_amount, b.spent_amount, b.variance, 
  b.created_at, b.updated_at
FROM public.monthly_budget_jun b
LEFT JOIN public.categories c ON b.category_id = c.id

UNION ALL

SELECT 
  b.id, b.month_id, b.user_id, b.category_id, 
  COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  COALESCE(c.bucket_50_30_20, '') as bucket_50_30_20,
  b.planned_amount, b.spent_amount, b.variance, 
  b.created_at, b.updated_at
FROM public.monthly_budget_jul b
LEFT JOIN public.categories c ON b.category_id = c.id

UNION ALL

SELECT 
  b.id, b.month_id, b.user_id, b.category_id, 
  COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  COALESCE(c.bucket_50_30_20, '') as bucket_50_30_20,
  b.planned_amount, b.spent_amount, b.variance, 
  b.created_at, b.updated_at
FROM public.monthly_budget_aug b
LEFT JOIN public.categories c ON b.category_id = c.id

UNION ALL

SELECT 
  b.id, b.month_id, b.user_id, b.category_id, 
  COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  COALESCE(c.bucket_50_30_20, '') as bucket_50_30_20,
  b.planned_amount, b.spent_amount, b.variance, 
  b.created_at, b.updated_at
FROM public.monthly_budget_sep b
LEFT JOIN public.categories c ON b.category_id = c.id

UNION ALL

SELECT 
  b.id, b.month_id, b.user_id, b.category_id, 
  COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  COALESCE(c.bucket_50_30_20, '') as bucket_50_30_20,
  b.planned_amount, b.spent_amount, b.variance, 
  b.created_at, b.updated_at
FROM public.monthly_budget_oct b
LEFT JOIN public.categories c ON b.category_id = c.id

UNION ALL

SELECT 
  b.id, b.month_id, b.user_id, b.category_id, 
  COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  COALESCE(c.bucket_50_30_20, '') as bucket_50_30_20,
  b.planned_amount, b.spent_amount, b.variance, 
  b.created_at, b.updated_at
FROM public.monthly_budget_nov b
LEFT JOIN public.categories c ON b.category_id = c.id

UNION ALL

SELECT 
  b.id, b.month_id, b.user_id, b.category_id, 
  COALESCE(c.name, '') as category_name, COALESCE(c.emoji, '') as category_emoji,
  COALESCE(c.bucket_50_30_20, '') as bucket_50_30_20,
  b.planned_amount, b.spent_amount, b.variance, 
  b.created_at, b.updated_at
FROM public.monthly_budget_dec b
LEFT JOIN public.categories c ON b.category_id = c.id;
