-- Migration: Create Subscription and Billing System
-- Created: 2025-12-29

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE subscription_plan AS ENUM ('free', 'essential', 'pro');
CREATE TYPE subscription_status AS ENUM (
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid'
);
CREATE TYPE billing_interval AS ENUM ('month', 'year');

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Subscription details
  plan subscription_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  billing_interval billing_interval DEFAULT 'month',

  -- Stripe integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Billing cycle
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,

  -- Trial
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Billing details
  billing_email TEXT,
  billing_country TEXT,
  vat_id TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT one_subscription_per_user UNIQUE (user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_status ON public.subscriptions(plan, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON public.subscriptions(current_period_end);

-- RLS Policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- USAGE METERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.usage_meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Usage tracking
  metric_name TEXT NOT NULL, -- e.g., 'chat_messages', 'api_calls'
  count INTEGER NOT NULL DEFAULT 0,
  limit_value INTEGER, -- NULL = unlimited

  -- Period tracking (monthly reset)
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  reset_at TIMESTAMPTZ NOT NULL, -- Next reset date

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_metric_period UNIQUE (user_id, metric_name, period_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usage_meters_user_metric ON public.usage_meters(user_id, metric_name);
CREATE INDEX IF NOT EXISTS idx_usage_meters_reset_at ON public.usage_meters(reset_at);
CREATE INDEX IF NOT EXISTS idx_usage_meters_period ON public.usage_meters(period_start, period_end);

-- RLS Policies
ALTER TABLE public.usage_meters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_meters;
CREATE POLICY "Users can view own usage" ON public.usage_meters
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- BILLING EVENTS LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL, -- e.g., 'subscription.created', 'payment.succeeded'
  event_provider TEXT NOT NULL DEFAULT 'stripe', -- 'stripe', 'gocardless'
  event_id TEXT, -- Provider's event ID (for idempotency)

  -- Data (sanitized, no PII)
  event_data JSONB DEFAULT '{}'::jsonb,

  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_provider_event UNIQUE (event_provider, event_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_billing_events_user ON public.billing_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_subscription ON public.billing_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_type ON public.billing_events(event_type);
CREATE INDEX IF NOT EXISTS idx_billing_events_processed ON public.billing_events(processed, created_at);
CREATE INDEX IF NOT EXISTS idx_billing_events_provider_id ON public.billing_events(event_provider, event_id);

-- RLS Policies
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access billing events
DROP POLICY IF EXISTS "Service role only" ON public.billing_events;
CREATE POLICY "Service role only" ON public.billing_events
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- FEATURE ENTITLEMENTS (View)
-- ============================================================================

-- Create a view that computes user entitlements based on their subscription
CREATE OR REPLACE VIEW public.user_entitlements AS
SELECT
  s.user_id,
  s.plan,
  s.status,

  -- Feature flags (computed from plan)
  CASE
    WHEN s.plan IN ('essential', 'pro') AND s.status IN ('active', 'trialing') THEN TRUE
    ELSE FALSE
  END AS can_connect_banks,

  CASE
    WHEN s.plan = 'free' AND s.status IN ('active', 'trialing') THEN 25
    WHEN s.plan IN ('essential', 'pro') AND s.status IN ('active', 'trialing') THEN 10000 -- Fair use limit
    ELSE 0
  END AS chat_message_limit,

  CASE
    WHEN s.plan = 'free' THEN 30 -- Last 30 days only
    ELSE NULL -- No limit (NULL = unlimited)
  END AS transaction_days_limit,

  CASE
    WHEN s.plan = 'pro' AND s.status IN ('active', 'trialing') THEN TRUE
    ELSE FALSE
  END AS can_export,

  CASE
    WHEN s.plan = 'pro' AND s.status IN ('active', 'trialing') THEN TRUE
    ELSE FALSE
  END AS has_advanced_insights,

  CASE
    WHEN s.plan = 'pro' AND s.status IN ('active', 'trialing') THEN TRUE
    ELSE FALSE
  END AS has_priority_support,

  s.current_period_end,
  s.cancel_at_period_end
FROM
  public.subscriptions s;

-- Grant access to view
GRANT SELECT ON public.user_entitlements TO authenticated, anon;

-- RLS for view
ALTER VIEW public.user_entitlements SET (security_barrier = true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to auto-create free subscription for new users
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (
    user_id,
    plan,
    status,
    current_period_start,
    current_period_end
  ) VALUES (
    NEW.id,
    'free',
    'active',
    NOW(),
    NOW() + INTERVAL '1000 years' -- Free plan never expires
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create free subscription on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_subscription();

-- Function to increment usage meter
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_user_id UUID,
  p_metric_name TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
  v_current_period_start TIMESTAMPTZ;
  v_current_period_end TIMESTAMPTZ;
  v_reset_at TIMESTAMPTZ;
  v_meter RECORD;
  v_result JSONB;
BEGIN
  -- Calculate current billing period (monthly)
  v_current_period_start := DATE_TRUNC('month', NOW());
  v_current_period_end := v_current_period_start + INTERVAL '1 month';
  v_reset_at := v_current_period_end;

  -- Get or create usage meter for current period
  INSERT INTO public.usage_meters (
    user_id,
    metric_name,
    count,
    period_start,
    period_end,
    reset_at
  ) VALUES (
    p_user_id,
    p_metric_name,
    p_increment,
    v_current_period_start,
    v_current_period_end,
    v_reset_at
  )
  ON CONFLICT (user_id, metric_name, period_start)
  DO UPDATE SET
    count = usage_meters.count + p_increment,
    updated_at = NOW()
  RETURNING * INTO v_meter;

  -- Get user's limit from entitlements
  SELECT
    CASE
      WHEN p_metric_name = 'chat_messages' THEN chat_message_limit
      ELSE NULL
    END INTO v_result
  FROM public.user_entitlements
  WHERE user_id = p_user_id;

  -- Return current usage and limit
  RETURN jsonb_build_object(
    'count', v_meter.count,
    'limit', COALESCE((v_result), 'null'::jsonb),
    'period_start', v_meter.period_start,
    'period_end', v_meter.period_end,
    'reset_at', v_meter.reset_at,
    'has_exceeded', CASE
      WHEN v_result IS NOT NULL AND v_meter.count > (v_result::TEXT::INTEGER) THEN TRUE
      ELSE FALSE
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has exceeded usage
CREATE OR REPLACE FUNCTION public.check_usage_limit(
  p_user_id UUID,
  p_metric_name TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_current_period_start TIMESTAMPTZ;
  v_meter RECORD;
  v_limit INTEGER;
  v_result JSONB;
BEGIN
  v_current_period_start := DATE_TRUNC('month', NOW());

  -- Get current usage
  SELECT * INTO v_meter
  FROM public.usage_meters
  WHERE user_id = p_user_id
    AND metric_name = p_metric_name
    AND period_start = v_current_period_start;

  -- Get limit from entitlements
  SELECT
    CASE
      WHEN p_metric_name = 'chat_messages' THEN chat_message_limit
      ELSE NULL
    END INTO v_limit
  FROM public.user_entitlements
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'count', COALESCE(v_meter.count, 0),
    'limit', v_limit,
    'reset_at', COALESCE(v_meter.reset_at, v_current_period_start + INTERVAL '1 month'),
    'has_exceeded', CASE
      WHEN v_limit IS NOT NULL AND COALESCE(v_meter.count, 0) >= v_limit THEN TRUE
      ELSE FALSE
    END,
    'remaining', CASE
      WHEN v_limit IS NOT NULL THEN GREATEST(0, v_limit - COALESCE(v_meter.count, 0))
      ELSE NULL
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_meters_updated_at ON public.usage_meters;
CREATE TRIGGER update_usage_meters_updated_at
  BEFORE UPDATE ON public.usage_meters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.subscriptions IS 'User subscription plans and billing information';
COMMENT ON TABLE public.usage_meters IS 'Track feature usage (e.g., chat messages) with monthly resets';
COMMENT ON TABLE public.billing_events IS 'Audit log for all billing-related events from payment providers';
COMMENT ON VIEW public.user_entitlements IS 'Computed view of user feature entitlements based on subscription plan';
COMMENT ON FUNCTION public.increment_usage IS 'Increment a usage meter and return current count with limit check';
COMMENT ON FUNCTION public.check_usage_limit IS 'Check if user has exceeded usage limit for a metric';
