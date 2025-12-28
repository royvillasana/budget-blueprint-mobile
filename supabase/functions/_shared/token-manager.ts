// supabase/functions/_shared/token-manager.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export class TokenManager {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get valid access token (refresh if expired)
   * For Tink, we use client credentials OAuth flow
   */
  async getValidAccessToken(tinkClient: any): Promise<string> {
    const { data: tokenData, error } = await this.supabase
      .from('gocardless_tokens')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !tokenData) {
      // No token exists, create new one
      const newToken = await tinkClient.getClientAccessToken();
      await this.storeToken(newToken);
      return newToken.access_token;
    }

    // Check if access token is still valid (with 5 minute buffer)
    const now = new Date();
    const expiresAt = new Date(tokenData.access_expires_at);
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (expiresAt.getTime() - now.getTime() > bufferTime) {
      return tokenData.access_token;
    }

    // Token expired or about to expire, get new one
    const newToken = await tinkClient.getClientAccessToken();
    await this.storeToken(newToken);
    return newToken.access_token;
  }

  /**
   * Store new access token
   * Tink uses OAuth 2.0 with client credentials, no refresh token
   */
  private async storeToken(token: any) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + token.expires_in * 1000);

    const { error } = await this.supabase.from('gocardless_tokens').insert({
      access_token: token.access_token,
      access_expires_at: expiresAt.toISOString(),
      refresh_token: null, // Tink client credentials don't use refresh tokens
      refresh_expires_at: null,
    });

    if (error) throw new Error(`Failed to store token: ${error.message}`);
  }
}
