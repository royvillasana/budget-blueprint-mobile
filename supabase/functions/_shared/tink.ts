// supabase/functions/_shared/tink.ts

export const TINK_API_BASE = 'https://api.tink.com/api/v1';
export const TINK_LINK_BASE = 'https://link.tink.com/1.0';

export interface TinkConfig {
  clientId: string;
  clientSecret: string;
}

export interface TinkTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface TinkProvider {
  name: string;
  displayName: string;
  type: string;
  status: string;
  credentialsType: string;
  helpText: string;
  isPopular: boolean;
  fields: Array<{
    description: string;
    hint: string;
    maxLength: number;
    minLength: number;
    name: string;
    numeric: boolean;
    optional: boolean;
    pattern: string;
    patternError: string;
    helpText: string;
  }>;
  groupDisplayName: string;
  image: string;
  displayDescription: string;
  capability: string[];
  accessType: string;
  market: string;
  financialInstitution: {
    id: string;
    name: string;
  };
}

export interface TinkUser {
  external_user_id: string;
  market: string;
  locale: string;
}

export interface TinkUserResponse {
  user_id: string;
  external_user_id: string;
}

export interface TinkCredentials {
  id: string;
  providerName: string;
  type: string;
  status: string;
  statusPayload: string;
  statusUpdated: number;
  updated: number;
  fields: Record<string, string>;
  supplementalInformation: string;
  userId: string;
  sessionExpiryDate: number;
}

export interface TinkAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currencyCode: string;
  credentialsId: string;
  excluded: boolean;
  favored: boolean;
  closed: boolean;
  financialInstitutionId: string;
  accountNumber: string;
  userId: string;
}

export interface TinkTransaction {
  id: string;
  accountId: string;
  amount: number;
  currencyCode: string;
  date: number;
  description: string;
  type: string;
  categoryId: string;
  categoryType: string;
  dispensableAmount: number;
  originalAmount: number;
  originalCurrencyCode: string;
  userId: string;
  pending: boolean;
  timestamp: number;
}

export class TinkClient {
  private config: TinkConfig;
  private accessToken: string | null = null;

  constructor(config: TinkConfig) {
    this.config = config;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Get client credentials access token
   */
  async getClientAccessToken(): Promise<TinkTokenResponse> {
    const response = await fetch(`${TINK_API_BASE}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'client_credentials',
        scope: 'authorization:grant,user:create',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get client access token: ${error}`);
    }

    return response.json();
  }

  /**
   * Create a Tink user
   */
  async createUser(externalUserId: string, market: string = 'ES', locale: string = 'es_ES'): Promise<TinkUserResponse> {
    if (!this.accessToken) throw new Error('Access token not set');

    const response = await fetch(`${TINK_API_BASE}/user/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_user_id: externalUserId,
        market,
        locale,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create user: ${error}`);
    }

    return response.json();
  }

  /**
   * Get user access token (delegated token for specific user)
   */
  async getUserAccessToken(userId: string): Promise<TinkTokenResponse> {
    const response = await fetch(`${TINK_API_BASE}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'client_credentials',
        scope: 'accounts:read,transactions:read,credentials:read',
        actor_client_id: this.config.clientId,
        id_hint: `user:${userId}`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user access token: ${error}`);
    }

    return response.json();
  }

  /**
   * Exchange authorization code for access token
   * This is the token that has access to user's bank accounts after Tink Link authorization
   */
  async exchangeCodeForToken(code: string): Promise<TinkTokenResponse> {
    const response = await fetch(`${TINK_API_BASE}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    return response.json();
  }

  /**
   * List providers (banks) for a market
   */
  async listProviders(market: string = 'ES', capability?: string): Promise<TinkProvider[]> {
    if (!this.accessToken) throw new Error('Access token not set');

    let url = `${TINK_API_BASE}/providers?market=${market}`;
    if (capability) {
      url += `&capability=${capability}`;
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to list providers: ${error}`);
    }

    const data = await response.json();
    return data.providers || [];
  }

  /**
   * Get user's credentials (connected banks)
   */
  async getUserCredentials(userId: string): Promise<TinkCredentials[]> {
    if (!this.accessToken) throw new Error('Access token not set');

    const response = await fetch(`${TINK_API_BASE}/credentials/list`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user credentials: ${error}`);
    }

    const data = await response.json();
    return data.credentials || [];
  }

  /**
   * Get user's accounts
   */
  async getUserAccounts(userId: string): Promise<TinkAccount[]> {
    if (!this.accessToken) throw new Error('Access token not set');

    console.log('Requesting accounts from:', `${TINK_API_BASE}/accounts/list`)
    const response = await fetch(`${TINK_API_BASE}/accounts/list`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    console.log('Accounts response status:', response.status, response.statusText)

    if (!response.ok) {
      const error = await response.text();
      console.log('Accounts error response:', error)
      throw new Error(`Failed to get user accounts: ${error}`);
    }

    const data = await response.json();
    console.log('Accounts data:', JSON.stringify(data, null, 2))
    return data.accounts || [];
  }

  /**
   * Get transactions for a user
   */
  async getUserTransactions(userId: string, accountIds?: string[]): Promise<TinkTransaction[]> {
    if (!this.accessToken) throw new Error('Access token not set');

    // Build URL with optional accountIds query params
    const url = new URL(`${TINK_API_BASE}/transactions/list`);
    if (accountIds && accountIds.length > 0) {
      accountIds.forEach(id => url.searchParams.append('accountIdIn', id));
    }

    console.log('Requesting transactions from:', url.toString())
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    console.log('Transactions response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Transactions error response:', errorText)

      // Try to parse as JSON for better error message
      let errorMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorJson.errorMessage || errorText;
        console.log('Parsed error:', errorJson);
      } catch (e) {
        // Not JSON, use raw text
      }

      throw new Error(`Failed to get transactions (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    console.log('Transactions data:', JSON.stringify(data, null, 2))
    return data.transactions || [];
  }

  /**
   * Delete credentials (disconnect bank)
   */
  async deleteCredentials(credentialsId: string): Promise<void> {
    if (!this.accessToken) throw new Error('Access token not set');

    const response = await fetch(`${TINK_API_BASE}/credentials/${credentialsId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      const error = await response.text();
      throw new Error(`Failed to delete credentials: ${error}`);
    }
  }

  /**
   * Refresh credentials (re-sync bank data)
   */
  async refreshCredentials(credentialsId: string): Promise<void> {
    if (!this.accessToken) throw new Error('Access token not set');

    const response = await fetch(`${TINK_API_BASE}/credentials/${credentialsId}/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh credentials: ${error}`);
    }
  }
}
