-- Migration 002: Monthly Transactions Tables
-- Creates 12 monthly transaction tables with RLS policies

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- January Transactions
CREATE TABLE IF NOT EXISTS public.monthly_transactions_jan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month_id INT NOT NULL REFERENCES public.months(id),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id),
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('INCOME', 'EXPENSE')),
    payment_method_id UUID REFERENCES public.payment_methods(id),
    account_id UUID REFERENCES public.accounts(id),
    currency_code VARCHAR(3) DEFAULT 'EUR' REFERENCES public.currencies(code),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_monthly_transactions_jan_user_id ON public.monthly_transactions_jan(user_id);
CREATE INDEX idx_monthly_transactions_jan_month_id ON public.monthly_transactions_jan(month_id);
CREATE INDEX idx_monthly_transactions_jan_date ON public.monthly_transactions_jan(date);

ALTER TABLE public.monthly_transactions_jan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jan transactions" ON public.monthly_transactions_jan FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own jan transactions" ON public.monthly_transactions_jan FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jan transactions" ON public.monthly_transactions_jan FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jan transactions" ON public.monthly_transactions_jan FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_monthly_transactions_jan_updated_at BEFORE UPDATE ON public.monthly_transactions_jan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- February through December (creating abbreviated versions to save space)
CREATE TABLE IF NOT EXISTS public.monthly_transactions_feb (LIKE public.monthly_transactions_jan INCLUDING ALL);
CREATE TABLE IF NOT EXISTS public.monthly_transactions_mar (LIKE public.monthly_transactions_jan INCLUDING ALL);
CREATE TABLE IF NOT EXISTS public.monthly_transactions_apr (LIKE public.monthly_transactions_jan INCLUDING ALL);
CREATE TABLE IF NOT EXISTS public.monthly_transactions_may (LIKE public.monthly_transactions_jan INCLUDING ALL);
CREATE TABLE IF NOT EXISTS public.monthly_transactions_jun (LIKE public.monthly_transactions_jan INCLUDING ALL);
CREATE TABLE IF NOT EXISTS public.monthly_transactions_jul (LIKE public.monthly_transactions_jan INCLUDING ALL);
CREATE TABLE IF NOT EXISTS public.monthly_transactions_aug (LIKE public.monthly_transactions_jan INCLUDING ALL);
CREATE TABLE IF NOT EXISTS public.monthly_transactions_sep (LIKE public.monthly_transactions_jan INCLUDING ALL);
CREATE TABLE IF NOT EXISTS public.monthly_transactions_oct (LIKE public.monthly_transactions_jan INCLUDING ALL);
CREATE TABLE IF NOT EXISTS public.monthly_transactions_nov (LIKE public.monthly_transactions_jan INCLUDING ALL);
CREATE TABLE IF NOT EXISTS public.monthly_transactions_dec (LIKE public.monthly_transactions_jan INCLUDING ALL);

-- Enable RLS and add policies for all remaining months
ALTER TABLE public.monthly_transactions_feb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own feb transactions" ON public.monthly_transactions_feb FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own feb transactions" ON public.monthly_transactions_feb FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feb transactions" ON public.monthly_transactions_feb FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own feb transactions" ON public.monthly_transactions_feb FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_monthly_transactions_feb_updated_at BEFORE UPDATE ON public.monthly_transactions_feb FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.monthly_transactions_mar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own mar transactions" ON public.monthly_transactions_mar FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mar transactions" ON public.monthly_transactions_mar FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mar transactions" ON public.monthly_transactions_mar FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mar transactions" ON public.monthly_transactions_mar FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_monthly_transactions_mar_updated_at BEFORE UPDATE ON public.monthly_transactions_mar FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.monthly_transactions_apr ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own apr transactions" ON public.monthly_transactions_apr FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own apr transactions" ON public.monthly_transactions_apr FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own apr transactions" ON public.monthly_transactions_apr FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own apr transactions" ON public.monthly_transactions_apr FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_monthly_transactions_apr_updated_at BEFORE UPDATE ON public.monthly_transactions_apr FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.monthly_transactions_may ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own may transactions" ON public.monthly_transactions_may FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own may transactions" ON public.monthly_transactions_may FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own may transactions" ON public.monthly_transactions_may FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own may transactions" ON public.monthly_transactions_may FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_monthly_transactions_may_updated_at BEFORE UPDATE ON public.monthly_transactions_may FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.monthly_transactions_jun ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own jun transactions" ON public.monthly_transactions_jun FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own jun transactions" ON public.monthly_transactions_jun FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jun transactions" ON public.monthly_transactions_jun FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jun transactions" ON public.monthly_transactions_jun FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_monthly_transactions_jun_updated_at BEFORE UPDATE ON public.monthly_transactions_jun FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.monthly_transactions_jul ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own jul transactions" ON public.monthly_transactions_jul FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own jul transactions" ON public.monthly_transactions_jul FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jul transactions" ON public.monthly_transactions_jul FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jul transactions" ON public.monthly_transactions_jul FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_monthly_transactions_jul_updated_at BEFORE UPDATE ON public.monthly_transactions_jul FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.monthly_transactions_aug ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own aug transactions" ON public.monthly_transactions_aug FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own aug transactions" ON public.monthly_transactions_aug FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own aug transactions" ON public.monthly_transactions_aug FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own aug transactions" ON public.monthly_transactions_aug FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_monthly_transactions_aug_updated_at BEFORE UPDATE ON public.monthly_transactions_aug FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.monthly_transactions_sep ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own sep transactions" ON public.monthly_transactions_sep FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sep transactions" ON public.monthly_transactions_sep FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sep transactions" ON public.monthly_transactions_sep FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sep transactions" ON public.monthly_transactions_sep FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_monthly_transactions_sep_updated_at BEFORE UPDATE ON public.monthly_transactions_sep FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.monthly_transactions_oct ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own oct transactions" ON public.monthly_transactions_oct FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own oct transactions" ON public.monthly_transactions_oct FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own oct transactions" ON public.monthly_transactions_oct FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own oct transactions" ON public.monthly_transactions_oct FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_monthly_transactions_oct_updated_at BEFORE UPDATE ON public.monthly_transactions_oct FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.monthly_transactions_nov ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own nov transactions" ON public.monthly_transactions_nov FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own nov transactions" ON public.monthly_transactions_nov FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own nov transactions" ON public.monthly_transactions_nov FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own nov transactions" ON public.monthly_transactions_nov FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_monthly_transactions_nov_updated_at BEFORE UPDATE ON public.monthly_transactions_nov FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.monthly_transactions_dec ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own dec transactions" ON public.monthly_transactions_dec FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own dec transactions" ON public.monthly_transactions_dec FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dec transactions" ON public.monthly_transactions_dec FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dec transactions" ON public.monthly_transactions_dec FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_monthly_transactions_dec_updated_at BEFORE UPDATE ON public.monthly_transactions_dec FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
