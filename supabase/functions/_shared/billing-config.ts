// Billing configuration and price mappings

export const STRIPE_CONFIG = {
  // Price IDs - Replace with your actual Stripe Price IDs after creating them in Stripe Dashboard
  PRICES: {
    essential_monthly: Deno.env.get('STRIPE_PRICE_ESSENTIAL_MONTHLY') || 'price_essential_monthly',
    essential_yearly: Deno.env.get('STRIPE_PRICE_ESSENTIAL_YEARLY') || 'price_essential_yearly',
    pro_monthly: Deno.env.get('STRIPE_PRICE_PRO_MONTHLY') || 'price_pro_monthly',
    pro_yearly: Deno.env.get('STRIPE_PRICE_PRO_YEARLY') || 'price_pro_yearly',
  },

  // Webhook secret
  WEBHOOK_SECRET: Deno.env.get('STRIPE_WEBHOOK_SECRET') || '',

  // API Key
  SECRET_KEY: Deno.env.get('STRIPE_SECRET_KEY') || '',
};

export const PLAN_CONFIGS = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      chatMessages: 25,
      bankConnections: false,
      transactionDaysLimit: 30,
      exports: false,
      advancedInsights: false,
      prioritySupport: false,
    },
  },
  essential: {
    name: 'Essential',
    priceMonthly: 4.99,
    priceYearly: 49.99, // ~$4.17/month
    stripePriceIdMonthly: STRIPE_CONFIG.PRICES.essential_monthly,
    stripePriceIdYearly: STRIPE_CONFIG.PRICES.essential_yearly,
    features: {
      chatMessages: 10000, // Fair use limit
      bankConnections: true,
      transactionDaysLimit: null, // Unlimited
      exports: false,
      advancedInsights: false,
      prioritySupport: false,
    },
  },
  pro: {
    name: 'Pro',
    priceMonthly: 8.99,
    priceYearly: 89.99, // ~$7.49/month
    stripePriceIdMonthly: STRIPE_CONFIG.PRICES.pro_monthly,
    stripePriceIdYearly: STRIPE_CONFIG.PRICES.pro_yearly,
    features: {
      chatMessages: 10000, // Fair use limit
      bankConnections: true,
      transactionDaysLimit: null, // Unlimited
      exports: true,
      advancedInsights: true,
      prioritySupport: true,
    },
  },
};

export type Plan = keyof typeof PLAN_CONFIGS;
export type BillingInterval = 'month' | 'year';

export function getPriceId(plan: Plan, interval: BillingInterval): string | null {
  if (plan === 'free') return null;

  const config = PLAN_CONFIGS[plan];
  if (interval === 'month') {
    return config.stripePriceIdMonthly;
  } else {
    return config.stripePriceIdYearly;
  }
}

export function getPlanFromPriceId(priceId: string): { plan: Plan; interval: BillingInterval } | null {
  const { PRICES } = STRIPE_CONFIG;

  if (priceId === PRICES.essential_monthly) return { plan: 'essential', interval: 'month' };
  if (priceId === PRICES.essential_yearly) return { plan: 'essential', interval: 'year' };
  if (priceId === PRICES.pro_monthly) return { plan: 'pro', interval: 'month' };
  if (priceId === PRICES.pro_yearly) return { plan: 'pro', interval: 'year' };

  return null;
}
