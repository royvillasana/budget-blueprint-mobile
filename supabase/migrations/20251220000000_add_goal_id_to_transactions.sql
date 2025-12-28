-- Migration to add goal_id to all 12 monthly transaction tables
-- and sync progress to financial_goals table

-- 1. Create the sync function
CREATE OR REPLACE FUNCTION public.sync_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_goal_id UUID;
    v_amount_diff DECIMAL(12, 2);
BEGIN
    -- Determine which goal_id and amount difference to use
    IF (TG_OP = 'INSERT') THEN
        v_goal_id := NEW.goal_id;
        v_amount_diff := ABS(NEW.amount);
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Handle goal_id change
        IF (OLD.goal_id IS NOT DISTINCT FROM NEW.goal_id) THEN
            v_goal_id := NEW.goal_id;
            v_amount_diff := ABS(NEW.amount) - ABS(OLD.amount);
        ELSE
            -- Goal changed: subtract from old, add to new
            IF (OLD.goal_id IS NOT NULL) THEN
                UPDATE public.financial_goals
                SET current_amount = current_amount - ABS(OLD.amount),
                    updated_at = NOW()
                WHERE id = OLD.goal_id;
            END IF;
            v_goal_id := NEW.goal_id;
            v_amount_diff := ABS(NEW.amount);
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        v_goal_id := OLD.goal_id;
        v_amount_diff := -ABS(OLD.amount);
    END IF;

    -- Update the goal if goal_id is present
    IF (v_goal_id IS NOT NULL) THEN
        UPDATE public.financial_goals
        SET 
            current_amount = current_amount + v_amount_diff,
            is_completed = (current_amount + v_amount_diff) >= target_amount,
            updated_at = NOW()
        WHERE id = v_goal_id;
    END IF;

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add goal_id and Trigger to each of the 12 tables
DO $$
DECLARE
    month_suffix TEXT;
    months TEXT[] := ARRAY['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
BEGIN
    FOREACH month_suffix IN ARRAY months LOOP
        -- Add goal_id column
        EXECUTE format('ALTER TABLE public.monthly_transactions_%s ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES public.financial_goals(id) ON DELETE SET NULL', month_suffix);
        
        -- Create index for faster lookups
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_monthly_transactions_%s_goal_id ON public.monthly_transactions_%s(goal_id)', month_suffix, month_suffix);

        -- Add trigger
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_sync_goal_progress ON public.monthly_transactions_%s', month_suffix);
        EXECUTE format('CREATE TRIGGER trigger_sync_goal_progress AFTER INSERT OR UPDATE OR DELETE ON public.monthly_transactions_%s FOR EACH ROW EXECUTE FUNCTION public.sync_goal_progress()', month_suffix);
    END LOOP;
END $$;
