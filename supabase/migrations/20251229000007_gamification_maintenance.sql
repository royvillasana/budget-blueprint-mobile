-- Migration: Monthly Maintenance
-- Description: Function to rollover monthly leagues.

CREATE OR REPLACE FUNCTION public.process_monthly_league_rollover()
RETURNS VOID AS $$
DECLARE
    v_last_month_key VARCHAR;
    v_date DATE := CURRENT_DATE - INTERVAL '1 day'; -- Assume we run this on the 1st of new month
BEGIN
    v_last_month_key := TO_CHAR(v_date, 'YYYY-MM');

    -- 1. Snapshot all users who had activity this month
    INSERT INTO public.league_snapshots (period_key, user_id, total_xp, rank_position)
    SELECT 
        v_last_month_key,
        user_id,
        monthly_xp,
        RANK() OVER (ORDER BY monthly_xp DESC) as rank_pos
    FROM public.user_gamification
    WHERE monthly_xp > 0;

    -- 2. Reset monthly_xp for all users
    UPDATE public.user_gamification
    SET monthly_xp = 0;

    -- 3. (Optional) Archive or cleanup old data
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
