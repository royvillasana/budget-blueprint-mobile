import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
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
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription and view usage statistics
          </p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Plan
              </CardTitle>
              <CardDescription className="mt-2">
                Your subscription details and features
              </CardDescription>
            </div>
            <Badge variant={planBadgeVariant} className="capitalize">
              {subscription?.plan || 'free'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="text-lg font-medium capitalize mt-1">
                  {subscription?.status || 'active'}
                </div>
              </div>

              {subscription?.plan !== 'free' && subscription?.current_period_end && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    {subscription.cancel_at_period_end ? 'Expires' : 'Renews'}
                  </div>
                  <div className="text-lg font-medium mt-1">
                    {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
                  </div>
                </div>
              )}

              {subscription?.billing_interval && (
                <div>
                  <div className="text-sm text-muted-foreground">Billing Cycle</div>
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
                  Your subscription will not renew. You'll have access until{' '}
                  {subscription.current_period_end && format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {subscription?.plan === 'free' ? (
                <Button onClick={() => navigate('/pricing')}>
                  Upgrade Plan
                </Button>
              ) : (
                <Button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Manage Subscription'
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/pricing')}>
                View All Plans
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Usage This Month
            </CardTitle>
            <CardDescription>
              Track your feature usage and limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chat Messages */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">AI Chat Messages</div>
                  <div className="text-sm text-muted-foreground">
                    {chatMessages?.count || 0} of {chatMessages?.limit || '∞'} used
                  </div>
                </div>
                {chatMessages?.reset_at && (
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Resets {format(new Date(chatMessages.reset_at), 'MMM dd')}
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
                        <p className="text-sm font-medium">Usage limit reached</p>
                        <p className="text-xs text-muted-foreground">
                          Upgrade your plan to continue using AI chat features
                        </p>
                      </div>
                      <Button size="sm" className="ml-auto" onClick={() => navigate('/pricing')}>
                        Upgrade
                      </Button>
                    </div>
                  )}

                  {!isLimitExceeded && isLimitApproaching && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm">
                        You're using {Math.round(usagePercentage)}% of your monthly limit
                      </p>
                    </div>
                  )}
                </>
              )}

              {!chatMessages?.limit && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <p className="text-sm">Unlimited usage (fair use policy applies)</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Your Features</CardTitle>
            <CardDescription>
              Features included in your current plan
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
                  Bank Connections
                </span>
              </div>

              <div className="flex items-center gap-2">
                {entitlements?.can_export ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={!entitlements?.can_export ? 'text-muted-foreground' : ''}>
                  Export to CSV/PDF
                </span>
              </div>

              <div className="flex items-center gap-2">
                {entitlements?.has_advanced_insights ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={!entitlements?.has_advanced_insights ? 'text-muted-foreground' : ''}>
                  Advanced Insights
                </span>
              </div>

              <div className="flex items-center gap-2">
                {entitlements?.has_priority_support ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={!entitlements?.has_priority_support ? 'text-muted-foreground' : ''}>
                  Priority Support
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>
                  {entitlements?.transaction_days_limit
                    ? `Last ${entitlements.transaction_days_limit} days of transactions`
                    : 'Full transaction history'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>
                  {chatMessages?.limit
                    ? `${chatMessages.limit} AI messages/month`
                    : 'Unlimited AI messages'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
