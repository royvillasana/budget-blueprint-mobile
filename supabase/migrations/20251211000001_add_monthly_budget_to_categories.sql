-- Add monthly_budget field to categories table
-- This field represents the monthly budget allocated for expenses in this category

ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS monthly_budget DECIMAL(12, 2) DEFAULT 0;

COMMENT ON COLUMN public.categories.monthly_budget IS 'Monthly budget allocated for this category. Used to determine financial health by comparing actual spending vs budgeted amount';
