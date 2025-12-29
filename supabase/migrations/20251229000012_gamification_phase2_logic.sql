-- Migration: Gamification Phase 2 Logic
-- Description: Automatic streak freeze usage and league divisions

-- ============================================
-- PART 1: AUTOMATIC STREAK FREEZE USAGE
-- ============================================

-- Function to use streak freeze if the user missed a day
CREATE OR REPLACE FUNCTION public.use_streak_freeze_if_needed()
RETURNS TRIGGER AS $$
DECLARE
    v_last_active DATE;
    v_today DATE := CURRENT_DATE;
BEGIN
    -- Only check if last_active_date is not null (has been active at least once)
    IF NEW.last_active_date IS NOT NULL THEN
        -- If the user was NOT active yesterday and NOT active today
        -- (Checking if NEW.last_active_date < v_today - 1)
        IF NEW.last_active_date < v_today - 1 THEN
            -- Check if they have freezes available
            IF NEW.streak_freeze_count > 0 THEN
                -- Reduce freeze count
                NEW.streak_freeze_count := NEW.streak_freeze_count - 1;
                
                -- Fake activity for yesterday to keep the streak alive
                NEW.last_active_date := v_today - 1;
                
                -- Log the event
                INSERT INTO public.xp_ledger (user_id, amount, action_type, metadata)
                VALUES (NEW.user_id, 0, 'streak_freeze_used', jsonb_build_object(
                    'remaining_freezes', NEW.streak_freeze_count,
                    'streak_preserved', NEW.current_streak
                ));
            ELSE
                -- No freezes left, streak is lost :(
                NEW.current_streak := 0;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check for streak freezes before updating last_active_date
-- Actually, streak is usually updated when activity happens.
-- We might need a "check" every time a user logs in or does something.

-- ============================================
-- PART 2: LEAGUE DIVISIONS
-- ============================================

-- Function to calculate division based on monthly XP
CREATE OR REPLACE FUNCTION public.calculate_league_division(p_monthly_xp INTEGER)
RETURNS VARCHAR(50) AS $$
BEGIN
    IF p_monthly_xp < 1000 THEN RETURN 'BRONZE';
    ELSIF p_monthly_xp < 2500 THEN RETURN 'SILVER';
    ELSIF p_monthly_xp < 5000 THEN RETURN 'GOLD';
    ELSIF p_monthly_xp < 10000 THEN RETURN 'PLATINUM';
    ELSE RETURN 'DIAMOND';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add avatar_url to user_settings if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_settings' AND column_name='avatar_url') THEN
        ALTER TABLE public.user_settings ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- View for league with divisions
CREATE OR REPLACE VIEW public.view_league_with_divisions AS
SELECT 
    ug.user_id,
    us.owner_name as display_name,
    us.avatar_url,
    ug.monthly_xp,
    public.calculate_league_division(ug.monthly_xp) as division,
    RANK() OVER (
        PARTITION BY public.calculate_league_division(ug.monthly_xp)
        ORDER BY ug.monthly_xp DESC
    ) as division_rank,
    RANK() OVER (ORDER BY ug.monthly_xp DESC) as global_rank
FROM public.user_gamification ug
JOIN public.user_settings us ON ug.user_id = us.user_id
WHERE ug.monthly_xp > 0;

-- ============================================
-- PART 3: 66-DAY CHALLENGE TRACKING
-- ============================================

-- Table for tracking the 66-day habit challenge
CREATE TABLE IF NOT EXISTS public.sixty_six_day_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_check_date DATE NOT NULL DEFAULT CURRENT_DATE,
    current_day INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, is_active)
);

-- Function to update 66-day challenge progress
CREATE OR REPLACE FUNCTION public.update_66_day_challenge()
RETURNS TRIGGER AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
BEGIN
    -- If activity is recorded
    IF NEW.last_active_date = v_today THEN
        -- Check if there is an active challenge
        UPDATE public.sixty_six_day_challenges
        SET 
            current_day = CASE 
                WHEN last_check_date = v_today - 1 THEN current_day + 1
                WHEN last_check_date = v_today THEN current_day -- Already counted
                ELSE 1 -- Streak broken, start over (unless we use freeze logic here too)
            END,
            last_check_date = v_today,
            is_completed = (CASE 
                WHEN last_check_date = v_today - 1 THEN current_day + 1
                ELSE 1
            END >= 66),
            updated_at = NOW()
        WHERE user_id = NEW.user_id AND is_active = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for 66-day challenge
CREATE TRIGGER trigger_update_66_challenge
    AFTER UPDATE OF last_active_date ON public.user_gamification
    FOR EACH ROW
    EXECUTE FUNCTION public.update_66_day_challenge();

-- Add XP when 66-day challenge is completed
CREATE OR REPLACE FUNCTION public.award_66_day_completion_xp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_completed = TRUE AND OLD.is_completed = FALSE THEN
        -- Award 500 XP
        PERFORM public.process_gamification_event(NEW.user_id, 'challenge_completed', jsonb_build_object(
            'challenge_id', NEW.id,
            'challenge_type', '66_day_habit',
            'xp_reward', 500
        ));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_award_66_xp
    AFTER UPDATE OF is_completed ON public.sixty_six_day_challenges
    FOR EACH ROW
    EXECUTE FUNCTION public.award_66_day_completion_xp();


-- ============================================
-- PART 4: MONTHLY RESET & SNAPSHOTS
-- ============================================

-- Table for league history snapshots
CREATE TABLE IF NOT EXISTS public.league_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_key VARCHAR(10) NOT NULL, -- e.g. '2024-01'
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp INTEGER NOT NULL,
    rank_position INTEGER NOT NULL,
    league_tier VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to reset monthly XP and save snapshots
-- To be called at the end of each month
CREATE OR REPLACE FUNCTION public.reset_monthly_league()
RETURNS VOID AS $$
DECLARE
    v_period VARCHAR(10) := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
BEGIN
    -- 1. Save results to snapshots
    INSERT INTO public.league_snapshots (period_key, user_id, total_xp, rank_position, league_tier)
    SELECT 
        v_period,
        user_id,
        monthly_xp,
        RANK() OVER (ORDER BY monthly_xp DESC),
        public.calculate_league_division(monthly_xp)
    FROM public.user_gamification
    WHERE monthly_xp > 0;

    -- 2. Award badges for league performance (Top 3, Champion, etc.)
    -- Champion
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT user_id, 'league_champion'
    FROM public.user_gamification
    WHERE monthly_xp > 0
    ORDER BY monthly_xp DESC
    LIMIT 1
    ON CONFLICT DO NOTHING;

    -- Top 3 (excluding champion handled above but on conflict covers it)
    INSERT INTO public.user_badges (user_id, badge_id)
    SELECT user_id, 'league_top_3'
    FROM (
        SELECT user_id FROM public.user_gamification 
        WHERE monthly_xp > 0 
        ORDER BY monthly_xp DESC LIMIT 3
    ) sub
    ON CONFLICT DO NOTHING;

    -- 3. Reset monthly_xp for all users
    UPDATE public.user_gamification
    SET monthly_xp = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
