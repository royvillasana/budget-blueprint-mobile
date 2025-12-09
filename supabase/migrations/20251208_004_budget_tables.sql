-- Migration 4: Monthly Budget Tables
-- Creates 12 monthly budget tables with RLS policies and variance triggers

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- January Budget
CREATE TABLE IF NOT EXISTS public.monthly_budget_jan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    category_id UUID NOT NULL REFERENCES public.categories(id),
    planned_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    variance DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budget_jan_user_id ON public.monthly_budget_jan(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_jan_month_id ON public.monthly_budget_jan(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_jan_category_id ON public.monthly_budget_jan(category_id);

ALTER TABLE public.monthly_budget_jan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget records jan"
    ON public.monthly_budget_jan FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget records jan"
    ON public.monthly_budget_jan FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget records jan"
    ON public.monthly_budget_jan FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget records jan"
    ON public.monthly_budget_jan FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_budget_jan_updated_at
    BEFORE UPDATE ON public.monthly_budget_jan
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- February Budget
CREATE TABLE IF NOT EXISTS public.monthly_budget_feb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    category_id UUID NOT NULL REFERENCES public.categories(id),
    planned_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    variance DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budget_feb_user_id ON public.monthly_budget_feb(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_feb_month_id ON public.monthly_budget_feb(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_feb_category_id ON public.monthly_budget_feb(category_id);

ALTER TABLE public.monthly_budget_feb ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget records feb"
    ON public.monthly_budget_feb FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget records feb"
    ON public.monthly_budget_feb FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget records feb"
    ON public.monthly_budget_feb FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget records feb"
    ON public.monthly_budget_feb FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_budget_feb_updated_at
    BEFORE UPDATE ON public.monthly_budget_feb
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- March Budget
CREATE TABLE IF NOT EXISTS public.monthly_budget_mar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    category_id UUID NOT NULL REFERENCES public.categories(id),
    planned_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    variance DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budget_mar_user_id ON public.monthly_budget_mar(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_mar_month_id ON public.monthly_budget_mar(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_mar_category_id ON public.monthly_budget_mar(category_id);

ALTER TABLE public.monthly_budget_mar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget records mar"
    ON public.monthly_budget_mar FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget records mar"
    ON public.monthly_budget_mar FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget records mar"
    ON public.monthly_budget_mar FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget records mar"
    ON public.monthly_budget_mar FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_budget_mar_updated_at
    BEFORE UPDATE ON public.monthly_budget_mar
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- April Budget
CREATE TABLE IF NOT EXISTS public.monthly_budget_apr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    category_id UUID NOT NULL REFERENCES public.categories(id),
    planned_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    variance DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budget_apr_user_id ON public.monthly_budget_apr(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_apr_month_id ON public.monthly_budget_apr(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_apr_category_id ON public.monthly_budget_apr(category_id);

ALTER TABLE public.monthly_budget_apr ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget records apr"
    ON public.monthly_budget_apr FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget records apr"
    ON public.monthly_budget_apr FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget records apr"
    ON public.monthly_budget_apr FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget records apr"
    ON public.monthly_budget_apr FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_budget_apr_updated_at
    BEFORE UPDATE ON public.monthly_budget_apr
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- May Budget
CREATE TABLE IF NOT EXISTS public.monthly_budget_may (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    category_id UUID NOT NULL REFERENCES public.categories(id),
    planned_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    variance DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budget_may_user_id ON public.monthly_budget_may(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_may_month_id ON public.monthly_budget_may(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_may_category_id ON public.monthly_budget_may(category_id);

ALTER TABLE public.monthly_budget_may ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget records may"
    ON public.monthly_budget_may FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget records may"
    ON public.monthly_budget_may FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget records may"
    ON public.monthly_budget_may FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget records may"
    ON public.monthly_budget_may FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_budget_may_updated_at
    BEFORE UPDATE ON public.monthly_budget_may
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- June Budget
CREATE TABLE IF NOT EXISTS public.monthly_budget_jun (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    category_id UUID NOT NULL REFERENCES public.categories(id),
    planned_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    variance DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budget_jun_user_id ON public.monthly_budget_jun(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_jun_month_id ON public.monthly_budget_jun(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_jun_category_id ON public.monthly_budget_jun(category_id);

ALTER TABLE public.monthly_budget_jun ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget records jun"
    ON public.monthly_budget_jun FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget records jun"
    ON public.monthly_budget_jun FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget records jun"
    ON public.monthly_budget_jun FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget records jun"
    ON public.monthly_budget_jun FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_budget_jun_updated_at
    BEFORE UPDATE ON public.monthly_budget_jun
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- July Budget
CREATE TABLE IF NOT EXISTS public.monthly_budget_jul (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    category_id UUID NOT NULL REFERENCES public.categories(id),
    planned_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    variance DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budget_jul_user_id ON public.monthly_budget_jul(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_jul_month_id ON public.monthly_budget_jul(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_jul_category_id ON public.monthly_budget_jul(category_id);

ALTER TABLE public.monthly_budget_jul ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget records jul"
    ON public.monthly_budget_jul FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget records jul"
    ON public.monthly_budget_jul FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget records jul"
    ON public.monthly_budget_jul FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget records jul"
    ON public.monthly_budget_jul FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_budget_jul_updated_at
    BEFORE UPDATE ON public.monthly_budget_jul
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- August Budget
CREATE TABLE IF NOT EXISTS public.monthly_budget_aug (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    category_id UUID NOT NULL REFERENCES public.categories(id),
    planned_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    variance DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budget_aug_user_id ON public.monthly_budget_aug(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_aug_month_id ON public.monthly_budget_aug(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_aug_category_id ON public.monthly_budget_aug(category_id);

ALTER TABLE public.monthly_budget_aug ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget records aug"
    ON public.monthly_budget_aug FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget records aug"
    ON public.monthly_budget_aug FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget records aug"
    ON public.monthly_budget_aug FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget records aug"
    ON public.monthly_budget_aug FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_budget_aug_updated_at
    BEFORE UPDATE ON public.monthly_budget_aug
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- September Budget
CREATE TABLE IF NOT EXISTS public.monthly_budget_sep (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    category_id UUID NOT NULL REFERENCES public.categories(id),
    planned_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    variance DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budget_sep_user_id ON public.monthly_budget_sep(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_sep_month_id ON public.monthly_budget_sep(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_sep_category_id ON public.monthly_budget_sep(category_id);

ALTER TABLE public.monthly_budget_sep ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget records sep"
    ON public.monthly_budget_sep FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget records sep"
    ON public.monthly_budget_sep FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget records sep"
    ON public.monthly_budget_sep FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget records sep"
    ON public.monthly_budget_sep FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_budget_sep_updated_at
    BEFORE UPDATE ON public.monthly_budget_sep
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- October Budget
CREATE TABLE IF NOT EXISTS public.monthly_budget_oct (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    category_id UUID NOT NULL REFERENCES public.categories(id),
    planned_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    variance DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budget_oct_user_id ON public.monthly_budget_oct(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_oct_month_id ON public.monthly_budget_oct(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_oct_category_id ON public.monthly_budget_oct(category_id);

ALTER TABLE public.monthly_budget_oct ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget records oct"
    ON public.monthly_budget_oct FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget records oct"
    ON public.monthly_budget_oct FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget records oct"
    ON public.monthly_budget_oct FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget records oct"
    ON public.monthly_budget_oct FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_budget_oct_updated_at
    BEFORE UPDATE ON public.monthly_budget_oct
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- November Budget
CREATE TABLE IF NOT EXISTS public.monthly_budget_nov (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    category_id UUID NOT NULL REFERENCES public.categories(id),
    planned_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    variance DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budget_nov_user_id ON public.monthly_budget_nov(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_nov_month_id ON public.monthly_budget_nov(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_nov_category_id ON public.monthly_budget_nov(category_id);

ALTER TABLE public.monthly_budget_nov ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget records nov"
    ON public.monthly_budget_nov FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget records nov"
    ON public.monthly_budget_nov FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget records nov"
    ON public.monthly_budget_nov FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget records nov"
    ON public.monthly_budget_nov FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_budget_nov_updated_at
    BEFORE UPDATE ON public.monthly_budget_nov
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- December Budget
CREATE TABLE IF NOT EXISTS public.monthly_budget_dec (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    category_id UUID NOT NULL REFERENCES public.categories(id),
    planned_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    spent_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    variance DECIMAL(12, 2) GENERATED ALWAYS AS (planned_amount - spent_amount) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_budget_dec_user_id ON public.monthly_budget_dec(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_dec_month_id ON public.monthly_budget_dec(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_budget_dec_category_id ON public.monthly_budget_dec(category_id);

ALTER TABLE public.monthly_budget_dec ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own budget records dec"
    ON public.monthly_budget_dec FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget records dec"
    ON public.monthly_budget_dec FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget records dec"
    ON public.monthly_budget_dec FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget records dec"
    ON public.monthly_budget_dec FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_budget_dec_updated_at
    BEFORE UPDATE ON public.monthly_budget_dec
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
