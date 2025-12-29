import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, TrendingUp, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSubscription, useUsage } from '@/hooks/useSubscription';
import { SubscriptionService } from '@/services/SubscriptionService';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Billing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { config } = useApp();
  const t = translations[config.language];
  const { billingInfo, loading, subscription, entitlements } = useSubscription();
  const { chatMessages } = useUsage();
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription activated! Welcome to your new plan.');
      // Remove query param
      navigate('/billing', { replace: true });
    }
  }, [searchParams, navigate]);

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      const { url } = await SubscriptionService.createPortalSession();
      window.location.href = url;
    } catch (error: any) {
      console.error('Error opening portal:', error);
      toast.error(error.message || 'Failed to open billing portal');
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </>
    );
  }

  const planBadgeVariant = subscription?.status === 'active' || subscription?.status === 'trialing'
    ? 'default'
    : 'destructive';

  const usagePercentage = chatMessages?.limit && chatMessages.limit > 0
    ? Math.min(100, (chatMessages.count / chatMessages.limit) * 100)
    : 0;

  const isLimitApproaching = usagePercentage >= 80;
  const isLimitExceeded = chatMessages?.has_exceeded;

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.billing.title}</h1>
          <p className="text-muted-foreground mt-2">
            {t.billing.subtitle}
          </p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t.billing.currentPlan}
              </CardTitle>
              <CardDescription className="mt-2">
                {t.billing.planDetails}
              </CardDescription>
            </div>
            <Badge variant={planBadgeVariant} className="capitalize">
              {subscription?.plan || 'free'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">{t.billing.status}</div>
                <div className="text-lg font-medium capitalize mt-1">
                  {subscription?.status || 'active'}
                </div>
              </div>

              {subscription?.plan !== 'free' && subscription?.current_period_end && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    {subscription.cancel_at_period_end ? t.billing.expires : t.billing.renews}
                  </div>
                  <div className="text-lg font-medium mt-1">
                    {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
                  </div>
                </div>
              )}

              {subscription?.billing_interval && (
                <div>
                  <div className="text-sm text-muted-foreground">{t.billing.billingCycle}</div>
                  <div className="text-lg font-medium capitalize mt-1">
                    {subscription.billing_interval}ly
                  </div>
                </div>
              )}
            </div>

            {subscription?.cancel_at_period_end && (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm">
                  {t.billing.cancelWarning}{' '}
                  {subscription.current_period_end && format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {subscription?.plan === 'free' ? (
                <Button onClick={() => navigate('/pricing')}>
                  {t.billing.upgradePlan}
                </Button>
              ) : (
                <Button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.billing.loading}
                    </>
                  ) : (
                    t.billing.manageSub
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/pricing')}>
                {t.billing.viewAllPlans}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t.billing.usageTitle}
            </CardTitle>
            <CardDescription>
              {t.billing.usageSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chat Messages */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{t.billing.aiMessages}</div>
                  <div className="text-sm text-muted-foreground">
                    {chatMessages?.count || 0} {t.billing.used} {chatMessages?.limit || '∞'}
                  </div>
                </div>
                {chatMessages?.reset_at && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {t.billing.resets} {format(new Date(chatMessages.reset_at), 'MMM dd')}
                  </div>
                )}
              </div>

              {chatMessages?.limit && chatMessages.limit > 0 && (
                <>
                  <Progress
                    value={usagePercentage}
                    className={`h-2 ${isLimitExceeded ? 'bg-red-200' : isLimitApproaching ? 'bg-yellow-200' : ''}`}
                  />

                  {isLimitExceeded && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-sm font-medium">{t.billing.limitReached}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.billing.limitReachedDesc}
                        </p>
                      </div>
                      <Button size="sm" className="ml-auto" onClick={() => navigate('/pricing')}>
                        {t.billing.upgrade}
                      </Button>
                    </div>
                  )}

                  {!isLimitExceeded && isLimitApproaching && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm">
                        {t.billing.approaching} {Math.round(usagePercentage)}% {t.billing.approachingLimit}
                      </p>
                    </div>
                  )}
                </>
              )}

              {!chatMessages?.limit && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <p className="text-sm">{t.billing.unlimited}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>{t.billing.yourFeatures}</CardTitle>
            <CardDescription>
              {t.billing.featuresIncluded}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {entitlements?.can_connect_banks ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={!entitlements?.can_connect_banks ? 'text-muted-foreground' : ''}>
                  {t.billing.bankConnections}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {entitlements?.can_export ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={!entitlements?.can_export ? 'text-muted-foreground' : ''}>
                  {t.billing.exportData}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {entitlements?.has_advanced_insights ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={!entitlements?.has_advanced_insights ? 'text-muted-foreground' : ''}>
                  {t.billing.advancedInsights}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {entitlements?.has_priority_support ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={!entitlements?.has_priority_support ? 'text-muted-foreground' : ''}>
                  {t.billing.prioritySupport}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>
                  {entitlements?.transaction_days_limit
                    ? `${t.billing.lastDays} ${entitlements.transaction_days_limit} ${t.billing.daysTransactions}`
                    : t.billing.transactionHistory}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>
                  {chatMessages?.limit
                    ? `${chatMessages.limit} ${t.billing.aiMessagesMonth}`
                    : t.billing.unlimitedMessages}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
