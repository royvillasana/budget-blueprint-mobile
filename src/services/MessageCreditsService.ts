/**
 * Message Credits Service
 * Manages the credit-based rewards system for AI chat messages
 *
 * Features:
 * - Hybrid payment system (credits first, then subscription limits)
 * - XP to credits conversion (100 XP = 1 credit)
 * - Daily check-ins with streak bonuses
 * - Challenge completion rewards
 * - Referral program
 */

import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface CreditBalance {
  total_credits: number;
  total_earned: number;
  total_spent: number;
  xp_converted_total: number;
  last_xp_conversion_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'earned' | 'spent';
  source: 'xp_conversion' | 'daily_checkin' | 'challenge_completion' | 'referral_reward' | 'chat_message';
  source_id: string;
  metadata: Record<string, any>;
  balance_after: number;
  created_at: string;
}

export interface MessageSendResult {
  success: boolean;
  payment_method: 'credits' | 'subscription';
  credits_spent?: number;
  credits_remaining?: number;
  usage_count?: number;
  usage_limit?: number;
  has_exceeded?: boolean;
}

export interface DailyCheckinResult {
  success: boolean;
  checkin_id?: string;
  credits_awarded?: number;
  xp_awarded?: number;
  consecutive_days?: number;
  next_checkin?: string;
  new_balance?: number;
  message?: string;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  checkin_date: string;
  consecutive_days: number;
  credits_awarded: number;
  xp_awarded: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ReferralStats {
  referral_code: string | null;
  total_referrals: number;
  successful_referrals: number;
  total_credits_earned: number;
}

export interface ConversionResult {
  success: boolean;
  credits_awarded?: number;
  xp_converted?: number;
  remaining_xp?: number;
  new_balance?: number;
  message?: string;
}

// =====================================================
// MESSAGE CREDITS SERVICE
// =====================================================

export class MessageCreditsService {
  /**
   * Get the current credit balance for the authenticated user
   */
  static async getCreditBalance(): Promise<CreditBalance | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('[Credits] Not authenticated:', authError);
        return null;
      }

      const { data, error } = await supabase
        .from('user_message_credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If user doesn't have a record yet, return default values
        if (error.code === 'PGRST116') {
          return {
            total_credits: 0,
            total_earned: 0,
            total_spent: 0,
            xp_converted_total: 0,
            last_xp_conversion_at: null,
          };
        }
        console.error('[Credits] Error fetching balance:', error);
        return null;
      }

      return data as CreditBalance;
    } catch (error) {
      console.error('[Credits] Unexpected error:', error);
      return null;
    }
  }

  /**
   * Get credit transaction history
   * @param limit Maximum number of transactions to fetch (default: 50)
   */
  static async getCreditHistory(limit: number = 50): Promise<CreditTransaction[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('[Credits] Not authenticated:', authError);
        return [];
      }

      const { data, error } = await supabase
        .from('message_credits_ledger')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[Credits] Error fetching history:', error);
        return [];
      }

      return data as CreditTransaction[];
    } catch (error) {
      console.error('[Credits] Unexpected error:', error);
      return [];
    }
  }

  /**
   * Manually trigger XP to credits conversion
   * (Note: This is also automatic via database trigger)
   */
  static async convertXPToCredits(): Promise<ConversionResult> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.rpc('convert_xp_to_credits', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('[Credits] Error converting XP:', error);
        throw error;
      }

      return data as ConversionResult;
    } catch (error: any) {
      console.error('[Credits] Unexpected error:', error);
      return {
        success: false,
        message: error.message || 'Failed to convert XP',
      };
    }
  }

  /**
   * Process daily check-in
   * Awards credits and XP with streak bonuses
   */
  static async processDailyCheckin(): Promise<DailyCheckinResult> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.rpc('process_daily_checkin', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('[Credits] Error processing check-in:', error);
        throw error;
      }

      return data as DailyCheckinResult;
    } catch (error: any) {
      console.error('[Credits] Unexpected error:', error);
      return {
        success: false,
        message: error.message || 'Failed to process check-in',
      };
    }
  }

  /**
   * Check if user can send a message (hybrid: credits OR subscription)
   */
  static async canSendMessage(): Promise<{
    can_send: boolean;
    payment_method?: 'credits' | 'subscription';
    credits_available?: number;
    usage_count?: number;
    usage_limit?: number;
    remaining?: number;
    reason?: string;
  }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { can_send: false, reason: 'not_authenticated' };
      }

      const { data, error } = await supabase.rpc('can_send_message', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('[Credits] Error checking send permission:', error);
        return { can_send: false, reason: 'error' };
      }

      return data;
    } catch (error) {
      console.error('[Credits] Unexpected error:', error);
      return { can_send: false, reason: 'error' };
    }
  }

  /**
   * Process a message send using hybrid credit/subscription system
   * This should be called AFTER the message is successfully sent
   */
  static async processMessageSend(): Promise<MessageSendResult> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.rpc('process_message_send', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('[Credits] Error processing message send:', error);
        throw error;
      }

      return data as MessageSendResult;
    } catch (error: any) {
      console.error('[Credits] Unexpected error:', error);
      return {
        success: false,
        payment_method: 'subscription',
      };
    }
  }

  /**
   * Get referral statistics for the authenticated user
   */
  static async getReferralStats(): Promise<ReferralStats | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('[Credits] Not authenticated:', authError);
        return null;
      }

      const { data, error } = await supabase.rpc('get_referral_stats', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('[Credits] Error fetching referral stats:', error);
        return null;
      }

      return data as ReferralStats;
    } catch (error) {
      console.error('[Credits] Unexpected error:', error);
      return null;
    }
  }

  /**
   * Get daily check-in status (today's check-in and streak info)
   */
  static async getDailyCheckinStatus(): Promise<{
    checked_in_today: boolean;
    last_checkin: DailyCheckin | null;
    consecutive_days: number;
    next_checkin: string;
  }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      // Check if user checked in today
      const { data: todayCheckin, error: todayError } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('checkin_date', today)
        .maybeSingle();

      if (todayError) {
        console.error('[Credits] Error checking today\'s check-in:', todayError);
      }

      // Get last check-in for streak info
      const { data: lastCheckin, error: lastError } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('checkin_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastError) {
        console.error('[Credits] Error fetching last check-in:', lastError);
      }

      // Calculate next check-in date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextCheckin = tomorrow.toISOString().split('T')[0];

      return {
        checked_in_today: !!todayCheckin,
        last_checkin: lastCheckin as DailyCheckin | null,
        consecutive_days: lastCheckin?.consecutive_days || 0,
        next_checkin: nextCheckin,
      };
    } catch (error) {
      console.error('[Credits] Unexpected error:', error);
      return {
        checked_in_today: false,
        last_checkin: null,
        consecutive_days: 0,
        next_checkin: new Date().toISOString().split('T')[0],
      };
    }
  }

  /**
   * Subscribe to credit balance changes (realtime)
   * Returns an unsubscribe function
   */
  static subscribeToBalanceChanges(
    callback: (balance: CreditBalance | null) => void
  ): () => void {
    let userId: string | null = null;

    // Get user ID
    supabase.auth.getUser().then(({ data }) => {
      userId = data.user?.id || null;

      if (!userId) return;

      // Initial fetch
      this.getCreditBalance().then(callback);

      // Subscribe to changes
      const channel = supabase
        .channel('credit_balance_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_message_credits',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            // Refetch balance on any change
            this.getCreditBalance().then(callback);
          }
        )
        .subscribe();

      // Return unsubscribe function
      return () => {
        channel.unsubscribe();
      };
    });

    // Return no-op unsubscribe for now
    return () => {};
  }

  /**
   * Subscribe to new credit transactions (realtime)
   * Returns an unsubscribe function
   */
  static subscribeToTransactions(
    callback: (transaction: CreditTransaction) => void
  ): () => void {
    let userId: string | null = null;

    supabase.auth.getUser().then(({ data }) => {
      userId = data.user?.id || null;

      if (!userId) return;

      const channel = supabase
        .channel('credit_transactions')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'message_credits_ledger',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            callback(payload.new as CreditTransaction);
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    });

    return () => {};
  }
}
