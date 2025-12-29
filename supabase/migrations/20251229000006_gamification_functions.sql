-- Migration: Gamification Functions
-- Description: PL/pgSQL functions for XP, Levels, and Streaks logic.

-- 1. Level Calculation Formula
-- Formula: Level = sqrt(XP / 100). Or conversely XP = 100 * Level^2
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Avoid division by zero or negative
    IF xp < 0 THEN RETURN 0; END IF;
    -- Inverse of XP = 100 * Level^2  => Level = sqrt(XP / 100)
    RETURN FLOOR(SQRT(xp::NUMERIC / 100.0))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Award XP Function (Core Logic)
-- Handles logging, capping, and updating totals.
CREATE OR REPLACE FUNCTION public.award_xp(
    p_user_id UUID,
    p_amount INTEGER,
    p_action_type VARCHAR,
    p_action_id VARCHAR DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    v_daily_cap INTEGER := 1000; -- Default daily cap
    v_today_xp INTEGER;
    v_capped_amount INTEGER;
    v_new_total INTEGER;
    v_old_level INTEGER;
    v_new_level INTEGER;
    v_is_leveled_up BOOLEAN := FALSE;
BEGIN
    -- 1. Anti-Abuse: Check Daily Cap for specific high-volume actions
    -- (You might customize caps per action_type in a real lookup table)
    IF p_action_type IN ('transaction_manual', 'transaction_import') THEN
         SELECT COALESCE(SUM(amount), 0)::INTEGER
         INTO v_today_xp
         FROM public.xp_ledger
         WHERE user_id = p_user_id
           AND action_type = p_action_type
           AND created_at > CURRENT_DATE;

         IF v_today_xp >= 200 THEN -- Specific cap for transactions
            RETURN jsonb_build_object('success', false, 'reason', 'daily_cap_reached');
         END IF;
    END IF;

    -- 2. Idempotency Check (if p_action_id provided)
    IF p_action_id IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM public.xp_ledger WHERE action_id = p_action_id AND action_type = p_action_type) THEN
             RETURN jsonb_build_object('success', false, 'reason', 'duplicate_event');
        END IF;
    END IF;

    -- 3. Insert Ledger Entry
    INSERT INTO public.xp_ledger (user_id, amount, action_type, action_id, metadata)
    VALUES (p_user_id, p_amount, p_action_type, p_action_id, p_metadata);

    -- 4. Update Profile & Check Level Up
    SELECT total_xp, current_level INTO v_new_total, v_old_level
    FROM public.user_gamification
    WHERE user_id = p_user_id;

    -- Update total
    UPDATE public.user_gamification
    SET total_xp = total_xp + p_amount,
        monthly_xp = monthly_xp + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING total_xp INTO v_new_total;

    -- Calculate new level
    v_new_level := public.calculate_level(v_new_total);

    IF v_new_level > v_old_level THEN
        UPDATE public.user_gamification
        SET current_level = v_new_level
        WHERE user_id = p_user_id;
        v_is_leveled_up := TRUE;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'awarded_xp', p_amount,
        'new_total_xp', v_new_total,
        'level_up', v_is_leveled_up,
        'new_level', v_new_level
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Streak Processing Logic
-- Should be called on "daily active" events.
CREATE OR REPLACE FUNCTION public.process_streak_activity(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_last_active DATE;
    v_streak INTEGER;
    v_freeze INTEGER;
    v_today DATE := CURRENT_DATE;
BEGIN
    SELECT last_active_date, current_streak, streak_freeze_count
    INTO v_last_active, v_streak, v_freeze
    FROM public.user_gamification
    WHERE user_id = p_user_id;

    -- Case 1: Already active today
    IF v_last_active = v_today THEN
        RETURN; -- Nothing to do
    END IF;

    -- Case 2: Active yesterday -> Increment Streak
    IF v_last_active = v_today - 1 THEN
        UPDATE public.user_gamification
        SET current_streak = current_streak + 1,
            last_active_date = v_today,
            longest_streak = GREATEST(longest_streak, current_streak + 1)
        WHERE user_id = p_user_id;
        
        -- Grant freeze every 7 days (simplified logic)
        IF (v_streak + 1) % 7 = 0 THEN
             UPDATE public.user_gamification
             SET streak_freeze_count = LEAST(streak_freeze_count + 1, 3) -- Max 3
             WHERE user_id = p_user_id;
        END IF;

    -- Case 3: Missed days
    ELSE
        -- Can we use a freeze?
        IF v_last_active = v_today - 2 AND v_freeze > 0 THEN
             -- "Used a freeze yesterday" conceptually
             -- Actually, we usually apply the freeze on the MISSED day job.
             -- But if user comes back 2 days later, we can auto-consume retroactively if logic allows.
             -- For now, let's keep it simple: strict reset if > 1 day gap
             -- UNLESS we implement a nightly job that consumes freezes.
             -- Let's do the "lazy" freeze consumption here for simplicity:
             IF v_freeze > 0 THEN
                 -- Used 1 freeze to cover the gap
                 UPDATE public.user_gamification
                 SET streak_freeze_count = streak_freeze_count - 1,
                     current_streak = current_streak + 1, -- Keep building? or just maintain? Usually maintain.
                     -- Duolingo maintains.
                     last_active_date = v_today
                 WHERE user_id = p_user_id;
             ELSE
                 -- Streak broken
                 UPDATE public.user_gamification
                 SET current_streak = 1,
                     last_active_date = v_today
                 WHERE user_id = p_user_id;
             END IF;
        ELSE
            -- Streak broken (gap too large or no freezes)
             UPDATE public.user_gamification
             SET current_streak = 1,
                 last_active_date = v_today
             WHERE user_id = p_user_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Main Event Processor (Facade)
CREATE OR REPLACE FUNCTION public.process_gamification_event(
    p_user_id UUID,
    p_event_type VARCHAR,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
    v_xp_amount INTEGER := 0;
    v_result JSONB;
BEGIN
    -- A. Determine XP based on event type
    -- (Hardcoded rules for now, could be DB table lookup)
    CASE p_event_type
        WHEN 'transaction_created' THEN v_xp_amount := 10;
        WHEN 'bank_connected'      THEN v_xp_amount := 100;
        WHEN 'chat_turn'           THEN v_xp_amount := 5;
        WHEN 'goal_created'        THEN v_xp_amount := 20;
        WHEN 'daily_checkin'       THEN v_xp_amount := 10;
        ELSE v_xp_amount := 0;
    END CASE;

    -- Override amount if provided in metadata (trusted sources only? be careful)
    IF p_metadata ? 'xp_override' THEN
        v_xp_amount := (p_metadata->>'xp_override')::INTEGER;
    END IF;

    -- B. Process Streak if it's a "meaningful" action
    -- (e.g., logging in, transaction, chat)
    IF p_event_type IN ('transaction_created', 'chat_turn', 'daily_checkin') THEN
        PERFORM public.process_streak_activity(p_user_id);
    END IF;

    -- C. Award XP
    IF v_xp_amount > 0 THEN
        v_result := public.award_xp(p_user_id, v_xp_amount, p_event_type, p_metadata->>'action_id', p_metadata);
    ELSE
        v_result := jsonb_build_object('success', true, 'awarded_xp', 0);
    END IF;

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

