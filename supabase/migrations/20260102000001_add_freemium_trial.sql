-- Migration: Add Freemium Trial (2 weeks Pro trial for new users)
-- Created: 2026-01-02
-- Description: Updates subscription system to give new users 14-day Pro trial

-- ============================================================================
-- Update subscription creation to include trial
-- ============================================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS public.create_default_subscription();

-- Create updated function that starts users on Pro trial
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS TRIGGER AS $$
DECLARE
  v_trial_start TIMESTAMPTZ;
  v_trial_end TIMESTAMPTZ;
BEGIN
  -- Set trial period (14 days from now)
  v_trial_start := NOW();
  v_trial_end := NOW() + INTERVAL '14 days';

  INSERT INTO public.subscriptions (
    user_id,
    plan,
    status,
    trial_start,
    trial_end,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    'pro',                      -- Start with Pro plan during trial
    'trialing',                 -- Status is trialing
    v_trial_start,
    v_trial_end,
    v_trial_start,
    v_trial_end                 -- Period ends when trial ends
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_subscription();

-- ============================================================================
-- Function to check and expire trials
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_and_expire_trials()
RETURNS TABLE (
  user_id UUID,
  expired_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Update expired trials to free plan
  RETURN QUERY
  UPDATE public.subscriptions
  SET
    status = 'canceled',
    plan = 'free',
    updated_at = NOW()
  WHERE
    status = 'trialing'
    AND trial_end <= NOW()
    AND stripe_subscription_id IS NULL  -- Only expire trials not converted to paid
  RETURNING
    subscriptions.user_id,
    subscriptions.trial_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function to get trial status for a user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_trial_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_subscription RECORD;
  v_days_remaining INTEGER;
  v_is_active BOOLEAN;
BEGIN
  -- Get subscription info
  SELECT
    plan,
    status,
    trial_start,
    trial_end,
    current_period_end
  INTO v_subscription
  FROM public.subscriptions
  WHERE user_id = p_user_id;

  -- If no subscription found
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'has_trial', FALSE,
      'is_trialing', FALSE,
      'trial_expired', FALSE
    );
  END IF;

  -- Check if currently trialing
  v_is_active := v_subscription.status = 'trialing' AND v_subscription.trial_end > NOW();

  -- Calculate days remaining
  IF v_subscription.trial_end IS NOT NULL THEN
    v_days_remaining := GREATEST(0, EXTRACT(DAY FROM (v_subscription.trial_end - NOW()))::INTEGER);
  ELSE
    v_days_remaining := 0;
  END IF;

  RETURN jsonb_build_object(
    'has_trial', v_subscription.trial_start IS NOT NULL,
    'is_trialing', v_is_active,
    'trial_start', v_subscription.trial_start,
    'trial_end', v_subscription.trial_end,
    'trial_expired', v_subscription.trial_end IS NOT NULL AND v_subscription.trial_end <= NOW(),
    'days_remaining', v_days_remaining,
    'current_plan', v_subscription.plan,
    'current_status', v_subscription.status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_trial_status(UUID) TO authenticated;

-- ============================================================================
-- Update entitlements view to handle trialing status
-- ============================================================================

-- Drop existing view
DROP VIEW IF EXISTS public.user_entitlements;

-- Recreate with better trial handling
CREATE OR REPLACE VIEW public.user_entitlements AS
SELECT
  s.user_id,
  s.plan,
  s.status,

  -- Check if trial is active
  CASE
    WHEN s.status = 'trialing' AND s.trial_end > NOW() THEN TRUE
    ELSE FALSE
  END AS is_trial_active,

  -- Feature flags (during trial, user gets Pro features)
  CASE
    WHEN (s.status = 'trialing' AND s.trial_end > NOW()) THEN TRUE  -- Trial gets all features
    WHEN s.plan IN ('essential', 'pro') AND s.status = 'active' THEN TRUE
    ELSE FALSE
  END AS can_connect_banks,

  CASE
    WHEN (s.status = 'trialing' AND s.trial_end > NOW()) THEN 10000  -- Trial gets Pro limits
    WHEN s.plan = 'free' AND s.status = 'active' THEN 25
    WHEN s.plan IN ('essential', 'pro') AND s.status = 'active' THEN 10000
    ELSE 0
  END AS chat_message_limit,

  CASE
    WHEN (s.status = 'trialing' AND s.trial_end > NOW()) THEN NULL  -- Trial gets unlimited
    WHEN s.plan = 'free' THEN 30 -- Last 30 days only
    ELSE NULL -- No limit (NULL = unlimited)
  END AS transaction_days_limit,

  CASE
    WHEN (s.status = 'trialing' AND s.trial_end > NOW()) THEN TRUE  -- Trial gets export
    WHEN s.plan = 'pro' AND s.status = 'active' THEN TRUE
    ELSE FALSE
  END AS can_export,

  CASE
    WHEN (s.status = 'trialing' AND s.trial_end > NOW()) THEN TRUE  -- Trial gets insights
    WHEN s.plan = 'pro' AND s.status = 'active' THEN TRUE
    ELSE FALSE
  END AS has_advanced_insights,

  CASE
    WHEN (s.status = 'trialing' AND s.trial_end > NOW()) THEN TRUE  -- Trial gets priority support
    WHEN s.plan = 'pro' AND s.status = 'active' THEN TRUE
    ELSE FALSE
  END AS has_priority_support,

  s.trial_start,
  s.trial_end,
  s.current_period_end,
  s.cancel_at_period_end
FROM
  public.subscriptions s;

-- Grant access to view
GRANT SELECT ON public.user_entitlements TO authenticated, anon;

-- RLS for view
ALTER VIEW public.user_entitlements SET (security_barrier = true);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.check_and_expire_trials IS 'Checks for expired trials and downgrades them to free plan';
COMMENT ON FUNCTION public.get_trial_status IS 'Returns detailed trial status for a user including days remaining';
