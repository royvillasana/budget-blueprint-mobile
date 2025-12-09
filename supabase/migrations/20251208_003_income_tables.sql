-- Migration 3: Monthly Income Tables
-- Creates 12 monthly income tables with RLS policies

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- January Income
CREATE TABLE IF NOT EXISTS public.monthly_income_jan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    source VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_income_jan_user_id ON public.monthly_income_jan(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_jan_month_id ON public.monthly_income_jan(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_jan_date ON public.monthly_income_jan(date);

ALTER TABLE public.monthly_income_jan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income records jan"
    ON public.monthly_income_jan FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income records jan"
    ON public.monthly_income_jan FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income records jan"
    ON public.monthly_income_jan FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income records jan"
    ON public.monthly_income_jan FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_income_jan_updated_at
    BEFORE UPDATE ON public.monthly_income_jan
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- February Income
CREATE TABLE IF NOT EXISTS public.monthly_income_feb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    source VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_income_feb_user_id ON public.monthly_income_feb(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_feb_month_id ON public.monthly_income_feb(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_feb_date ON public.monthly_income_feb(date);

ALTER TABLE public.monthly_income_feb ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income records feb"
    ON public.monthly_income_feb FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income records feb"
    ON public.monthly_income_feb FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income records feb"
    ON public.monthly_income_feb FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income records feb"
    ON public.monthly_income_feb FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_income_feb_updated_at
    BEFORE UPDATE ON public.monthly_income_feb
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- March Income
CREATE TABLE IF NOT EXISTS public.monthly_income_mar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    source VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_income_mar_user_id ON public.monthly_income_mar(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_mar_month_id ON public.monthly_income_mar(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_mar_date ON public.monthly_income_mar(date);

ALTER TABLE public.monthly_income_mar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income records mar"
    ON public.monthly_income_mar FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income records mar"
    ON public.monthly_income_mar FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income records mar"
    ON public.monthly_income_mar FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income records mar"
    ON public.monthly_income_mar FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_income_mar_updated_at
    BEFORE UPDATE ON public.monthly_income_mar
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- April Income
CREATE TABLE IF NOT EXISTS public.monthly_income_apr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    source VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_income_apr_user_id ON public.monthly_income_apr(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_apr_month_id ON public.monthly_income_apr(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_apr_date ON public.monthly_income_apr(date);

ALTER TABLE public.monthly_income_apr ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income records apr"
    ON public.monthly_income_apr FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income records apr"
    ON public.monthly_income_apr FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income records apr"
    ON public.monthly_income_apr FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income records apr"
    ON public.monthly_income_apr FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_income_apr_updated_at
    BEFORE UPDATE ON public.monthly_income_apr
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- May Income
CREATE TABLE IF NOT EXISTS public.monthly_income_may (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    source VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_income_may_user_id ON public.monthly_income_may(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_may_month_id ON public.monthly_income_may(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_may_date ON public.monthly_income_may(date);

ALTER TABLE public.monthly_income_may ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income records may"
    ON public.monthly_income_may FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income records may"
    ON public.monthly_income_may FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income records may"
    ON public.monthly_income_may FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income records may"
    ON public.monthly_income_may FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_income_may_updated_at
    BEFORE UPDATE ON public.monthly_income_may
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- June Income
CREATE TABLE IF NOT EXISTS public.monthly_income_jun (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    source VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_income_jun_user_id ON public.monthly_income_jun(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_jun_month_id ON public.monthly_income_jun(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_jun_date ON public.monthly_income_jun(date);

ALTER TABLE public.monthly_income_jun ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income records jun"
    ON public.monthly_income_jun FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income records jun"
    ON public.monthly_income_jun FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income records jun"
    ON public.monthly_income_jun FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income records jun"
    ON public.monthly_income_jun FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_income_jun_updated_at
    BEFORE UPDATE ON public.monthly_income_jun
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- July Income
CREATE TABLE IF NOT EXISTS public.monthly_income_jul (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    source VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_income_jul_user_id ON public.monthly_income_jul(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_jul_month_id ON public.monthly_income_jul(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_jul_date ON public.monthly_income_jul(date);

ALTER TABLE public.monthly_income_jul ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income records jul"
    ON public.monthly_income_jul FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income records jul"
    ON public.monthly_income_jul FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income records jul"
    ON public.monthly_income_jul FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income records jul"
    ON public.monthly_income_jul FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_income_jul_updated_at
    BEFORE UPDATE ON public.monthly_income_jul
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- August Income
CREATE TABLE IF NOT EXISTS public.monthly_income_aug (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    source VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_income_aug_user_id ON public.monthly_income_aug(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_aug_month_id ON public.monthly_income_aug(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_aug_date ON public.monthly_income_aug(date);

ALTER TABLE public.monthly_income_aug ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income records aug"
    ON public.monthly_income_aug FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income records aug"
    ON public.monthly_income_aug FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income records aug"
    ON public.monthly_income_aug FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income records aug"
    ON public.monthly_income_aug FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_income_aug_updated_at
    BEFORE UPDATE ON public.monthly_income_aug
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- September Income
CREATE TABLE IF NOT EXISTS public.monthly_income_sep (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    source VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_income_sep_user_id ON public.monthly_income_sep(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_sep_month_id ON public.monthly_income_sep(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_sep_date ON public.monthly_income_sep(date);

ALTER TABLE public.monthly_income_sep ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income records sep"
    ON public.monthly_income_sep FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income records sep"
    ON public.monthly_income_sep FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income records sep"
    ON public.monthly_income_sep FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income records sep"
    ON public.monthly_income_sep FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_income_sep_updated_at
    BEFORE UPDATE ON public.monthly_income_sep
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- October Income
CREATE TABLE IF NOT EXISTS public.monthly_income_oct (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    source VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_income_oct_user_id ON public.monthly_income_oct(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_oct_month_id ON public.monthly_income_oct(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_oct_date ON public.monthly_income_oct(date);

ALTER TABLE public.monthly_income_oct ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income records oct"
    ON public.monthly_income_oct FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income records oct"
    ON public.monthly_income_oct FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income records oct"
    ON public.monthly_income_oct FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income records oct"
    ON public.monthly_income_oct FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_income_oct_updated_at
    BEFORE UPDATE ON public.monthly_income_oct
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- November Income
CREATE TABLE IF NOT EXISTS public.monthly_income_nov (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    source VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_income_nov_user_id ON public.monthly_income_nov(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_nov_month_id ON public.monthly_income_nov(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_nov_date ON public.monthly_income_nov(date);

ALTER TABLE public.monthly_income_nov ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income records nov"
    ON public.monthly_income_nov FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income records nov"
    ON public.monthly_income_nov FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income records nov"
    ON public.monthly_income_nov FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income records nov"
    ON public.monthly_income_nov FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_income_nov_updated_at
    BEFORE UPDATE ON public.monthly_income_nov
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- December Income
CREATE TABLE IF NOT EXISTS public.monthly_income_dec (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    source VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_income_dec_user_id ON public.monthly_income_dec(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_dec_month_id ON public.monthly_income_dec(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_income_dec_date ON public.monthly_income_dec(date);

ALTER TABLE public.monthly_income_dec ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own income records dec"
    ON public.monthly_income_dec FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income records dec"
    ON public.monthly_income_dec FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income records dec"
    ON public.monthly_income_dec FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income records dec"
    ON public.monthly_income_dec FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_income_dec_updated_at
    BEFORE UPDATE ON public.monthly_income_dec
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
