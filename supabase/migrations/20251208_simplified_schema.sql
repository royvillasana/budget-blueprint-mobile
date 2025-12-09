-- Simplified Budget Database Schema
-- Created: December 8, 2025

-- ============================================
-- PHASE 1: Basic Tables
-- ============================================

-- Create months table
CREATE TABLE IF NOT EXISTS public.months (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  year INTEGER NOT NULL DEFAULT 2025,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.months ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Months are viewable by everyone" ON public.months FOR SELECT USING (true);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT,
  bucket_50_30_20 TEXT NOT NULL CHECK (bucket_50_30_20 IN ('NEEDS', 'WANTS', 'FUTURE', 'INVESTMENTS', 'DEBT_PAYMENTS')),
  is_active BOOLEAN DEFAULT true,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Create payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CASH', 'CREDIT', 'DEBIT', 'TRANSFER', 'OTHER')),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payment methods" ON public.payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own payment methods" ON public.payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payment methods" ON public.payment_methods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payment methods" ON public.payment_methods FOR DELETE USING (auth.uid() = user_id);

-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'LOAN', 'OTHER')),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- Create currencies table
CREATE TABLE IF NOT EXISTS public.currencies (
  code TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  rate_to_eur DECIMAL(10, 6),
  rate_to_usd DECIMAL(10, 6),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Currencies are viewable by everyone" ON public.currencies FOR SELECT USING (true);

-- Insert default currencies
INSERT INTO public.currencies (code, symbol, rate_to_eur, rate_to_usd) VALUES
  ('EUR', '€', 1.0, 1.09),
  ('USD', '$', 0.92, 1.0),
  ('CLP', '$', 0.00095, 0.00103)
ON CONFLICT DO NOTHING;

-- Create user settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  owner_name TEXT,
  currency TEXT DEFAULT 'EUR',
  language TEXT DEFAULT 'es',
  monthly_income NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- PHASE 2: AI Conversations Tables
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Nueva conversación',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_archived BOOLEAN DEFAULT false NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool', 'function')),
    content TEXT,
    tool_calls JSONB,
    tool_call_id TEXT,
    name TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_hidden BOOLEAN DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS public.conversation_references (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    message_id UUID REFERENCES public.ai_messages(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('transaction', 'budget', 'category', 'account', 'debt', 'wishlist')),
    entity_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON public.ai_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON public.ai_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_references_conversation ON public.conversation_references(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_references_entity ON public.conversation_references(entity_type, entity_id);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_references ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own conversations" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own conversations" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own conversations" ON public.ai_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own conversations" ON public.ai_conversations FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages from their conversations" ON public.ai_messages FOR SELECT
USING (EXISTS (SELECT 1 FROM public.ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()));

CREATE POLICY "Users can insert messages to their conversations" ON public.ai_messages FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()));

CREATE POLICY "Users can delete messages from their conversations" ON public.ai_messages FOR DELETE
USING (EXISTS (SELECT 1 FROM public.ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid()));

CREATE POLICY "Users can view references from their conversations" ON public.conversation_references FOR SELECT
USING (EXISTS (SELECT 1 FROM public.ai_conversations WHERE ai_conversations.id = conversation_references.conversation_id AND ai_conversations.user_id = auth.uid()));

CREATE POLICY "Users can insert references to their conversations" ON public.conversation_references FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.ai_conversations WHERE ai_conversations.id = conversation_references.conversation_id AND ai_conversations.user_id = auth.uid()));

CREATE POLICY "Users can delete references from their conversations" ON public.conversation_references FOR DELETE
USING (EXISTS (SELECT 1 FROM public.ai_conversations WHERE ai_conversations.id = conversation_references.conversation_id AND ai_conversations.user_id = auth.uid()));

-- ============================================
-- PHASE 3: Helper Functions and Triggers
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_ai_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.ai_conversations
    SET updated_at = timezone('utc'::text, now())
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers
CREATE TRIGGER IF NOT EXISTS update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_ai_conversation_updated_at();
CREATE TRIGGER IF NOT EXISTS update_conversation_timestamp_on_message AFTER INSERT ON public.ai_messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_on_message();

-- ============================================
-- PHASE 4: Insert Months Data
-- ============================================

INSERT INTO public.months (id, name, year, start_date, end_date) VALUES
  (1, 'January', 2025, '2025-01-01', '2025-01-31'),
  (2, 'February', 2025, '2025-02-01', '2025-02-28'),
  (3, 'March', 2025, '2025-03-01', '2025-03-31'),
  (4, 'April', 2025, '2025-04-01', '2025-04-30'),
  (5, 'May', 2025, '2025-05-01', '2025-05-31'),
  (6, 'June', 2025, '2025-06-01', '2025-06-30'),
  (7, 'July', 2025, '2025-07-01', '2025-07-31'),
  (8, 'August', 2025, '2025-08-01', '2025-08-31'),
  (9, 'September', 2025, '2025-09-01', '2025-09-30'),
  (10, 'October', 2025, '2025-10-01', '2025-10-31'),
  (11, 'November', 2025, '2025-11-01', '2025-11-30'),
  (12, 'December', 2025, '2025-12-01', '2025-12-31')
ON CONFLICT DO NOTHING;
