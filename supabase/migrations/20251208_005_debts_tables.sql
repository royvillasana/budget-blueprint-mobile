-- Migration 5: Monthly Debts Tables
-- Creates 12 monthly debts tables with RLS policies

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- January Debts
CREATE TABLE IF NOT EXISTS public.monthly_debts_jan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
    interest DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ending_balance DECIMAL(12, 2) GENERATED ALWAYS AS (initial_balance + interest - payment) STORED,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_debts_jan_user_id ON public.monthly_debts_jan(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_jan_month_id ON public.monthly_debts_jan(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_jan_due_date ON public.monthly_debts_jan(due_date);

ALTER TABLE public.monthly_debts_jan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts records jan"
    ON public.monthly_debts_jan FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts records jan"
    ON public.monthly_debts_jan FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts records jan"
    ON public.monthly_debts_jan FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts records jan"
    ON public.monthly_debts_jan FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_debts_jan_updated_at
    BEFORE UPDATE ON public.monthly_debts_jan
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- February Debts
CREATE TABLE IF NOT EXISTS public.monthly_debts_feb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
    interest DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ending_balance DECIMAL(12, 2) GENERATED ALWAYS AS (initial_balance + interest - payment) STORED,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_debts_feb_user_id ON public.monthly_debts_feb(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_feb_month_id ON public.monthly_debts_feb(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_feb_due_date ON public.monthly_debts_feb(due_date);

ALTER TABLE public.monthly_debts_feb ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts records feb"
    ON public.monthly_debts_feb FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts records feb"
    ON public.monthly_debts_feb FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts records feb"
    ON public.monthly_debts_feb FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts records feb"
    ON public.monthly_debts_feb FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_debts_feb_updated_at
    BEFORE UPDATE ON public.monthly_debts_feb
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- March Debts
CREATE TABLE IF NOT EXISTS public.monthly_debts_mar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
    interest DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ending_balance DECIMAL(12, 2) GENERATED ALWAYS AS (initial_balance + interest - payment) STORED,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_debts_mar_user_id ON public.monthly_debts_mar(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_mar_month_id ON public.monthly_debts_mar(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_mar_due_date ON public.monthly_debts_mar(due_date);

ALTER TABLE public.monthly_debts_mar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts records mar"
    ON public.monthly_debts_mar FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts records mar"
    ON public.monthly_debts_mar FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts records mar"
    ON public.monthly_debts_mar FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts records mar"
    ON public.monthly_debts_mar FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_debts_mar_updated_at
    BEFORE UPDATE ON public.monthly_debts_mar
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- April Debts
CREATE TABLE IF NOT EXISTS public.monthly_debts_apr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
    interest DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ending_balance DECIMAL(12, 2) GENERATED ALWAYS AS (initial_balance + interest - payment) STORED,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_debts_apr_user_id ON public.monthly_debts_apr(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_apr_month_id ON public.monthly_debts_apr(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_apr_due_date ON public.monthly_debts_apr(due_date);

ALTER TABLE public.monthly_debts_apr ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts records apr"
    ON public.monthly_debts_apr FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts records apr"
    ON public.monthly_debts_apr FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts records apr"
    ON public.monthly_debts_apr FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts records apr"
    ON public.monthly_debts_apr FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_debts_apr_updated_at
    BEFORE UPDATE ON public.monthly_debts_apr
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- May Debts
CREATE TABLE IF NOT EXISTS public.monthly_debts_may (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
    interest DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ending_balance DECIMAL(12, 2) GENERATED ALWAYS AS (initial_balance + interest - payment) STORED,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_debts_may_user_id ON public.monthly_debts_may(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_may_month_id ON public.monthly_debts_may(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_may_due_date ON public.monthly_debts_may(due_date);

ALTER TABLE public.monthly_debts_may ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts records may"
    ON public.monthly_debts_may FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts records may"
    ON public.monthly_debts_may FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts records may"
    ON public.monthly_debts_may FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts records may"
    ON public.monthly_debts_may FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_debts_may_updated_at
    BEFORE UPDATE ON public.monthly_debts_may
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- June Debts
CREATE TABLE IF NOT EXISTS public.monthly_debts_jun (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
    interest DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ending_balance DECIMAL(12, 2) GENERATED ALWAYS AS (initial_balance + interest - payment) STORED,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_debts_jun_user_id ON public.monthly_debts_jun(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_jun_month_id ON public.monthly_debts_jun(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_jun_due_date ON public.monthly_debts_jun(due_date);

ALTER TABLE public.monthly_debts_jun ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts records jun"
    ON public.monthly_debts_jun FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts records jun"
    ON public.monthly_debts_jun FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts records jun"
    ON public.monthly_debts_jun FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts records jun"
    ON public.monthly_debts_jun FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_debts_jun_updated_at
    BEFORE UPDATE ON public.monthly_debts_jun
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- July Debts
CREATE TABLE IF NOT EXISTS public.monthly_debts_jul (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
    interest DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ending_balance DECIMAL(12, 2) GENERATED ALWAYS AS (initial_balance + interest - payment) STORED,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_debts_jul_user_id ON public.monthly_debts_jul(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_jul_month_id ON public.monthly_debts_jul(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_jul_due_date ON public.monthly_debts_jul(due_date);

ALTER TABLE public.monthly_debts_jul ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts records jul"
    ON public.monthly_debts_jul FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts records jul"
    ON public.monthly_debts_jul FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts records jul"
    ON public.monthly_debts_jul FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts records jul"
    ON public.monthly_debts_jul FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_debts_jul_updated_at
    BEFORE UPDATE ON public.monthly_debts_jul
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- August Debts
CREATE TABLE IF NOT EXISTS public.monthly_debts_aug (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
    interest DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ending_balance DECIMAL(12, 2) GENERATED ALWAYS AS (initial_balance + interest - payment) STORED,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_debts_aug_user_id ON public.monthly_debts_aug(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_aug_month_id ON public.monthly_debts_aug(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_aug_due_date ON public.monthly_debts_aug(due_date);

ALTER TABLE public.monthly_debts_aug ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts records aug"
    ON public.monthly_debts_aug FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts records aug"
    ON public.monthly_debts_aug FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts records aug"
    ON public.monthly_debts_aug FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts records aug"
    ON public.monthly_debts_aug FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_debts_aug_updated_at
    BEFORE UPDATE ON public.monthly_debts_aug
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- September Debts
CREATE TABLE IF NOT EXISTS public.monthly_debts_sep (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
    interest DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ending_balance DECIMAL(12, 2) GENERATED ALWAYS AS (initial_balance + interest - payment) STORED,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_debts_sep_user_id ON public.monthly_debts_sep(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_sep_month_id ON public.monthly_debts_sep(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_sep_due_date ON public.monthly_debts_sep(due_date);

ALTER TABLE public.monthly_debts_sep ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts records sep"
    ON public.monthly_debts_sep FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts records sep"
    ON public.monthly_debts_sep FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts records sep"
    ON public.monthly_debts_sep FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts records sep"
    ON public.monthly_debts_sep FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_debts_sep_updated_at
    BEFORE UPDATE ON public.monthly_debts_sep
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- October Debts
CREATE TABLE IF NOT EXISTS public.monthly_debts_oct (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
    interest DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ending_balance DECIMAL(12, 2) GENERATED ALWAYS AS (initial_balance + interest - payment) STORED,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_debts_oct_user_id ON public.monthly_debts_oct(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_oct_month_id ON public.monthly_debts_oct(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_oct_due_date ON public.monthly_debts_oct(due_date);

ALTER TABLE public.monthly_debts_oct ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts records oct"
    ON public.monthly_debts_oct FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts records oct"
    ON public.monthly_debts_oct FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts records oct"
    ON public.monthly_debts_oct FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts records oct"
    ON public.monthly_debts_oct FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_debts_oct_updated_at
    BEFORE UPDATE ON public.monthly_debts_oct
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- November Debts
CREATE TABLE IF NOT EXISTS public.monthly_debts_nov (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
    interest DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ending_balance DECIMAL(12, 2) GENERATED ALWAYS AS (initial_balance + interest - payment) STORED,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_debts_nov_user_id ON public.monthly_debts_nov(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_nov_month_id ON public.monthly_debts_nov(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_nov_due_date ON public.monthly_debts_nov(due_date);

ALTER TABLE public.monthly_debts_nov ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts records nov"
    ON public.monthly_debts_nov FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts records nov"
    ON public.monthly_debts_nov FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts records nov"
    ON public.monthly_debts_nov FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts records nov"
    ON public.monthly_debts_nov FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_debts_nov_updated_at
    BEFORE UPDATE ON public.monthly_debts_nov
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- December Debts
CREATE TABLE IF NOT EXISTS public.monthly_debts_dec (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    creditor VARCHAR(255) NOT NULL,
    initial_balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
    interest DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ending_balance DECIMAL(12, 2) GENERATED ALWAYS AS (initial_balance + interest - payment) STORED,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_debts_dec_user_id ON public.monthly_debts_dec(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_dec_month_id ON public.monthly_debts_dec(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_debts_dec_due_date ON public.monthly_debts_dec(due_date);

ALTER TABLE public.monthly_debts_dec ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own debts records dec"
    ON public.monthly_debts_dec FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts records dec"
    ON public.monthly_debts_dec FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts records dec"
    ON public.monthly_debts_dec FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts records dec"
    ON public.monthly_debts_dec FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_debts_dec_updated_at
    BEFORE UPDATE ON public.monthly_debts_dec
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
