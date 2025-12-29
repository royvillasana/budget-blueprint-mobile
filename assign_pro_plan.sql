-- Assign Pro Plan to royvillasana@gmail.com (test user)
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'royvillasana@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: royvillasana@gmail.com';
  END IF;

  -- Update or insert Pro subscription
  INSERT INTO public.subscriptions (
    user_id,
    plan,
    status,
    billing_interval,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    metadata
  ) VALUES (
    v_user_id,
    'pro',
    'active',
    'year',
    NOW(),
    NOW() + INTERVAL '100 years', -- Effectively unlimited
    FALSE,
    jsonb_build_object(
      'test_account', true,
      'unlimited', true,
      'note', 'Test user - unlimited Pro plan'
    )
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    plan = 'pro',
    status = 'active',
    billing_interval = 'year',
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '100 years',
    cancel_at_period_end = FALSE,
    metadata = jsonb_build_object(
      'test_account', true,
      'unlimited', true,
      'note', 'Test user - unlimited Pro plan'
    ),
    updated_at = NOW();

  RAISE NOTICE 'Pro plan assigned to user: % (ID: %)', 'royvillasana@gmail.com', v_user_id;
END $$;

-- Verify the subscription
SELECT
  u.email,
  s.plan,
  s.status,
  s.billing_interval,
  s.current_period_end,
  s.metadata
FROM public.subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE u.email = 'royvillasana@gmail.com';
