// Custom hook for managing trial status
import { useState, useEffect } from 'react';
import { SubscriptionService, type TrialStatus } from '@/services/SubscriptionService';

export function useTrial() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTrialStatus = async () => {
    try {
      setLoading(true);
      const data = await SubscriptionService.getTrialStatus();
      setTrialStatus(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching trial status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialStatus();
  }, []);

  return {
    trialStatus,
    loading,
    error,
    refetch: fetchTrialStatus,
    isTrialing: trialStatus?.is_trialing ?? false,
    daysRemaining: trialStatus?.days_remaining ?? 0,
    trialExpired: trialStatus?.trial_expired ?? false,
  };
}
