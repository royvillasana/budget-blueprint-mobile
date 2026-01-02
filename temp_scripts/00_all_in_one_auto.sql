-- ALL-IN-ONE SCRIPT (AUTO): Delete December data and insert fictional data
-- This version automatically finds the user by email
--
-- INSTRUCTIONS:
-- 1. Verify the email below is correct (line 14)
-- 2. Run this entire script in Supabase SQL Editor
-- 3. That's it! No need to find/replace user ID manually

DO $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT := 'royvillasana@gmail.com'; -- ⚠️ CHANGE THIS EMAIL IF NEEDED
  v_income_count INT;
  v_transaction_count INT;
  v_budget_count INT;
  v_debt_count INT;
BEGIN
  -- Find user ID by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_user_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', v_user_email;
  END IF;

  RAISE NOTICE 'Found user ID: % for email: %', v_user_id, v_user_email;

  -- Step 1: Delete existing December data
  RAISE NOTICE '=== STEP 1: Deleting December data ===';

  DELETE FROM monthly_income_dec WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_income_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % income records', v_income_count;

  DELETE FROM monthly_transactions_dec WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_transaction_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % transaction records', v_transaction_count;

  DELETE FROM monthly_budget_dec WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_budget_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % budget records', v_budget_count;

  DELETE FROM monthly_debts_dec WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_debt_count = ROW_COUNT;
  RAISE NOTICE 'Deleted % debt records', v_debt_count;

  -- Step 2: Insert fictional December data based on November
  RAISE NOTICE '=== STEP 2: Inserting fictional December data ===';

  -- Insert income
  INSERT INTO monthly_income_dec (user_id, month_id, source, amount, date, account_id, currency_code, notes, year)
  SELECT
    user_id,
    12 as month_id,
    source,
    ROUND((amount * (0.95 + RANDOM() * 0.1))::numeric, 2) as amount,
    (date + INTERVAL '1 month')::date as date,
    account_id,
    currency_code,
    notes,
    EXTRACT(YEAR FROM CURRENT_DATE)::INT as year
  FROM monthly_income_nov
  WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_income_count = ROW_COUNT;
  RAISE NOTICE 'Inserted % income records', v_income_count;

  -- Insert transactions
  INSERT INTO monthly_transactions_dec (user_id, month_id, category_id, description, amount, date, direction, currency_code, account_id, year)
  SELECT
    user_id,
    12 as month_id,
    category_id,
    description,
    ROUND((amount * (0.90 + RANDOM() * 0.20))::numeric, 2) as amount,
    (date + INTERVAL '1 month')::date as date,
    direction,
    currency_code,
    account_id,
    EXTRACT(YEAR FROM CURRENT_DATE)::INT as year
  FROM monthly_transactions_nov
  WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_transaction_count = ROW_COUNT;
  RAISE NOTICE 'Inserted % transaction records', v_transaction_count;

  -- Insert budget
  INSERT INTO monthly_budget_dec (user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance, year)
  SELECT
    user_id,
    12 as month_id,
    category_id,
    bucket_50_30_20,
    ROUND((estimated * (0.95 + RANDOM() * 0.1))::numeric, 2) as estimated,
    ROUND((assigned * (0.95 + RANDOM() * 0.1))::numeric, 2) as assigned,
    ROUND((actual * (0.90 + RANDOM() * 0.20))::numeric, 2) as actual,
    0 as variance,
    EXTRACT(YEAR FROM CURRENT_DATE)::INT as year
  FROM monthly_budget_nov
  WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_budget_count = ROW_COUNT;
  RAISE NOTICE 'Inserted % budget records', v_budget_count;

  -- Insert debts (if any exist)
  INSERT INTO monthly_debts_dec (user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day, year)
  SELECT
    user_id,
    12 as month_id,
    debt_account_id,
    ending_balance as starting_balance,
    interest_rate_apr,
    min_payment,
    ROUND((min_payment * (0.95 + RANDOM() * 0.1))::numeric, 2) as payment_made,
    ROUND((ending_balance * 0.95)::numeric, 2) as ending_balance,
    due_day,
    EXTRACT(YEAR FROM CURRENT_DATE)::INT as year
  FROM monthly_debts_nov
  WHERE user_id = v_user_id;
  GET DIAGNOSTICS v_debt_count = ROW_COUNT;
  RAISE NOTICE 'Inserted % debt records', v_debt_count;

  RAISE NOTICE '=== COMPLETED SUCCESSFULLY ===';

  -- Show summary
  RAISE NOTICE '=== SUMMARY ===';
  RAISE NOTICE 'User: % (%)', v_user_email, v_user_id;
  RAISE NOTICE 'Income records: %', v_income_count;
  RAISE NOTICE 'Transaction records: %', v_transaction_count;
  RAISE NOTICE 'Budget records: %', v_budget_count;
  RAISE NOTICE 'Debt records: %', v_debt_count;

END $$;
