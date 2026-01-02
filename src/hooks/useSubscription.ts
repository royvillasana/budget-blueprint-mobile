// Custom hook for subscription and entitlements
import { useState, useEffect } from 'react';
import { SubscriptionService, type BillingInfo, type TrialStatus } from '@/services/SubscriptionService';

export function useSubscription() {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBillingInfo = async () => {
    try {
      setLoading(true);
      const [billing, trial] = await Promise.all([
        SubscriptionService.getBillingInfo(),
        SubscriptionService.getTrialStatus(),
      ]);
      setBillingInfo(billing);
      setTrialStatus(trial);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching billing info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingInfo();
  }, []);

  return {
    billingInfo,
    trialStatus,
    loading,
    error,
    refetch: fetchBillingInfo,
    subscription: billingInfo?.subscription,
    entitlements: billingInfo?.entitlements,
    usage: billingInfo?.usage,
    isTrialing: trialStatus?.is_trialing ?? false,
    daysRemaining: trialStatus?.days_remaining ?? 0,
    trialExpired: trialStatus?.trial_expired ?? false,
  };
}

export function useEntitlements() {
  const { entitlements, loading } = useSubscription();

  return {
    canConnectBanks: entitlements?.can_connect_banks ?? false,
    chatMessageLimit: entitlements?.chat_message_limit ?? 25,
    transactionDaysLimit: entitlements?.transaction_days_limit ?? 30,
    canExport: entitlements?.can_export ?? false,
    hasAdvancedInsights: entitlements?.has_advanced_insights ?? false,
    hasPrioritySupport: entitlements?.has_priority_support ?? false,
    loading,
  };
}

export function useUsage() {
  const { usage, loading, refetch } = useSubscription();

  const incrementChatUsage = async () => {
    try {
      await SubscriptionService.incrementUsage('chat_messages', 1);
      await refetch();
    } catch (error) {
      console.error('Error incrementing chat usage:', error);
      throw error;
    }
  };

  return {
    chatMessages: usage?.chat_messages,
    loading,
    incrementChatUsage,
    refetch,
  };
}
