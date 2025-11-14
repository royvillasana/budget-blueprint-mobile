-- Drop the existing check constraint on categories table
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_bucket_50_30_20_check;

-- Add new check constraint with all 5 bucket types
ALTER TABLE public.categories 
ADD CONSTRAINT categories_bucket_50_30_20_check 
CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE', 'INVESTMENTS', 'DEBT_PAYMENTS'));