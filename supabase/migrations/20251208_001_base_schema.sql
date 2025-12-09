-- Migration 001: Create Base Schema
-- Creates core global tables and utility functions

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Months table
CREATE TABLE IF NOT EXISTS public.months (
    id INT PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    year INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.months (id, name, year) VALUES
(1, 'January', 2025),
(2, 'February', 2025),
(3, 'March', 2025),
(4, 'April', 2025),
(5, 'May', 2025),
(6, 'June', 2025),
(7, 'July', 2025),
(8, 'August', 2025),
(9, 'September', 2025),
(10, 'October', 2025),
(11, 'November', 2025),
(12, 'December', 2025)
ON CONFLICT (id) DO NOTHING;

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    bucket_50_30_20 VARCHAR(50) NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE', 'INVESTMENTS', 'DEBT_PAYMENTS')),
    emoji VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.categories (id, name, bucket_50_30_20, emoji, is_active) VALUES
(gen_random_uuid(), 'Groceries', 'NEEDS', '🛒', TRUE),
(gen_random_uuid(), 'Housing', 'NEEDS', '🏠', TRUE),
(gen_random_uuid(), 'Utilities', 'NEEDS', '💡', TRUE),
(gen_random_uuid(), 'Transportation', 'NEEDS', '🚗', TRUE),
(gen_random_uuid(), 'Entertainment', 'WANTS', '🎬', TRUE),
(gen_random_uuid(), 'Dining Out', 'WANTS', '🍽️', TRUE),
(gen_random_uuid(), 'Travel', 'WANTS', '✈️', TRUE),
(gen_random_uuid(), 'Shopping', 'WANTS', '🛍️', TRUE),
(gen_random_uuid(), 'Emergency Fund', 'FUTURE', '🏦', TRUE),
(gen_random_uuid(), 'Savings', 'FUTURE', '💰', TRUE),
(gen_random_uuid(), 'Investments', 'INVESTMENTS', '📈', TRUE),
(gen_random_uuid(), 'Education', 'INVESTMENTS', '📚', TRUE),
(gen_random_uuid(), 'Debt Payment', 'DEBT_PAYMENTS', '💳', TRUE)
ON CONFLICT DO NOTHING;

-- Payment Methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.payment_methods (name) VALUES
('Cash'),
('Credit Card'),
('Debit Card'),
('Bank Transfer'),
('Mobile Payment')
ON CONFLICT DO NOTHING;

-- Accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    balance DECIMAL(12, 2) DEFAULT 0,
    currency_code VARCHAR(3) DEFAULT 'USD',
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Currencies table
CREATE TABLE IF NOT EXISTS public.currencies (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    exchange_rate DECIMAL(12, 4) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.currencies (code, name, symbol, exchange_rate) VALUES
('EUR', 'Euro', '€', 1.0),
('USD', 'US Dollar', '$', 1.0),
('CLP', 'Chilean Peso', '$', 900.0)
ON CONFLICT (code) DO NOTHING;

-- User Settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    owner_name VARCHAR(255),
    currency VARCHAR(3) DEFAULT 'EUR',
    monthly_income DECIMAL(12, 2) DEFAULT 0,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.months ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for categories
CREATE POLICY "Anyone can view categories"
    ON public.categories FOR SELECT
    USING (is_active = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for payment methods
CREATE POLICY "Anyone can view payment methods"
    ON public.payment_methods FOR SELECT
    USING (true);

-- Create RLS policies for accounts
CREATE POLICY "Users can view their own accounts"
    ON public.accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own accounts"
    ON public.accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
    ON public.accounts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user settings
CREATE POLICY "Users can view their own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_months_updated_at
    BEFORE UPDATE ON public.months
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_currencies_updated_at
    BEFORE UPDATE ON public.currencies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
