-- =====================================================
-- MESSAGE CREDITS SYSTEM MIGRATION
-- =====================================================
-- This migration implements a credit-based rewards system for AI chat messages
-- Users earn credits through XP conversion, daily check-ins, challenges, and referrals
-- Credits are consumed before subscription limits (hybrid system)

-- =====================================================
-- 1. MESSAGE CREDITS LEDGER (Immutable Transaction Log)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.message_credits_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positive = earned, Negative = spent
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('earned', 'spent')),
  source VARCHAR(100) NOT NULL, -- 'xp_conversion', 'daily_checkin', 'challenge_completion', 'referral_reward'
  source_id VARCHAR(255) NOT NULL, -- For idempotency (e.g., 'xp_milestone_100', 'checkin_2025-01-08')
  metadata JSONB DEFAULT '{}'::jsonb,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0), -- Snapshot of balance after this transaction
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate transactions
  CONSTRAINT unique_credit_transaction UNIQUE (user_id, source, source_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credits_ledger_user_created ON public.message_credits_ledger(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credits_ledger_source ON public.message_credits_ledger(source);
CREATE INDEX IF NOT EXISTS idx_credits_ledger_type ON public.message_credits_ledger(transaction_type);

-- Enable RLS
ALTER TABLE public.message_credits_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own transactions
CREATE POLICY "Users can view own credit transactions"
  ON public.message_credits_ledger
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert credit transactions"
  ON public.message_credits_ledger
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 2. USER MESSAGE CREDITS (Denormalized Balance Cache)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_message_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_credits INTEGER NOT NULL DEFAULT 0 CHECK (total_credits >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  total_spent INTEGER NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  xp_converted_total INTEGER NOT NULL DEFAULT 0, -- Total XP that has been converted to credits
  last_xp_conversion_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast balance lookups
CREATE INDEX IF NOT EXISTS idx_user_credits_balance ON public.user_message_credits(user_id, total_credits);

-- Enable RLS
ALTER TABLE public.user_message_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own credit balance"
  ON public.user_message_credits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credit balance"
  ON public.user_message_credits
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit balance"
  ON public.user_message_credits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 3. DAILY CHECKINS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  consecutive_days INTEGER NOT NULL DEFAULT 1,
  credits_awarded INTEGER NOT NULL DEFAULT 1,
  xp_awarded INTEGER NOT NULL DEFAULT 10,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One check-in per day per user
  CONSTRAINT unique_daily_checkin UNIQUE (user_id, checkin_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON public.daily_checkins(user_id, checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON public.daily_checkins(checkin_date);

-- Enable RLS
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own checkins"
  ON public.daily_checkins
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
  ON public.daily_checkins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. REFERRALS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referee_email TEXT,
  referral_code VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  referrer_credits_awarded INTEGER DEFAULT 0,
  referee_credits_awarded INTEGER DEFAULT 0,
  reward_claimed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON public.referrals(referee_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own referrals"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referrer_user_id OR auth.uid() = referee_user_id);

CREATE POLICY "Users can insert referrals"
  ON public.referrals
  FOR INSERT
  WITH CHECK (auth.uid() = referrer_user_id);

CREATE POLICY "Users can update own referrals"
  ON public.referrals
  FOR UPDATE
  USING (auth.uid() = referrer_user_id OR auth.uid() = referee_user_id);

-- =====================================================
-- 5. USER REFERRAL STATS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_referral_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(50) NOT NULL UNIQUE,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  successful_referrals INTEGER NOT NULL DEFAULT 0,
  total_credits_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_referral_stats_code ON public.user_referral_stats(referral_code);

-- Enable RLS
ALTER TABLE public.user_referral_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own referral stats"
  ON public.user_referral_stats
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral stats"
  ON public.user_referral_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referral stats"
  ON public.user_referral_stats
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTION 1: AWARD MESSAGE CREDITS (Unified Entry Point)
-- =====================================================
CREATE OR REPLACE FUNCTION public.award_message_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_source VARCHAR,
  p_source_id VARCHAR,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_credits_record RECORD;
BEGIN
  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Get or create user credits record
  INSERT INTO public.user_message_credits (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current balance
  SELECT total_credits INTO v_current_balance
  FROM public.user_message_credits
  WHERE user_id = p_user_id;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;

  -- Insert transaction into ledger (idempotent via UNIQUE constraint)
  INSERT INTO public.message_credits_ledger (
    user_id,
    amount,
    transaction_type,
    source,
    source_id,
    metadata,
    balance_after
  )
  VALUES (
    p_user_id,
    p_amount,
    'earned',
    p_source,
    p_source_id,
    p_metadata,
    v_new_balance
  )
  ON CONFLICT (user_id, source, source_id) DO NOTHING
  RETURNING * INTO v_credits_record;

  -- If transaction was inserted (not a duplicate), update balance
  IF v_credits_record IS NOT NULL THEN
    UPDATE public.user_message_credits
    SET
      total_credits = v_new_balance,
      total_earned = total_earned + p_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
      'success', true,
      'credits_awarded', p_amount,
      'new_balance', v_new_balance,
      'transaction_id', v_credits_record.id
    );
  ELSE
    -- Transaction already exists (duplicate)
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Credits already awarded for this source',
      'new_balance', v_current_balance
    );
  END IF;
END;
$$;

-- =====================================================
-- FUNCTION 2: SPEND MESSAGE CREDITS
-- =====================================================
CREATE OR REPLACE FUNCTION public.spend_message_credits(
  p_user_id UUID,
  p_amount INTEGER DEFAULT 1,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Get current balance
  SELECT total_credits INTO v_current_balance
  FROM public.user_message_credits
  WHERE user_id = p_user_id;

  -- Check if user has enough credits
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient credits',
      'current_balance', COALESCE(v_current_balance, 0)
    );
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Insert transaction into ledger
  INSERT INTO public.message_credits_ledger (
    user_id,
    amount,
    transaction_type,
    source,
    source_id,
    metadata,
    balance_after
  )
  VALUES (
    p_user_id,
    -p_amount,
    'spent',
    'chat_message',
    'msg_' || gen_random_uuid()::text,
    p_metadata,
    v_new_balance
  )
  RETURNING id INTO v_transaction_id;

  -- Update balance
  UPDATE public.user_message_credits
  SET
    total_credits = v_new_balance,
    total_spent = total_spent + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'credits_spent', p_amount,
    'new_balance', v_new_balance,
    'transaction_id', v_transaction_id
  );
END;
$$;

-- =====================================================
-- FUNCTION 3: CONVERT XP TO CREDITS
-- =====================================================
CREATE OR REPLACE FUNCTION public.convert_xp_to_credits(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_xp INTEGER;
  v_xp_converted INTEGER;
  v_available_xp INTEGER;
  v_credits_to_award INTEGER;
  v_xp_to_convert INTEGER;
  v_result JSONB;
BEGIN
  -- Get user's XP data
  SELECT
    COALESCE(ug.total_xp, 0),
    COALESCE(umc.xp_converted_total, 0)
  INTO v_total_xp, v_xp_converted
  FROM public.user_gamification ug
  LEFT JOIN public.user_message_credits umc ON umc.user_id = ug.user_id
  WHERE ug.user_id = p_user_id;

  -- Calculate available XP (not yet converted)
  v_available_xp := v_total_xp - v_xp_converted;

  -- Calculate how many credits can be awarded (100 XP = 1 credit)
  v_credits_to_award := FLOOR(v_available_xp / 100);

  -- If no credits to award, return early
  IF v_credits_to_award <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Not enough XP to convert',
      'available_xp', v_available_xp,
      'credits_awarded', 0
    );
  END IF;

  -- Calculate exact XP to mark as converted
  v_xp_to_convert := v_credits_to_award * 100;

  -- Award credits using unified function
  v_result := public.award_message_credits(
    p_user_id,
    v_credits_to_award,
    'xp_conversion',
    'xp_milestone_' || (v_xp_converted + v_xp_to_convert)::text,
    jsonb_build_object(
      'xp_converted', v_xp_to_convert,
      'total_xp', v_total_xp,
      'conversion_rate', 100
    )
  );

  -- Update xp_converted_total if credits were awarded
  IF (v_result->>'success')::boolean THEN
    UPDATE public.user_message_credits
    SET
      xp_converted_total = xp_converted_total + v_xp_to_convert,
      last_xp_conversion_at = NOW(),
      updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
      'success', true,
      'credits_awarded', v_credits_to_award,
      'xp_converted', v_xp_to_convert,
      'remaining_xp', v_available_xp - v_xp_to_convert,
      'new_balance', v_result->'new_balance'
    );
  ELSE
    RETURN v_result;
  END IF;
END;
$$;

-- =====================================================
-- FUNCTION 4: PROCESS DAILY CHECKIN
-- =====================================================
CREATE OR REPLACE FUNCTION public.process_daily_checkin(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_checkin_date DATE;
  v_consecutive_days INTEGER := 1;
  v_credits_to_award INTEGER;
  v_xp_to_award INTEGER := 10;
  v_result JSONB;
  v_checkin_id UUID;
BEGIN
  -- Check if user already checked in today
  IF EXISTS (
    SELECT 1 FROM public.daily_checkins
    WHERE user_id = p_user_id AND checkin_date = CURRENT_DATE
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Already checked in today',
      'next_checkin', (CURRENT_DATE + INTERVAL '1 day')::date
    );
  END IF;

  -- Get last check-in date
  SELECT checkin_date, consecutive_days
  INTO v_last_checkin_date, v_consecutive_days
  FROM public.daily_checkins
  WHERE user_id = p_user_id
  ORDER BY checkin_date DESC
  LIMIT 1;

  -- Calculate consecutive days
  IF v_last_checkin_date IS NOT NULL THEN
    IF v_last_checkin_date = CURRENT_DATE - INTERVAL '1 day' THEN
      -- Consecutive day
      v_consecutive_days := v_consecutive_days + 1;
    ELSIF v_last_checkin_date < CURRENT_DATE - INTERVAL '1 day' THEN
      -- Streak broken
      v_consecutive_days := 1;
    END IF;
  END IF;

  -- Calculate credits: 1 base + 1 bonus every 7 days
  v_credits_to_award := 1 + FLOOR(v_consecutive_days / 7);

  -- Award XP bonus for streaks
  IF v_consecutive_days >= 7 THEN
    v_xp_to_award := v_xp_to_award + (5 * FLOOR(v_consecutive_days / 7));
  END IF;

  -- Insert check-in record
  INSERT INTO public.daily_checkins (
    user_id,
    checkin_date,
    consecutive_days,
    credits_awarded,
    xp_awarded,
    metadata
  )
  VALUES (
    p_user_id,
    CURRENT_DATE,
    v_consecutive_days,
    v_credits_to_award,
    v_xp_to_award,
    jsonb_build_object(
      'streak_bonus', FLOOR(v_consecutive_days / 7),
      'is_milestone', (v_consecutive_days % 7 = 0)
    )
  )
  RETURNING id INTO v_checkin_id;

  -- Award credits
  v_result := public.award_message_credits(
    p_user_id,
    v_credits_to_award,
    'daily_checkin',
    'checkin_' || CURRENT_DATE::text,
    jsonb_build_object(
      'consecutive_days', v_consecutive_days,
      'checkin_id', v_checkin_id
    )
  );

  -- Award XP via existing gamification system
  PERFORM public.award_xp(p_user_id, v_xp_to_award, 'daily_checkin', 'Daily check-in completed');

  RETURN jsonb_build_object(
    'success', true,
    'checkin_id', v_checkin_id,
    'credits_awarded', v_credits_to_award,
    'xp_awarded', v_xp_to_award,
    'consecutive_days', v_consecutive_days,
    'next_checkin', (CURRENT_DATE + INTERVAL '1 day')::date,
    'new_balance', v_result->'new_balance'
  );
END;
$$;

-- =====================================================
-- FUNCTION 5: CAN SEND MESSAGE (Check Credits + Subscription)
-- =====================================================
CREATE OR REPLACE FUNCTION public.can_send_message(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credits INTEGER;
  v_usage_check JSONB;
BEGIN
  -- Check credits first
  SELECT total_credits INTO v_credits
  FROM public.user_message_credits
  WHERE user_id = p_user_id;

  -- If user has credits, they can send
  IF v_credits IS NOT NULL AND v_credits > 0 THEN
    RETURN jsonb_build_object(
      'can_send', true,
      'payment_method', 'credits',
      'credits_available', v_credits
    );
  END IF;

  -- Otherwise, check subscription limit
  v_usage_check := public.check_usage_limit(p_user_id, 'chat_messages');

  IF (v_usage_check->>'has_exceeded')::boolean THEN
    RETURN jsonb_build_object(
      'can_send', false,
      'payment_method', 'subscription',
      'reason', 'limit_exceeded',
      'usage_count', v_usage_check->'count',
      'usage_limit', v_usage_check->'limit'
    );
  ELSE
    RETURN jsonb_build_object(
      'can_send', true,
      'payment_method', 'subscription',
      'usage_count', v_usage_check->'count',
      'usage_limit', v_usage_check->'limit',
      'remaining', v_usage_check->'remaining'
    );
  END IF;
END;
$$;

-- =====================================================
-- FUNCTION 6: PROCESS MESSAGE SEND (Hybrid Payment)
-- =====================================================
CREATE OR REPLACE FUNCTION public.process_message_send(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credits INTEGER;
  v_spend_result JSONB;
  v_usage_result JSONB;
BEGIN
  -- Check credits first
  SELECT total_credits INTO v_credits
  FROM public.user_message_credits
  WHERE user_id = p_user_id;

  -- If user has credits, spend them
  IF v_credits IS NOT NULL AND v_credits > 0 THEN
    v_spend_result := public.spend_message_credits(p_user_id, 1);

    RETURN jsonb_build_object(
      'success', true,
      'payment_method', 'credits',
      'credits_spent', 1,
      'credits_remaining', v_spend_result->'new_balance'
    );
  END IF;

  -- Otherwise, use subscription
  v_usage_result := public.increment_usage(p_user_id, 'chat_messages', 1);

  RETURN jsonb_build_object(
    'success', true,
    'payment_method', 'subscription',
    'usage_count', v_usage_result->'count',
    'usage_limit', v_usage_result->'limit',
    'has_exceeded', v_usage_result->'has_exceeded'
  );
END;
$$;

-- =====================================================
-- FUNCTION 7: GET REFERRAL STATS
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_referral_stats(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats RECORD;
BEGIN
  SELECT * INTO v_stats
  FROM public.user_referral_stats
  WHERE user_id = p_user_id;

  IF v_stats IS NULL THEN
    RETURN jsonb_build_object(
      'referral_code', NULL,
      'total_referrals', 0,
      'successful_referrals', 0,
      'total_credits_earned', 0
    );
  END IF;

  RETURN jsonb_build_object(
    'referral_code', v_stats.referral_code,
    'total_referrals', v_stats.total_referrals,
    'successful_referrals', v_stats.successful_referrals,
    'total_credits_earned', v_stats.total_credits_earned
  );
END;
$$;

-- =====================================================
-- FUNCTION 8: COMPLETE REFERRAL
-- =====================================================
CREATE OR REPLACE FUNCTION public.complete_referral(
  p_referral_code VARCHAR,
  p_referee_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral RECORD;
  v_referrer_result JSONB;
  v_referee_result JSONB;
BEGIN
  -- Get referral record
  SELECT * INTO v_referral
  FROM public.referrals
  WHERE referral_code = p_referral_code
    AND status = 'pending';

  IF v_referral IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Referral not found or already completed'
    );
  END IF;

  -- Update referral
  UPDATE public.referrals
  SET
    referee_user_id = p_referee_user_id,
    status = 'completed',
    referrer_credits_awarded = 5,
    referee_credits_awarded = 5,
    reward_claimed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_referral.id;

  -- Award 5 credits to referrer
  v_referrer_result := public.award_message_credits(
    v_referral.referrer_user_id,
    5,
    'referral_reward',
    'referral_' || v_referral.id::text,
    jsonb_build_object(
      'referral_id', v_referral.id,
      'referee_user_id', p_referee_user_id,
      'type', 'referrer'
    )
  );

  -- Award 5 credits to referee (welcome bonus)
  v_referee_result := public.award_message_credits(
    p_referee_user_id,
    5,
    'referral_reward',
    'referral_welcome_' || v_referral.id::text,
    jsonb_build_object(
      'referral_id', v_referral.id,
      'referrer_user_id', v_referral.referrer_user_id,
      'type', 'referee'
    )
  );

  -- Update referrer stats
  UPDATE public.user_referral_stats
  SET
    total_referrals = total_referrals + 1,
    successful_referrals = successful_referrals + 1,
    total_credits_earned = total_credits_earned + 5,
    updated_at = NOW()
  WHERE user_id = v_referral.referrer_user_id;

  -- Award XP to referrer
  PERFORM public.award_xp(v_referral.referrer_user_id, 100, 'referral_completed', 'Referral completed');

  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral.id,
    'referrer_credits', 5,
    'referee_credits', 5
  );
END;
$$;

-- =====================================================
-- TRIGGER 1: AUTO CONVERT XP TO CREDITS
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_auto_convert_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Only convert if total_xp increased
  IF NEW.total_xp > OLD.total_xp THEN
    v_result := public.convert_xp_to_credits(NEW.user_id);

    -- Log conversion (optional, for debugging)
    IF (v_result->>'success')::boolean THEN
      RAISE NOTICE 'Auto-converted XP to credits for user %: %', NEW.user_id, v_result;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_convert_xp_to_credits
AFTER UPDATE OF total_xp ON public.user_gamification
FOR EACH ROW
EXECUTE FUNCTION trigger_auto_convert_xp();

-- =====================================================
-- TRIGGER 2: AWARD CHALLENGE CREDITS
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_award_challenge_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credits_to_award INTEGER;
  v_challenge_type VARCHAR;
  v_result JSONB;
BEGIN
  -- Only award if status changed to COMPLETED
  IF NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED') THEN
    -- Get challenge type
    SELECT challenge_type INTO v_challenge_type
    FROM public.challenges
    WHERE id = NEW.challenge_id;

    -- Determine credits based on challenge type
    v_credits_to_award := CASE v_challenge_type
      WHEN 'DAILY' THEN 1
      WHEN 'WEEKLY' THEN 3
      WHEN 'MONTHLY' THEN 10
      WHEN 'SPECIAL' THEN 20  -- 66-day challenge
      ELSE 1
    END;

    -- Award credits
    v_result := public.award_message_credits(
      NEW.user_id,
      v_credits_to_award,
      'challenge_completion',
      'challenge_' || NEW.challenge_id::text,
      jsonb_build_object(
        'challenge_type', v_challenge_type,
        'challenge_id', NEW.challenge_id,
        'user_challenge_id', NEW.id
      )
    );

    RAISE NOTICE 'Awarded % credits for challenge completion: %', v_credits_to_award, v_result;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER award_challenge_credits
BEFORE UPDATE ON public.user_challenges
FOR EACH ROW
EXECUTE FUNCTION trigger_award_challenge_credits();

-- =====================================================
-- TRIGGER 3: CREATE USER REFERRAL CODE
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_create_user_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referral_code VARCHAR(50);
  v_user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = NEW.id;

  -- Generate unique referral code from email or user ID
  IF v_user_email IS NOT NULL THEN
    v_referral_code := UPPER(SUBSTRING(REPLACE(SPLIT_PART(v_user_email, '@', 1), '.', ''), 1, 8)) ||
                       SUBSTRING(MD5(NEW.id::text), 1, 4);
  ELSE
    v_referral_code := 'USER' || SUBSTRING(MD5(NEW.id::text), 1, 8);
  END IF;

  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.user_referral_stats WHERE referral_code = v_referral_code) LOOP
    v_referral_code := v_referral_code || SUBSTRING(MD5(random()::text), 1, 2);
  END LOOP;

  -- Create referral stats record
  INSERT INTO public.user_referral_stats (user_id, referral_code)
  VALUES (NEW.id, v_referral_code)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER create_user_referral_code
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION trigger_create_user_referral_code();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION public.award_message_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.spend_message_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.convert_xp_to_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_daily_checkin TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_send_message TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_message_send TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_referral_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_referral TO authenticated;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.message_credits_ledger IS 'Immutable transaction log for all credit operations';
COMMENT ON TABLE public.user_message_credits IS 'Denormalized cache of user credit balances for fast queries';
COMMENT ON TABLE public.daily_checkins IS 'Records daily check-ins with consecutive day tracking';
COMMENT ON TABLE public.referrals IS 'Tracks referral relationships and rewards';
COMMENT ON TABLE public.user_referral_stats IS 'Aggregated referral statistics per user';

COMMENT ON FUNCTION public.award_message_credits IS 'Unified function to award credits from any source with idempotency';
COMMENT ON FUNCTION public.spend_message_credits IS 'Spend credits for chat messages';
COMMENT ON FUNCTION public.convert_xp_to_credits IS 'Convert accumulated XP to message credits (100 XP = 1 credit)';
COMMENT ON FUNCTION public.process_daily_checkin IS 'Process daily check-in with streak bonuses';
COMMENT ON FUNCTION public.can_send_message IS 'Check if user can send message (credits or subscription)';
COMMENT ON FUNCTION public.process_message_send IS 'Process message send using hybrid credit/subscription system';
COMMENT ON FUNCTION public.get_referral_stats IS 'Get user referral statistics';
COMMENT ON FUNCTION public.complete_referral IS 'Complete a referral and award credits to both parties';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Run this migration with: supabase db push
-- Or: psql <connection-string> -f 20260108000001_message_credits_system.sql
