-- Migration: Backfill Gamification Profiles
-- Description: Backfill user_gamification profiles for existing users.

-- 1. Insert a profile for every user in auth.users that doesn't already have one
INSERT INTO public.user_gamification (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 2. Ensure RLS is correct just in case (redundant but safe)
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
