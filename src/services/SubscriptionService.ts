// Subscription and Billing Service
import { supabase } from '@/integrations/supabase/client';

export type Plan = 'free' | 'essential' | 'pro';
export type BillingInterval = 'month' | 'year';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid';

export interface Subscription {
  plan: Plan;
  status: SubscriptionStatus;
  billing_interval: BillingInterval | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_end: string | null;
}

export interface Entitlements {
  can_connect_banks: boolean;
  chat_message_limit: number;
  transaction_days_limit: number | null;
  can_export: boolean;
  has_advanced_insights: boolean;
  has_priority_support: boolean;
}

export interface Usage {
  count: number;
  limit: number | null;
  reset_at: string;
  has_exceeded: boolean;
  remaining: number | null;
}

export interface TrialStatus {
  has_trial: boolean;
  is_trialing: boolean;
  trial_start: string | null;
  trial_end: string | null;
  trial_expired: boolean;
  days_remaining: number;
  current_plan: Plan;
  current_status: SubscriptionStatus;
}

export interface BillingInfo {
  subscription: Subscription;
  entitlements: Entitlements;
  usage: {
    chat_messages: Usage;
  };
}

export const PLAN_FEATURES = {
  free: {
    name: 'Free',
    price: '$0',
    interval: '',
    features: [
      '25 AI chat messages/month',
      'Last 30 days of transactions',
      'Basic budgeting tools',
      'Income/expense tracking',
      'Standard support',
    ],
    limits: {
      chatMessages: 25,
      bankConnections: false,
      transactionDaysLimit: 30,
    },
  },
  essential: {
    name: 'Essential',
    priceMonthly: '$4.99',
    priceYearly: '$49.99',
    interval: '/month',
    features: [
      'Unlimited AI chat messages*',
      'Connect bank accounts (Tink)',
      'Full transaction history',
      'Automatic sync',
      'Income/expense dashboard',
      'Basic notifications',
      'Standard support',
    ],
    limits: {
      chatMessages: 10000, // Fair use
      bankConnections: true,
      transactionDaysLimit: null,
    },
    popular: false,
  },
  pro: {
    name: 'Pro',
    priceMonthly: '$8.99',
    priceYearly: '$89.99',
    interval: '/month',
    features: [
      'Everything in Essential',
      'Advanced insights & analytics',
      'Smart categorization',
      'Export to CSV/PDF',
      'Budget recommendations',
      'Priority support',
      'Early access to new features',
    ],
    limits: {
      chatMessages: 10000,
      bankConnections: true,
      transactionDaysLimit: null,
    },
    popular: true,
  },
};

export class SubscriptionService {
  /**
   * Get current billing info (subscription, entitlements, usage)
   */
  static async getBillingInfo(): Promise<BillingInfo> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('billing-info', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Create checkout session for subscription
   */
  static async createCheckoutSession(
    plan: 'essential' | 'pro',
    interval: BillingInterval = 'month'
  ): Promise<{ sessionId: string; url: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const origin = window.location.origin;

    const { data, error } = await supabase.functions.invoke('billing-checkout', {
      body: {
        plan,
        interval,
        successUrl: `${origin}/billing?success=true`,
        cancelUrl: `${origin}/pricing`,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Create customer portal session for managing subscription
   */
  static async createPortalSession(): Promise<{ url: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('billing-portal', {
      body: {
        returnUrl: `${window.location.origin}/billing`,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    return data;
  }

  /**
   * Increment usage counter (e.g., for chat messages)
   */
  static async incrementUsage(metric: string, increment: number = 1): Promise<Usage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('increment_usage', {
      p_user_id: user.id,
      p_metric_name: metric,
      p_increment: increment,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Check if user has exceeded usage limit
   */
  static async checkUsageLimit(metric: string): Promise<Usage> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('check_usage_limit', {
      p_user_id: user.id,
      p_metric_name: metric,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Check if user can connect banks
   */
  static async canConnectBanks(): Promise<boolean> {
    try {
      const billingInfo = await this.getBillingInfo();
      return billingInfo.entitlements.can_connect_banks;
    } catch (error) {
      console.error('Error checking bank connection entitlement:', error);
      return false;
    }
  }

  /**
   * Get transaction date limit for current plan
   */
  static async getTransactionDaysLimit(): Promise<number | null> {
    try {
      const billingInfo = await this.getBillingInfo();
      return billingInfo.entitlements.transaction_days_limit;
    } catch (error) {
      console.error('Error getting transaction days limit:', error);
      return 30; // Default to Free tier limit
    }
  }

  /**
   * Get trial status for current user
   */
  static async getTrialStatus(): Promise<TrialStatus> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_trial_status', {
      p_user_id: user.id,
    });

    if (error) throw error;
    return data;
  }

  /**
   * Check and expire trials (admin function)
   */
  static async checkAndExpireTrials(): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('check_and_expire_trials');
    if (error) throw error;
  }
}
