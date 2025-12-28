-- Migration: 20251228000001_create_gocardless_tables.sql
-- Create tables for GoCardless Open Banking integration

-- Store GoCardless API tokens (encrypted)
CREATE TABLE IF NOT EXISTS public.gocardless_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refresh_token TEXT NOT NULL, -- Store encrypted
  refresh_expires_at TIMESTAMPTZ NOT NULL,
  access_token TEXT, -- Store encrypted, nullable (regenerated frequently)
  access_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gocardless_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can access tokens
DROP POLICY IF EXISTS "Service role only" ON public.gocardless_tokens;
CREATE POLICY "Service role only" ON public.gocardless_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- Store bank requisitions (consent sessions)
CREATE TABLE IF NOT EXISTS public.bank_requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requisition_id TEXT NOT NULL UNIQUE, -- GoCardless requisition ID
  institution_id TEXT NOT NULL, -- Bank identifier (e.g., "BBVA_BBVAESMM")
  institution_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CR', -- CR=created, LN=linked, EX=expired, RJ=rejected
  reference TEXT, -- Our internal reference
  redirect_url TEXT,
  agreement_id TEXT, -- End user agreement ID
  accounts JSONB DEFAULT '[]'::jsonb, -- Array of linked account IDs
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Consent expiration (90 days typically)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bank_requisitions_user ON public.bank_requisitions(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_requisitions_status ON public.bank_requisitions(status);
CREATE INDEX IF NOT EXISTS idx_bank_requisitions_requisition_id ON public.bank_requisitions(requisition_id);

-- RLS Policies
ALTER TABLE public.bank_requisitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own requisitions" ON public.bank_requisitions;
CREATE POLICY "Users can view own requisitions" ON public.bank_requisitions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own requisitions" ON public.bank_requisitions;
CREATE POLICY "Users can insert own requisitions" ON public.bank_requisitions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own requisitions" ON public.bank_requisitions;
CREATE POLICY "Users can update own requisitions" ON public.bank_requisitions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own requisitions" ON public.bank_requisitions;
CREATE POLICY "Users can delete own requisitions" ON public.bank_requisitions
  FOR DELETE USING (auth.uid() = user_id);

-- Store connected bank accounts
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requisition_id UUID NOT NULL REFERENCES public.bank_requisitions(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL UNIQUE, -- GoCardless account ID
  iban TEXT,
  account_name TEXT,
  account_type TEXT, -- CHECKING, SAVINGS, CREDIT_CARD
  currency TEXT NOT NULL DEFAULT 'EUR',
  owner_name TEXT,
  current_balance DECIMAL(15, 2),
  available_balance DECIMAL(15, 2),
  balance_updated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE, -- User can disable sync for specific accounts
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user ON public.bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_requisition ON public.bank_accounts(requisition_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_account_id ON public.bank_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON public.bank_accounts(is_active);

-- RLS Policies
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can view own bank accounts" ON public.bank_accounts
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can update own bank accounts" ON public.bank_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- Store fetched transactions from banks
CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL, -- GoCardless transaction ID (for deduplication)
  internal_transaction_id TEXT, -- Bank's own transaction ID
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  booking_date DATE NOT NULL, -- Date transaction was booked
  value_date DATE, -- Date transaction takes effect
  transaction_type TEXT, -- DEBIT, CREDIT
  status TEXT, -- booked, pending
  merchant_name TEXT,
  description TEXT,
  remittance_info TEXT, -- Raw remittance information
  category TEXT, -- Auto-categorization placeholder
  is_imported BOOLEAN DEFAULT FALSE, -- Whether imported to user's monthly_transactions
  imported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_bank_transaction UNIQUE (bank_account_id, transaction_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bank_transactions_user ON public.bank_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account ON public.bank_transactions(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON public.bank_transactions(booking_date DESC);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_imported ON public.bank_transactions(is_imported);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_transaction_id ON public.bank_transactions(transaction_id);

-- RLS Policies
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bank transactions" ON public.bank_transactions;
CREATE POLICY "Users can view own bank transactions" ON public.bank_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Store sync state and error logs
CREATE TABLE IF NOT EXISTS public.bank_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'full', 'incremental', 'manual'
  status TEXT NOT NULL, -- 'success', 'failed', 'partial'
  transactions_fetched INTEGER DEFAULT 0,
  transactions_new INTEGER DEFAULT 0,
  transactions_duplicate INTEGER DEFAULT 0,
  error_message TEXT,
  error_code TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bank_sync_logs_user ON public.bank_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_sync_logs_account ON public.bank_sync_logs(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_sync_logs_status ON public.bank_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_bank_sync_logs_started ON public.bank_sync_logs(started_at DESC);

-- RLS Policies
ALTER TABLE public.bank_sync_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sync logs" ON public.bank_sync_logs;
CREATE POLICY "Users can view own sync logs" ON public.bank_sync_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_bank_requisitions_updated_at ON public.bank_requisitions;
CREATE TRIGGER update_bank_requisitions_updated_at BEFORE UPDATE ON public.bank_requisitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON public.bank_accounts;
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bank_transactions_updated_at ON public.bank_transactions;
CREATE TRIGGER update_bank_transactions_updated_at BEFORE UPDATE ON public.bank_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gocardless_tokens_updated_at ON public.gocardless_tokens;
CREATE TRIGGER update_gocardless_tokens_updated_at BEFORE UPDATE ON public.gocardless_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
