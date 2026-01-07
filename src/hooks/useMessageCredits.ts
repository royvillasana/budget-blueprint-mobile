/**
 * useMessageCredits Hook
 * React hook for managing message credits state and operations
 *
 * Features:
 * - Fetches and caches credit balance
 * - Provides methods for credit operations (convert XP, daily check-in)
 * - Auto-refetch on mount and manual refetch support
 * - Error handling and loading states
 */

import { useState, useEffect, useCallback } from 'react';
import {
  MessageCreditsService,
  CreditBalance,
  DailyCheckinResult,
  ConversionResult,
} from '@/services/MessageCreditsService';

export interface UseMessageCreditsReturn {
  balance: CreditBalance | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  convertXP: () => Promise<ConversionResult>;
  dailyCheckin: () => Promise<DailyCheckinResult>;
}

/**
 * Hook for managing message credits
 *
 * @example
 * ```tsx
 * const { balance, loading, convertXP, dailyCheckin } = useMessageCredits();
 *
 * if (loading) return <Spinner />;
 *
 * return (
 *   <div>
 *     <p>Credits: {balance?.total_credits || 0}</p>
 *     <button onClick={convertXP}>Convert XP</button>
 *     <button onClick={dailyCheckin}>Check In</button>
 *   </div>
 * );
 * ```
 */
export function useMessageCredits(): UseMessageCreditsReturn {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch credit balance from the service
   */
  const fetchBalance = useCallback(async () => {
    try {
      setError(null);
      const data = await MessageCreditsService.getCreditBalance();
      setBalance(data);
    } catch (err) {
      console.error('[useMessageCredits] Error fetching balance:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch balance'));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Convert XP to credits manually
   * (Note: This also happens automatically via database trigger)
   */
  const convertXP = useCallback(async (): Promise<ConversionResult> => {
    try {
      const result = await MessageCreditsService.convertXPToCredits();

      // Refetch balance if conversion was successful
      if (result.success) {
        await fetchBalance();
      }

      return result;
    } catch (err) {
      console.error('[useMessageCredits] Error converting XP:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to convert XP',
      };
    }
  }, [fetchBalance]);

  /**
   * Process daily check-in
   */
  const dailyCheckin = useCallback(async (): Promise<DailyCheckinResult> => {
    try {
      const result = await MessageCreditsService.processDailyCheckin();

      // Refetch balance if check-in was successful
      if (result.success) {
        await fetchBalance();
      }

      return result;
    } catch (err) {
      console.error('[useMessageCredits] Error processing check-in:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to process check-in',
      };
    }
  }, [fetchBalance]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchBalance();
  }, [fetchBalance]);

  // Fetch balance on mount
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Subscribe to realtime balance changes
  useEffect(() => {
    const unsubscribe = MessageCreditsService.subscribeToBalanceChanges((newBalance) => {
      if (newBalance) {
        setBalance(newBalance);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    balance,
    loading,
    error,
    refetch,
    convertXP,
    dailyCheckin,
  };
}
