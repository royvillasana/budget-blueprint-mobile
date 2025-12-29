import { useState } from 'react';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';
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
  const { config } = useApp();
  const t = translations[config.language];

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
            {t.pricing.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.pricing.subtitle}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={billingInterval === 'month' ? 'font-medium' : 'text-muted-foreground'}>
              {t.pricing.monthly}
            </span>
            <Switch
              checked={billingInterval === 'year'}
              onCheckedChange={(checked) => setBillingInterval(checked ? 'year' : 'month')}
            />
            <span className={billingInterval === 'year' ? 'font-medium' : 'text-muted-foreground'}>
              {t.pricing.yearly}
            </span>
            {billingInterval === 'year' && (
              <Badge variant="secondary" className="ml-2">
                {t.pricing.saveUpTo} 17%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">{t.pricing.free}</CardTitle>
              <CardDescription>{t.pricing.freeDesc}</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold">$0</div>
                <div className="text-sm text-muted-foreground mt-1">{t.pricing.forever}</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                {t.pricing.currentPlan}
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
              <CardTitle className="text-2xl">{t.pricing.essential}</CardTitle>
              <CardDescription>{t.pricing.essentialDesc}</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold">{getPlanPrice('essential')}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t.pricing.perMonth}{billingInterval === 'year' && t.pricing.billedAnnually}
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
                    {t.pricing.loading}
                  </>
                ) : (
                  `${t.pricing.subscribeTo} ${t.pricing.essential}`
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
                {t.pricing.fairUse}
              </p>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative">
            {PLAN_FEATURES.pro.popular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <Badge className="bg-primary text-primary-foreground">
                  {t.pricing.mostPopular}
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{t.pricing.pro}</CardTitle>
              <CardDescription>{t.pricing.proDesc}</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold">{getPlanPrice('pro')}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t.pricing.perMonth}{billingInterval === 'year' && t.pricing.billedAnnually}
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
                    {t.pricing.loading}
                  </>
                ) : (
                  `${t.pricing.subscribeTo} ${t.pricing.pro}`
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
          <h3 className="text-2xl font-semibold">{t.pricing.faqTitle}</h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8 text-left">
            <div className="space-y-2">
              <h4 className="font-medium">{t.pricing.faq1Q}</h4>
              <p className="text-sm text-muted-foreground">
                {t.pricing.faq1A}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">{t.pricing.faq2Q}</h4>
              <p className="text-sm text-muted-foreground">
                {t.pricing.faq2A}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">{t.pricing.faq3Q}</h4>
              <p className="text-sm text-muted-foreground">
                {t.pricing.faq3A}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">{t.pricing.faq4Q}</h4>
              <p className="text-sm text-muted-foreground">
                {t.pricing.faq4A}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
