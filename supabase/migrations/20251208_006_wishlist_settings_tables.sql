-- Migration 6: Wishlist and Settings Tables
-- Creates 12 monthly wishlist and 12 monthly settings tables with RLS policies

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ==================== WISHLIST TABLES ====================

-- January Wishlist
CREATE TABLE IF NOT EXISTS public.monthly_wishlist_jan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    desired_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    saved_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    remaining DECIMAL(12, 2) GENERATED ALWAYS AS (desired_amount - saved_amount) STORED,
    target_date DATE,
    priority INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_jan_user_id ON public.monthly_wishlist_jan(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_jan_month_id ON public.monthly_wishlist_jan(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_jan_priority ON public.monthly_wishlist_jan(priority);

ALTER TABLE public.monthly_wishlist_jan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist records jan"
    ON public.monthly_wishlist_jan FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist records jan"
    ON public.monthly_wishlist_jan FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist records jan"
    ON public.monthly_wishlist_jan FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist records jan"
    ON public.monthly_wishlist_jan FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_wishlist_jan_updated_at
    BEFORE UPDATE ON public.monthly_wishlist_jan
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- February Wishlist
CREATE TABLE IF NOT EXISTS public.monthly_wishlist_feb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    desired_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    saved_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    remaining DECIMAL(12, 2) GENERATED ALWAYS AS (desired_amount - saved_amount) STORED,
    target_date DATE,
    priority INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_feb_user_id ON public.monthly_wishlist_feb(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_feb_month_id ON public.monthly_wishlist_feb(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_feb_priority ON public.monthly_wishlist_feb(priority);

ALTER TABLE public.monthly_wishlist_feb ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist records feb"
    ON public.monthly_wishlist_feb FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist records feb"
    ON public.monthly_wishlist_feb FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist records feb"
    ON public.monthly_wishlist_feb FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist records feb"
    ON public.monthly_wishlist_feb FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_wishlist_feb_updated_at
    BEFORE UPDATE ON public.monthly_wishlist_feb
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- March Wishlist
CREATE TABLE IF NOT EXISTS public.monthly_wishlist_mar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    desired_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    saved_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    remaining DECIMAL(12, 2) GENERATED ALWAYS AS (desired_amount - saved_amount) STORED,
    target_date DATE,
    priority INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_mar_user_id ON public.monthly_wishlist_mar(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_mar_month_id ON public.monthly_wishlist_mar(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_mar_priority ON public.monthly_wishlist_mar(priority);

ALTER TABLE public.monthly_wishlist_mar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist records mar"
    ON public.monthly_wishlist_mar FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist records mar"
    ON public.monthly_wishlist_mar FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist records mar"
    ON public.monthly_wishlist_mar FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist records mar"
    ON public.monthly_wishlist_mar FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_wishlist_mar_updated_at
    BEFORE UPDATE ON public.monthly_wishlist_mar
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- April Wishlist
CREATE TABLE IF NOT EXISTS public.monthly_wishlist_apr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    desired_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    saved_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    remaining DECIMAL(12, 2) GENERATED ALWAYS AS (desired_amount - saved_amount) STORED,
    target_date DATE,
    priority INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_apr_user_id ON public.monthly_wishlist_apr(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_apr_month_id ON public.monthly_wishlist_apr(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_apr_priority ON public.monthly_wishlist_apr(priority);

ALTER TABLE public.monthly_wishlist_apr ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist records apr"
    ON public.monthly_wishlist_apr FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist records apr"
    ON public.monthly_wishlist_apr FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist records apr"
    ON public.monthly_wishlist_apr FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist records apr"
    ON public.monthly_wishlist_apr FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_wishlist_apr_updated_at
    BEFORE UPDATE ON public.monthly_wishlist_apr
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- May Wishlist
CREATE TABLE IF NOT EXISTS public.monthly_wishlist_may (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    desired_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    saved_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    remaining DECIMAL(12, 2) GENERATED ALWAYS AS (desired_amount - saved_amount) STORED,
    target_date DATE,
    priority INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_may_user_id ON public.monthly_wishlist_may(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_may_month_id ON public.monthly_wishlist_may(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_may_priority ON public.monthly_wishlist_may(priority);

ALTER TABLE public.monthly_wishlist_may ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist records may"
    ON public.monthly_wishlist_may FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist records may"
    ON public.monthly_wishlist_may FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist records may"
    ON public.monthly_wishlist_may FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist records may"
    ON public.monthly_wishlist_may FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_wishlist_may_updated_at
    BEFORE UPDATE ON public.monthly_wishlist_may
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- June Wishlist
CREATE TABLE IF NOT EXISTS public.monthly_wishlist_jun (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    desired_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    saved_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    remaining DECIMAL(12, 2) GENERATED ALWAYS AS (desired_amount - saved_amount) STORED,
    target_date DATE,
    priority INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_jun_user_id ON public.monthly_wishlist_jun(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_jun_month_id ON public.monthly_wishlist_jun(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_jun_priority ON public.monthly_wishlist_jun(priority);

ALTER TABLE public.monthly_wishlist_jun ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist records jun"
    ON public.monthly_wishlist_jun FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist records jun"
    ON public.monthly_wishlist_jun FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist records jun"
    ON public.monthly_wishlist_jun FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist records jun"
    ON public.monthly_wishlist_jun FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_wishlist_jun_updated_at
    BEFORE UPDATE ON public.monthly_wishlist_jun
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- July Wishlist
CREATE TABLE IF NOT EXISTS public.monthly_wishlist_jul (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    desired_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    saved_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    remaining DECIMAL(12, 2) GENERATED ALWAYS AS (desired_amount - saved_amount) STORED,
    target_date DATE,
    priority INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_jul_user_id ON public.monthly_wishlist_jul(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_jul_month_id ON public.monthly_wishlist_jul(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_jul_priority ON public.monthly_wishlist_jul(priority);

ALTER TABLE public.monthly_wishlist_jul ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist records jul"
    ON public.monthly_wishlist_jul FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist records jul"
    ON public.monthly_wishlist_jul FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist records jul"
    ON public.monthly_wishlist_jul FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist records jul"
    ON public.monthly_wishlist_jul FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_wishlist_jul_updated_at
    BEFORE UPDATE ON public.monthly_wishlist_jul
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- August Wishlist
CREATE TABLE IF NOT EXISTS public.monthly_wishlist_aug (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    desired_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    saved_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    remaining DECIMAL(12, 2) GENERATED ALWAYS AS (desired_amount - saved_amount) STORED,
    target_date DATE,
    priority INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_aug_user_id ON public.monthly_wishlist_aug(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_aug_month_id ON public.monthly_wishlist_aug(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_aug_priority ON public.monthly_wishlist_aug(priority);

ALTER TABLE public.monthly_wishlist_aug ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist records aug"
    ON public.monthly_wishlist_aug FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist records aug"
    ON public.monthly_wishlist_aug FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist records aug"
    ON public.monthly_wishlist_aug FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist records aug"
    ON public.monthly_wishlist_aug FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_wishlist_aug_updated_at
    BEFORE UPDATE ON public.monthly_wishlist_aug
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- September Wishlist
CREATE TABLE IF NOT EXISTS public.monthly_wishlist_sep (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    desired_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    saved_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    remaining DECIMAL(12, 2) GENERATED ALWAYS AS (desired_amount - saved_amount) STORED,
    target_date DATE,
    priority INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_sep_user_id ON public.monthly_wishlist_sep(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_sep_month_id ON public.monthly_wishlist_sep(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_sep_priority ON public.monthly_wishlist_sep(priority);

ALTER TABLE public.monthly_wishlist_sep ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist records sep"
    ON public.monthly_wishlist_sep FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist records sep"
    ON public.monthly_wishlist_sep FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist records sep"
    ON public.monthly_wishlist_sep FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist records sep"
    ON public.monthly_wishlist_sep FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_wishlist_sep_updated_at
    BEFORE UPDATE ON public.monthly_wishlist_sep
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- October Wishlist
CREATE TABLE IF NOT EXISTS public.monthly_wishlist_oct (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    desired_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    saved_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    remaining DECIMAL(12, 2) GENERATED ALWAYS AS (desired_amount - saved_amount) STORED,
    target_date DATE,
    priority INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_oct_user_id ON public.monthly_wishlist_oct(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_oct_month_id ON public.monthly_wishlist_oct(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_oct_priority ON public.monthly_wishlist_oct(priority);

ALTER TABLE public.monthly_wishlist_oct ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist records oct"
    ON public.monthly_wishlist_oct FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist records oct"
    ON public.monthly_wishlist_oct FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist records oct"
    ON public.monthly_wishlist_oct FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist records oct"
    ON public.monthly_wishlist_oct FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_wishlist_oct_updated_at
    BEFORE UPDATE ON public.monthly_wishlist_oct
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- November Wishlist
CREATE TABLE IF NOT EXISTS public.monthly_wishlist_nov (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    desired_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    saved_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    remaining DECIMAL(12, 2) GENERATED ALWAYS AS (desired_amount - saved_amount) STORED,
    target_date DATE,
    priority INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_nov_user_id ON public.monthly_wishlist_nov(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_nov_month_id ON public.monthly_wishlist_nov(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_nov_priority ON public.monthly_wishlist_nov(priority);

ALTER TABLE public.monthly_wishlist_nov ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist records nov"
    ON public.monthly_wishlist_nov FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist records nov"
    ON public.monthly_wishlist_nov FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist records nov"
    ON public.monthly_wishlist_nov FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist records nov"
    ON public.monthly_wishlist_nov FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_wishlist_nov_updated_at
    BEFORE UPDATE ON public.monthly_wishlist_nov
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- December Wishlist
CREATE TABLE IF NOT EXISTS public.monthly_wishlist_dec (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    description TEXT NOT NULL,
    desired_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    saved_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    remaining DECIMAL(12, 2) GENERATED ALWAYS AS (desired_amount - saved_amount) STORED,
    target_date DATE,
    priority INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id)
);

CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_dec_user_id ON public.monthly_wishlist_dec(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_dec_month_id ON public.monthly_wishlist_dec(month_id);
CREATE INDEX IF NOT EXISTS idx_monthly_wishlist_dec_priority ON public.monthly_wishlist_dec(priority);

ALTER TABLE public.monthly_wishlist_dec ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist records dec"
    ON public.monthly_wishlist_dec FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist records dec"
    ON public.monthly_wishlist_dec FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist records dec"
    ON public.monthly_wishlist_dec FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist records dec"
    ON public.monthly_wishlist_dec FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_wishlist_dec_updated_at
    BEFORE UPDATE ON public.monthly_wishlist_dec
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== SETTINGS TABLES ====================

-- January Settings
CREATE TABLE IF NOT EXISTS public.monthly_settings_jan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_monthly_settings_jan_user_id ON public.monthly_settings_jan(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settings_jan_month_id ON public.monthly_settings_jan(month_id);

ALTER TABLE public.monthly_settings_jan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings jan"
    ON public.monthly_settings_jan FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings jan"
    ON public.monthly_settings_jan FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings jan"
    ON public.monthly_settings_jan FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings jan"
    ON public.monthly_settings_jan FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_settings_jan_updated_at
    BEFORE UPDATE ON public.monthly_settings_jan
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- February Settings
CREATE TABLE IF NOT EXISTS public.monthly_settings_feb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_monthly_settings_feb_user_id ON public.monthly_settings_feb(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settings_feb_month_id ON public.monthly_settings_feb(month_id);

ALTER TABLE public.monthly_settings_feb ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings feb"
    ON public.monthly_settings_feb FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings feb"
    ON public.monthly_settings_feb FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings feb"
    ON public.monthly_settings_feb FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings feb"
    ON public.monthly_settings_feb FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_settings_feb_updated_at
    BEFORE UPDATE ON public.monthly_settings_feb
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- March Settings
CREATE TABLE IF NOT EXISTS public.monthly_settings_mar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_monthly_settings_mar_user_id ON public.monthly_settings_mar(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settings_mar_month_id ON public.monthly_settings_mar(month_id);

ALTER TABLE public.monthly_settings_mar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings mar"
    ON public.monthly_settings_mar FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings mar"
    ON public.monthly_settings_mar FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings mar"
    ON public.monthly_settings_mar FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings mar"
    ON public.monthly_settings_mar FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_settings_mar_updated_at
    BEFORE UPDATE ON public.monthly_settings_mar
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- April Settings
CREATE TABLE IF NOT EXISTS public.monthly_settings_apr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_monthly_settings_apr_user_id ON public.monthly_settings_apr(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settings_apr_month_id ON public.monthly_settings_apr(month_id);

ALTER TABLE public.monthly_settings_apr ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings apr"
    ON public.monthly_settings_apr FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings apr"
    ON public.monthly_settings_apr FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings apr"
    ON public.monthly_settings_apr FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings apr"
    ON public.monthly_settings_apr FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_settings_apr_updated_at
    BEFORE UPDATE ON public.monthly_settings_apr
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- May Settings
CREATE TABLE IF NOT EXISTS public.monthly_settings_may (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_monthly_settings_may_user_id ON public.monthly_settings_may(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settings_may_month_id ON public.monthly_settings_may(month_id);

ALTER TABLE public.monthly_settings_may ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings may"
    ON public.monthly_settings_may FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings may"
    ON public.monthly_settings_may FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings may"
    ON public.monthly_settings_may FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings may"
    ON public.monthly_settings_may FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_settings_may_updated_at
    BEFORE UPDATE ON public.monthly_settings_may
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- June Settings
CREATE TABLE IF NOT EXISTS public.monthly_settings_jun (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_monthly_settings_jun_user_id ON public.monthly_settings_jun(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settings_jun_month_id ON public.monthly_settings_jun(month_id);

ALTER TABLE public.monthly_settings_jun ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings jun"
    ON public.monthly_settings_jun FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings jun"
    ON public.monthly_settings_jun FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings jun"
    ON public.monthly_settings_jun FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings jun"
    ON public.monthly_settings_jun FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_settings_jun_updated_at
    BEFORE UPDATE ON public.monthly_settings_jun
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- July Settings
CREATE TABLE IF NOT EXISTS public.monthly_settings_jul (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_monthly_settings_jul_user_id ON public.monthly_settings_jul(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settings_jul_month_id ON public.monthly_settings_jul(month_id);

ALTER TABLE public.monthly_settings_jul ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings jul"
    ON public.monthly_settings_jul FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings jul"
    ON public.monthly_settings_jul FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings jul"
    ON public.monthly_settings_jul FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings jul"
    ON public.monthly_settings_jul FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_settings_jul_updated_at
    BEFORE UPDATE ON public.monthly_settings_jul
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- August Settings
CREATE TABLE IF NOT EXISTS public.monthly_settings_aug (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_monthly_settings_aug_user_id ON public.monthly_settings_aug(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settings_aug_month_id ON public.monthly_settings_aug(month_id);

ALTER TABLE public.monthly_settings_aug ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings aug"
    ON public.monthly_settings_aug FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings aug"
    ON public.monthly_settings_aug FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings aug"
    ON public.monthly_settings_aug FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings aug"
    ON public.monthly_settings_aug FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_settings_aug_updated_at
    BEFORE UPDATE ON public.monthly_settings_aug
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- September Settings
CREATE TABLE IF NOT EXISTS public.monthly_settings_sep (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_monthly_settings_sep_user_id ON public.monthly_settings_sep(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settings_sep_month_id ON public.monthly_settings_sep(month_id);

ALTER TABLE public.monthly_settings_sep ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings sep"
    ON public.monthly_settings_sep FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings sep"
    ON public.monthly_settings_sep FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings sep"
    ON public.monthly_settings_sep FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings sep"
    ON public.monthly_settings_sep FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_settings_sep_updated_at
    BEFORE UPDATE ON public.monthly_settings_sep
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- October Settings
CREATE TABLE IF NOT EXISTS public.monthly_settings_oct (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_monthly_settings_oct_user_id ON public.monthly_settings_oct(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settings_oct_month_id ON public.monthly_settings_oct(month_id);

ALTER TABLE public.monthly_settings_oct ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings oct"
    ON public.monthly_settings_oct FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings oct"
    ON public.monthly_settings_oct FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings oct"
    ON public.monthly_settings_oct FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings oct"
    ON public.monthly_settings_oct FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_settings_oct_updated_at
    BEFORE UPDATE ON public.monthly_settings_oct
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- November Settings
CREATE TABLE IF NOT EXISTS public.monthly_settings_nov (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_monthly_settings_nov_user_id ON public.monthly_settings_nov(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settings_nov_month_id ON public.monthly_settings_nov(month_id);

ALTER TABLE public.monthly_settings_nov ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings nov"
    ON public.monthly_settings_nov FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings nov"
    ON public.monthly_settings_nov FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings nov"
    ON public.monthly_settings_nov FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings nov"
    ON public.monthly_settings_nov FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_settings_nov_updated_at
    BEFORE UPDATE ON public.monthly_settings_nov
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- December Settings
CREATE TABLE IF NOT EXISTS public.monthly_settings_dec (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    setting_key VARCHAR(255) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (month_id) REFERENCES public.months(id),
    UNIQUE(month_id, user_id, setting_key)
);

CREATE INDEX IF NOT EXISTS idx_monthly_settings_dec_user_id ON public.monthly_settings_dec(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_settings_dec_month_id ON public.monthly_settings_dec(month_id);

ALTER TABLE public.monthly_settings_dec ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings dec"
    ON public.monthly_settings_dec FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings dec"
    ON public.monthly_settings_dec FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings dec"
    ON public.monthly_settings_dec FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings dec"
    ON public.monthly_settings_dec FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_settings_dec_updated_at
    BEFORE UPDATE ON public.monthly_settings_dec
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
