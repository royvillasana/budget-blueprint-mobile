-- Migration: Disable RLS on lookup tables that don't need per-user security

-- Disable RLS on global lookup tables since they're public
ALTER TABLE public.months DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on tables with user data
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_references ENABLE ROW LEVEL SECURITY;
