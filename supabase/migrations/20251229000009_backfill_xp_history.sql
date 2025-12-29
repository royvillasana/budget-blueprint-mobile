-- Migration: Backfill XP based on historical data for royvillasana@gmail.com
-- Timestamp: 20251229000009

DO $$
DECLARE
    target_email TEXT := 'royvillasana@gmail.com';
    target_user_id UUID;
    
    tx_count INTEGER := 0;
    goal_count INTEGER := 0;
    
    xp_from_tx INTEGER := 0;
    xp_from_goals INTEGER := 0;
    backfill_bonus INTEGER := 100;
    total_backfill_xp INTEGER := 0;
    
    current_total_xp INTEGER;
BEGIN
    -- 1. Get the user ID
    SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User % not found, skipping backfill.', target_email;
        RETURN;
    END IF;

    -- 2. Count Transactions across all monthly tables
    select count(*) into tx_count from (
        select id from public.monthly_transactions_jan where user_id = target_user_id
        union all select id from public.monthly_transactions_feb where user_id = target_user_id
        union all select id from public.monthly_transactions_mar where user_id = target_user_id
        union all select id from public.monthly_transactions_apr where user_id = target_user_id
        union all select id from public.monthly_transactions_may where user_id = target_user_id
        union all select id from public.monthly_transactions_jun where user_id = target_user_id
        union all select id from public.monthly_transactions_jul where user_id = target_user_id
        union all select id from public.monthly_transactions_aug where user_id = target_user_id
        union all select id from public.monthly_transactions_sep where user_id = target_user_id
        union all select id from public.monthly_transactions_oct where user_id = target_user_id
        union all select id from public.monthly_transactions_nov where user_id = target_user_id
        union all select id from public.monthly_transactions_dec where user_id = target_user_id
    ) as all_tx;

    -- 3. Count Goals
    SELECT count(*) INTO goal_count FROM public.financial_goals WHERE user_id = target_user_id;

    -- 4. Calculate XP
    xp_from_tx := tx_count * 10;
    xp_from_goals := goal_count * 50;
    total_backfill_xp := xp_from_tx + xp_from_goals + backfill_bonus;

    RAISE NOTICE 'Found % transactions and % goals. Adding % XP.', tx_count, goal_count, total_backfill_xp;

    -- 5. Insert Ledger Entry
    INSERT INTO public.xp_ledger (user_id, amount, action_type, metadata)
    VALUES (
        target_user_id, 
        total_backfill_xp, 
        'BONUS', 
        jsonb_build_object(
            'description', 'Historical Data Backfill: ' || tx_count || ' transactions, ' || goal_count || ' goals.',
            'tx_count', tx_count, 
            'goal_count', goal_count
        )
    );

    -- 6. Update User Profile
    UPDATE public.user_gamification
    SET 
        total_xp = total_xp + total_backfill_xp,
        -- Recalculate level: Level = Sqrt(TotalXP / 100)
        current_level = FLOOR(SQRT((total_xp + total_backfill_xp) / 100)),
        updated_at = NOW()
    WHERE user_id = target_user_id;
    
    -- 7. AWARD BADGES based on counts
    -- (using ON CONFLICT DO NOTHING to avoid duplicate key errors if already awarded)
    
    -- Badge: First Transaction (first_tx)
    IF tx_count >= 1 THEN
        INSERT INTO public.user_badges (user_id, badge_id, awarded_at)
        VALUES (target_user_id, 'first_tx', NOW())
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        RAISE NOTICE 'Awarded badge: first_tx';
    END IF;

    -- Badge: Centurion (tx_100)
    IF tx_count >= 100 THEN
        INSERT INTO public.user_badges (user_id, badge_id, awarded_at)
        VALUES (target_user_id, 'tx_100', NOW())
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        RAISE NOTICE 'Awarded badge: tx_100';
    END IF;

    -- Badge: Nest Egg (saver_pro) for creating a goal
    IF goal_count >= 1 THEN
        INSERT INTO public.user_badges (user_id, badge_id, awarded_at)
        VALUES (target_user_id, 'saver_pro', NOW())
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        RAISE NOTICE 'Awarded badge: saver_pro';
    END IF;

    RAISE NOTICE 'Backfill complete.';

END $$;
