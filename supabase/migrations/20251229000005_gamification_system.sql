-- Migration: Gamification System
-- Description: Core tables for XP, Levels, Badges, Challenges, and Leagues

-- 1. Create XP Ledger
-- Immutable log of all XP earned.
CREATE TABLE IF NOT EXISTS public.xp_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    action_type VARCHAR(100) NOT NULL, -- e.g., 'transaction_created', 'bank_connected'
    action_id VARCHAR(255), -- Reference ID (e.g., transaction UUID) for idempotency
    metadata JSONB DEFAULT '{}', -- Extra context
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup/sums
CREATE INDEX idx_xp_ledger_user_date ON public.xp_ledger (user_id, created_at);
CREATE INDEX idx_xp_ledger_action ON public.xp_ledger (action_type, action_id);

-- 2. Create User Gamification Profile (Denormalized)
-- Fast access to current level, total XP, streak.
CREATE TABLE IF NOT EXISTS public.user_gamification (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    streak_freeze_count INTEGER DEFAULT 0,
    last_active_date DATE, -- For streak calculation
    monthly_xp INTEGER DEFAULT 0, -- Reset monthly for leagues
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Badges Catalog
CREATE TABLE IF NOT EXISTS public.badges (
    id VARCHAR(100) PRIMARY KEY, -- Slug e.g., 'first_transaction'
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    tier VARCHAR(50) DEFAULT 'COMMON', -- COMMON, RARE, EPIC, LEGENDARY
    category VARCHAR(50) DEFAULT 'GENERAL', -- TRANSACTIONS, SAVINGS, SOCIAL, etc.
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create User Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id VARCHAR(100) NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}', -- e.g., "rank: 1"
    UNIQUE(user_id, badge_id)
);

-- 5. Create Challenges
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL, -- internal ref e.g. 'daily_log_3_tx'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 10,
    type VARCHAR(20) NOT NULL CHECK (type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'Onetime')),
    goal_target INTEGER DEFAULT 1, -- e.g. "3" transactions
    goal_metric VARCHAR(50), -- e.g. "transaction_count"
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create User Challenges (Assignments)
CREATE TABLE IF NOT EXISTS public.user_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'EXPIRED', 'SKIPPED')),
    progress INTEGER DEFAULT 0,
    target INTEGER NOT NULL,
    reward_claimed BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_challenges_user_status ON public.user_challenges (user_id, status);

-- 7. League History (Snapshots)
CREATE TABLE IF NOT EXISTS public.league_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_key VARCHAR(20) NOT NULL, -- e.g., '2025-12'
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp INTEGER NOT NULL,
    rank_position INTEGER,
    league_tier VARCHAR(50) DEFAULT 'BRONZE', -- BRONZE, SILVER, GOLD, DIAMOND, etc. (future proofing)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(period_key, user_id)
);

-- 8. Enable Row Level Security (RLS)

ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_snapshots ENABLE ROW LEVEL SECURITY;

-- users can read their own xp ledger
CREATE POLICY "Users can read own xp ledger" ON public.xp_ledger
    FOR SELECT USING (auth.uid() = user_id);

-- users can read their own gamification profile
CREATE POLICY "Users can read own gamification profile" ON public.user_gamification
    FOR SELECT USING (auth.uid() = user_id);

-- public read for badges catalog
CREATE POLICY "Anyone can read badges" ON public.badges
    FOR SELECT USING (true);

-- users can read their own badges
CREATE POLICY "Users can read own badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);

-- public read for active challenges definitions
CREATE POLICY "Anyone can read active challenges" ON public.challenges
    FOR SELECT USING (is_active = true);

-- users can read/update their own challenge assignments
CREATE POLICY "Users can read own challenges" ON public.user_challenges
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can update own challenges" ON public.user_challenges
    FOR UPDATE USING (auth.uid() = user_id);

-- League snapshots: users can read all (for leaderboards) or just theirs?
-- Usually leaderboards are public or semi-public. Let's allow authenticated users to read.
CREATE POLICY "Authenticated users can read league snapshots" ON public.league_snapshots
    FOR SELECT USING (auth.role() = 'authenticated');


-- 9. Triggers for updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TRIGGER handle_updated_at_user_gamification
    BEFORE UPDATE ON public.user_gamification
    FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

CREATE TRIGGER handle_updated_at_user_challenges
    BEFORE UPDATE ON public.user_challenges
    FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);


-- 10. Initial Data: Badges
INSERT INTO public.badges (id, name, description, tier, category, icon_url) VALUES
('first_tx', 'First Steps', 'Create your first transaction.', 'COMMON', 'TRANSACTIONS', '🌱'),
('tx_100', 'Centurion', 'Log 100 transactions.', 'RARE', 'TRANSACTIONS', '💯'),
('bank_connect_1', 'Connected', 'Connect your first bank account.', 'RARE', 'BANKING', '🔗'),
('chat_money_checkup', 'Money Talk', 'Complete a money check-in conversation.', 'COMMON', 'CHAT', '💬'),
('streak_7', 'On Fire', 'Maintain a 7-day streak.', 'RARE', 'STREAK', '🔥'),
('streak_30', 'Unstoppable', 'Maintain a 30-day streak.', 'EPIC', 'STREAK', '🔥🔥'),
('saver_pro', 'Nest Egg', 'Create a savings goal.', 'COMMON', 'GOALS', 'piggy_bank')
ON CONFLICT (id) DO NOTHING;

-- 11. Helper Function: Initialize Gamification Profile
-- Automatically create a profile when a new user is created (or on first access if missing)
CREATE OR REPLACE FUNCTION public.ensure_gamification_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_gamification (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hook into auth.users creation (if possible/desired)
-- Alternatively, the app calls this, or we rely on a lazy creation pattern.
-- For Supabase, usually trigger on auth.users
-- drop trigger if exists on auth.users first if re-running
DROP TRIGGER IF EXISTS on_auth_user_created_gamification ON auth.users;
CREATE TRIGGER on_auth_user_created_gamification
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.ensure_gamification_profile();

