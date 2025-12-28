-- Migration: Fix gocardless_tokens table for Tink OAuth
-- Tink uses OAuth 2.0 client credentials which don't have refresh tokens

-- Make refresh_token and refresh_expires_at nullable since Tink doesn't use them
ALTER TABLE public.gocardless_tokens
ALTER COLUMN refresh_token DROP NOT NULL,
ALTER COLUMN refresh_expires_at DROP NOT NULL;

-- Add comment
COMMENT ON TABLE public.gocardless_tokens IS 'Stores OAuth tokens for Tink API (reusing table name from original GoCardless implementation)';
