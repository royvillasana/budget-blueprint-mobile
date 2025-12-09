-- Migration: Fix RLS policies and views

-- Enable RLS on months table
ALTER TABLE public.months ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view months (it's a global lookup table)
CREATE POLICY "Anyone can view months" ON public.months
    FOR SELECT
    USING (true);

-- Add user_id filter to view_annual_summary by removing it from the view
-- The view doesn't need user_id column since it's aggregating all data
-- Remove the user_id filter from queries in the application instead

-- Ensure tables have proper RLS policies for SELECT
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT
    USING (true);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view payment_methods" ON public.payment_methods
    FOR SELECT
    USING (true);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own accounts" ON public.accounts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert accounts" ON public.accounts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" ON public.accounts
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view currencies" ON public.currencies
    FOR SELECT
    USING (true);

-- Add missing DELETE policy for user_settings if needed
CREATE POLICY "Users can delete their own settings" ON public.user_settings
    FOR DELETE
    USING (auth.uid() = user_id);

-- Ensure ai_conversations and ai_messages have proper RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversations" ON public.ai_conversations
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert conversations" ON public.ai_conversations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON public.ai_conversations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON public.ai_conversations
    FOR DELETE
    USING (auth.uid() = user_id);

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their conversations" ON public.ai_messages
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert messages" ON public.ai_messages
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" ON public.ai_messages
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON public.ai_messages
    FOR DELETE
    USING (auth.uid() = user_id);

ALTER TABLE public.conversation_references ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their references" ON public.conversation_references
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert references" ON public.conversation_references
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own references" ON public.conversation_references
    FOR DELETE
    USING (auth.uid() = user_id);
