-- Migration: Auto-award XP on transactions
-- Description: Triggers to automatically award XP when transactions are created

-- Function to award XP when a transaction is created
CREATE OR REPLACE FUNCTION public.auto_award_transaction_xp()
RETURNS TRIGGER AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Award XP for creating a transaction (2 XP as per XP_REWARDS table)
    v_result := public.process_gamification_event(
        NEW.user_id,
        'transaction_created',
        jsonb_build_object(
            'action_id', NEW.id::TEXT,
            'xp_override', 2,
            'transaction_amount', NEW.amount,
            'category_id', NEW.category_id
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to all 12 monthly transaction tables
DO $$
DECLARE
    month_suffix TEXT;
    months TEXT[] := ARRAY['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
BEGIN
    FOREACH month_suffix IN ARRAY months LOOP
        -- Drop existing trigger if any
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_auto_award_xp ON public.monthly_transactions_%s', month_suffix);
        
        -- Create trigger
        EXECUTE format(
            'CREATE TRIGGER trigger_auto_award_xp 
            AFTER INSERT ON public.monthly_transactions_%s 
            FOR EACH ROW 
            EXECUTE FUNCTION public.auto_award_transaction_xp()',
            month_suffix
        );
    END LOOP;
END $$;

-- Also award XP for bank connections (if not already done)
CREATE OR REPLACE FUNCTION public.auto_award_bank_connection_xp()
RETURNS TRIGGER AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Award XP for connecting a bank (50 XP as per XP_REWARDS table)
    v_result := public.process_gamification_event(
        NEW.user_id,
        'bank_connected',
        jsonb_build_object(
            'action_id', NEW.id::TEXT,
            'xp_override', 50,
            'institution_name', NEW.institution_name
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to connected_accounts table (if it exists)
DROP TRIGGER IF EXISTS trigger_auto_award_bank_xp ON public.connected_accounts;
CREATE TRIGGER trigger_auto_award_bank_xp
    AFTER INSERT ON public.connected_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_award_bank_connection_xp();

-- Award XP for creating financial goals
CREATE OR REPLACE FUNCTION public.auto_award_goal_xp()
RETURNS TRIGGER AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Award XP for creating a goal (25 XP as per XP_REWARDS table)
    v_result := public.process_gamification_event(
        NEW.user_id,
        'goal_created',
        jsonb_build_object(
            'action_id', NEW.id::TEXT,
            'xp_override', 25,
            'goal_type', NEW.goal_type,
            'target_amount', NEW.target_amount
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_award_goal_xp ON public.financial_goals;
CREATE TRIGGER trigger_auto_award_goal_xp
    AFTER INSERT ON public.financial_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_award_goal_xp();

-- Award XP for completing financial goals
CREATE OR REPLACE FUNCTION public.auto_award_goal_completion_xp()
RETURNS TRIGGER AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Only award if goal just became completed
    IF NEW.is_completed = TRUE AND (OLD.is_completed IS NULL OR OLD.is_completed = FALSE) THEN
        v_result := public.process_gamification_event(
            NEW.user_id,
            'goal_completed',
            jsonb_build_object(
                'action_id', NEW.id::TEXT || '_completed',
                'xp_override', 100,
                'goal_type', NEW.goal_type,
                'target_amount', NEW.target_amount
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_award_goal_completion_xp ON public.financial_goals;
CREATE TRIGGER trigger_auto_award_goal_completion_xp
    AFTER UPDATE ON public.financial_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_award_goal_completion_xp();

-- Migration completed
-- Auto-award XP triggers for transactions, bank connections, and goals
