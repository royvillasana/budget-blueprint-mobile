// Banking types for Tink integration

export interface BankProvider {
  name: string;
  displayName: string;
  market: string;
  logo?: string;
}

export interface BankConnection {
  id: string;
  user_id: string;
  requisition_id: string;
  institution_id: string;
  institution_name: string;
  status: string;
  reference: string;
  accounts: string[];
  created_at: string;
  expires_at: string;
}

export interface BankAccount {
  id: string;
  user_id: string;
  requisition_id: string;
  account_id: string;
  iban: string | null;
  account_name: string | null;
  current_balance: number | null;
  currency: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankTransaction {
  id: string;
  user_id: string;
  bank_account_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  booking_date: string;
  value_date: string | null;
  merchant_name: string | null;
  description: string | null;
  is_imported: boolean;
  created_at: string;
}

export interface SyncResult {
  success: boolean;
  transactionsFetched: number;
  transactionsSynced: number;
  transactionsSkipped: number;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[] | null;
}

export interface CreateConnectionResponse {
  tinkUserId: string;
  authorizationLink: string;
}

export interface ListProvidersResponse {
  providers: BankProvider[];
  source?: string;
  note?: string;
}
