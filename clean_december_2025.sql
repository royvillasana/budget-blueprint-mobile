-- Clean all December 2025 data for user royvillasana@gmail.com
-- This script will delete all transactions, income, budgets, debts, wishlist, and settings

-- First, get the user_id for royvillasana@gmail.com
DO $$
DECLARE
  target_user_id uuid;
  deleted_count integer;
BEGIN
  -- Find the user_id
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'royvillasana@gmail.com';

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User royvillasana@gmail.com not found';
    RETURN;
  END IF;

  RAISE NOTICE 'Cleaning December 2025 data for user: %', target_user_id;

  -- Delete from December tables where month_id = 12 (December)
  DELETE FROM public.monthly_transactions_dec
  WHERE user_id = target_user_id AND month_id = 12;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % transactions from monthly_transactions_dec', deleted_count;

  DELETE FROM public.monthly_income_dec
  WHERE user_id = target_user_id AND month_id = 12;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % income records from monthly_income_dec', deleted_count;

  DELETE FROM public.monthly_budget_dec
  WHERE user_id = target_user_id AND month_id = 12;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % budget records from monthly_budget_dec', deleted_count;

  DELETE FROM public.monthly_debts_dec
  WHERE user_id = target_user_id AND month_id = 12;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % debt records from monthly_debts_dec', deleted_count;

  DELETE FROM public.monthly_wishlist_dec
  WHERE user_id = target_user_id AND month_id = 12;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % wishlist items from monthly_wishlist_dec', deleted_count;

  DELETE FROM public.monthly_settings_dec
  WHERE user_id = target_user_id AND month_id = 12;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % settings from monthly_settings_dec', deleted_count;

  -- Also clean from old schema if it exists (monthly_budgets table)
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'monthly_budgets'
  ) THEN
    DELETE FROM public.monthly_budgets
    WHERE user_id = target_user_id AND year = 2025 AND month = 12;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from monthly_budgets', deleted_count;
  END IF;

  -- Clean from transactions table if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'transactions'
  ) THEN
    DELETE FROM public.transactions t
    USING public.monthly_budgets mb
    WHERE t.monthly_budget_id = mb.id
    AND mb.user_id = target_user_id
    AND mb.year = 2025
    AND mb.month = 12;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % records from transactions', deleted_count;
  END IF;

  RAISE NOTICE 'December 2025 data cleanup completed successfully';
END $$;
