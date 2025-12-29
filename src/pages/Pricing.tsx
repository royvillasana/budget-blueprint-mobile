import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Check, Loader2 } from 'lucide-react';
import { SubscriptionService, PLAN_FEATURES } from '@/services/SubscriptionService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Pricing() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubscribe = async (plan: 'essential' | 'pro') => {
    try {
      setLoadingPlan(plan);
      const { url } = await SubscriptionService.createCheckoutSession(plan, billingInterval);

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast.error(error.message || 'Failed to start checkout');
      setLoadingPlan(null);
    }
  };

  const getPlanPrice = (plan: keyof typeof PLAN_FEATURES) => {
    const planConfig = PLAN_FEATURES[plan];

    if (plan === 'free') {
      return '$0';
    }

    if (billingInterval === 'month') {
      return planConfig.priceMonthly;
    } else {
      const monthlyEquivalent = parseFloat(planConfig.priceYearly.replace('$', '')) / 12;
      return `$${monthlyEquivalent.toFixed(2)}`;
    }
  };

  const getSavingsText = (plan: keyof typeof PLAN_FEATURES) => {
    if (plan === 'free' || billingInterval === 'month') return null;

    const planConfig = PLAN_FEATURES[plan];
    const yearlyTotal = parseFloat(planConfig.priceYearly.replace('$', ''));
    const monthlyTotal = parseFloat(planConfig.priceMonthly.replace('$', '')) * 12;
    const savings = monthlyTotal - yearlyTotal;
    const percentSaved = Math.round((savings / monthlyTotal) * 100);

    return `Save ${percentSaved}% ($${savings.toFixed(2)}/year)`;
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 space-y-8 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mt-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more. All plans include core budgeting features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={billingInterval === 'month' ? 'font-medium' : 'text-muted-foreground'}>
              Monthly
            </span>
            <Switch
              checked={billingInterval === 'year'}
              onCheckedChange={(checked) => setBillingInterval(checked ? 'year' : 'month')}
            />
            <span className={billingInterval === 'year' ? 'font-medium' : 'text-muted-foreground'}>
              Yearly
            </span>
            {billingInterval === 'year' && (
              <Badge variant="secondary" className="ml-2">
                Save up to 17%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold">$0</div>
                <div className="text-sm text-muted-foreground mt-1">Forever</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Current Plan
              </Button>

              <ul className="space-y-3 mt-6">
                {PLAN_FEATURES.free.features.map((feature, index) => (
                  <li key={index} className="flex gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Essential Plan */}
          <Card className="relative border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-2xl">Essential</CardTitle>
              <CardDescription>For serious budgeters</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold">{getPlanPrice('essential')}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  per month{billingInterval === 'year' && ', billed annually'}
                </div>
                {getSavingsText('essential') && (
                  <Badge variant="secondary" className="mt-2">
                    {getSavingsText('essential')}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                onClick={() => handleSubscribe('essential')}
                disabled={loadingPlan === 'essential'}
              >
                {loadingPlan === 'essential' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Subscribe to Essential'
                )}
              </Button>

              <ul className="space-y-3 mt-6">
                {PLAN_FEATURES.essential.features.map((feature, index) => (
                  <li key={index} className="flex gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-muted-foreground mt-4">
                *Fair use policy: 10,000 messages/month
              </p>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative">
            {PLAN_FEATURES.pro.popular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>For power users & businesses</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold">{getPlanPrice('pro')}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  per month{billingInterval === 'year' && ', billed annually'}
                </div>
                {getSavingsText('pro') && (
                  <Badge variant="secondary" className="mt-2">
                    {getSavingsText('pro')}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                onClick={() => handleSubscribe('pro')}
                disabled={loadingPlan === 'pro'}
              >
                {loadingPlan === 'pro' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Subscribe to Pro'
                )}
              </Button>

              <ul className="space-y-3 mt-6">
                {PLAN_FEATURES.pro.features.map((feature, index) => (
                  <li key={index} className="flex gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center space-y-4">
          <h3 className="text-2xl font-semibold">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8 text-left">
            <div className="space-y-2">
              <h4 className="font-medium">Can I cancel anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! Cancel anytime from your billing dashboard. You'll keep access until the end of your billing period.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">What payment methods do you accept?</h4>
              <p className="text-sm text-muted-foreground">
                We accept all major credit/debit cards, Apple Pay, and Google Pay via Stripe.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Is my financial data secure?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! We use bank-level encryption and never store your bank login credentials. All bank connections are read-only.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Can I upgrade or downgrade later?</h4>
              <p className="text-sm text-muted-foreground">
                Absolutely! Change plans anytime. Upgrades take effect immediately, downgrades at the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
