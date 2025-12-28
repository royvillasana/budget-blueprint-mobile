import { supabase } from '@/integrations/supabase/client';
import type {
  BankProvider,
  BankConnection,
  BankAccount,
  BankTransaction,
  CreateConnectionResponse,
  ListProvidersResponse,
  SyncResult,
  ImportResult,
} from '@/types/banking';

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1';

export class BankingService {
  /**
   * Get authenticated user's access token
   */
  private static async getAccessToken(): Promise<string> {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      throw new Error('Not authenticated');
    }
    return session.access_token;
  }

  /**
   * List available bank providers for a market
   */
  static async listProviders(market: string = 'ES'): Promise<ListProvidersResponse> {
    const response = await fetch(`${FUNCTIONS_URL}/tink-list-providers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ market }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list providers');
    }

    return response.json();
  }

  /**
   * Create a new bank connection and get authorization link
   */
  static async createConnection(
    redirectUrl?: string,
    market: string = 'ES',
    locale: string = 'es_ES'
  ): Promise<CreateConnectionResponse> {
    const token = await this.getAccessToken();

    const response = await fetch(`${FUNCTIONS_URL}/tink-create-connection`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        redirectUrl: redirectUrl || `${window.location.origin}/banking/callback`,
        market,
        locale,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create connection');
    }

    return response.json();
  }

  /**
   * Handle callback after bank authorization
   */
  static async handleCallback(tinkUserId: string): Promise<any> {
    const token = await this.getAccessToken();

    const response = await fetch(`${FUNCTIONS_URL}/tink-handle-callback`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tinkUserId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to handle callback');
    }

    return response.json();
  }

  /**
   * Exchange authorization code for accounts
   */
  static async exchangeCode(code: string, credentialsId: string): Promise<any> {
    const token = await this.getAccessToken();

    const response = await fetch(`${FUNCTIONS_URL}/tink-exchange-code`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, credentialsId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to exchange code');
    }

    return response.json();
  }

  /**
   * Sync transactions from Tink
   */
  static async syncTransactions(
    tinkUserId: string,
    accountIds?: string[]
  ): Promise<SyncResult> {
    const token = await this.getAccessToken();

    const response = await fetch(`${FUNCTIONS_URL}/tink-sync-transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tinkUserId, accountIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Sync error details:', error);
      throw new Error(error.error || error.details || 'Failed to sync transactions');
    }

    return response.json();
  }

  /**
   * Import transactions to monthly budget
   */
  static async importTransactions(
    transactionIds: string[],
    year: number,
    month: number
  ): Promise<ImportResult> {
    const token = await this.getAccessToken();

    const response = await fetch(`${FUNCTIONS_URL}/tink-import-transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactionIds, year, month }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to import transactions');
    }

    return response.json();
  }

  /**
   * Delete a bank connection
   */
  static async deleteConnection(credentialsId: string): Promise<void> {
    const token = await this.getAccessToken();

    const response = await fetch(`${FUNCTIONS_URL}/tink-delete-connection`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credentialsId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete connection');
    }
  }

  /**
   * Get bank connections from database
   */
  static async getConnections(): Promise<BankConnection[]> {
    const { data, error } = await supabase
      .from('bank_requisitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get Tink user ID for current user
   */
  static async getTinkUserId(): Promise<string | null> {
    const { data, error } = await supabase
      .from('bank_requisitions')
      .select('requisition_id')
      .eq('institution_id', 'tink')
      .single();

    if (error) return null;
    return data?.requisition_id || null;
  }

  /**
   * Get bank accounts from database
   */
  static async getAccounts(): Promise<BankAccount[]> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get bank transactions from database
   */
  static async getTransactions(
    accountId?: string,
    isImported?: boolean
  ): Promise<BankTransaction[]> {
    let query = supabase
      .from('bank_transactions')
      .select('*')
      .order('booking_date', { ascending: false });

    if (accountId) {
      query = query.eq('bank_account_id', accountId);
    }

    if (isImported !== undefined) {
      query = query.eq('is_imported', isImported);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }
}
