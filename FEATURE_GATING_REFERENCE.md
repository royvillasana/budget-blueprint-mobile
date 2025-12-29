# Feature Gating Implementation Reference

This guide shows how to implement the remaining feature gates throughout your app.

---

## 1. Chat Message Usage Tracking

### Implementation in AI Chat Component

**File**: `src/components/AIChat.tsx` (or wherever you handle chat messages)

```typescript
import { useUsage } from '@/hooks/useSubscription';
import { UsageLimitPrompt } from '@/components/UpgradePrompt';
import { useState } from 'react';

export function AIChat() {
  const { chatMessages, incrementChatUsage, loading } = useUsage();
  const [showLimitPrompt, setShowLimitPrompt] = useState(false);

  const handleSendMessage = async (message: string) => {
    // Check if user has exceeded limit BEFORE sending
    if (chatMessages?.has_exceeded) {
      setShowLimitPrompt(true);
      return;
    }

    try {
      // Increment usage counter
      await incrementChatUsage();

      // Send message to AI (your existing logic)
      await sendMessageToAI(message);

    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error
    }
  };

  return (
    <div>
      {/* Your chat UI */}

      {/* Show usage warning when approaching limit */}
      {chatMessages && chatMessages.remaining !== null && chatMessages.remaining <= 5 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 mb-4">
          <p className="text-sm">
            ⚠️ You have {chatMessages.remaining} messages remaining this month.
            <a href="/pricing" className="underline ml-1">Upgrade</a> for unlimited messages.
          </p>
        </div>
      )}

      {/* Usage limit dialog */}
      <UsageLimitPrompt
        open={showLimitPrompt}
        onOpenChange={setShowLimitPrompt}
        current={chatMessages?.count || 0}
        limit={chatMessages?.limit || 25}
        metric="AI chat messages"
      />
    </div>
  );
}
```

### Alternative: Server-Side Enforcement

Add to your AI chat Edge Function:

```typescript
// In your chat Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export default async function handler(req: Request) {
  const { message } = await req.json();
  const authHeader = req.headers.get('Authorization')!;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

  // Check usage BEFORE processing
  const { data: usage, error } = await supabase.rpc('check_usage_limit', {
    p_user_id: user.id,
    p_metric_name: 'chat_messages',
  });

  if (usage?.has_exceeded) {
    return new Response(JSON.stringify({
      error: 'Usage limit exceeded',
      upgrade_required: true,
      usage
    }), {
      status: 429, // Too Many Requests
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Increment usage
  await supabase.rpc('increment_usage', {
    p_user_id: user.id,
    p_metric_name: 'chat_messages',
    p_increment: 1,
  });

  // Process message...
  const response = await processAIMessage(message);

  return new Response(JSON.stringify({ response }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

---

## 2. Transaction Date Restrictions (Free Tier)

### Implementation in Transaction Queries

**File**: `src/services/FinancialDataService.ts` (or wherever you query transactions)

```typescript
import { SubscriptionService } from '@/services/SubscriptionService';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

export class FinancialDataService {
  /**
   * Get transactions with subscription-based date filtering
   */
  static async getTransactions(month?: number, year?: number) {
    // Get user's transaction days limit
    const daysLimit = await SubscriptionService.getTransactionDaysLimit();

    let query = supabase
      .from('bank_transactions')
      .select('*');

    // Apply date restriction for Free users
    if (daysLimit !== null) {
      const cutoffDate = subDays(new Date(), daysLimit);
      query = query.gte('booking_date', format(cutoffDate, 'yyyy-MM-dd'));
    }

    // Apply additional filters if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query = query
        .gte('booking_date', format(startDate, 'yyyy-MM-dd'))
        .lte('booking_date', format(endDate, 'yyyy-MM-dd'));
    }

    const { data, error } = await query.order('booking_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get monthly transactions with Free tier restrictions
   */
  static async getMonthlyTransactions(monthTable: string) {
    const daysLimit = await SubscriptionService.getTransactionDaysLimit();

    let query = supabase
      .from(monthTable)
      .select('*');

    // Free users only see last 30 days
    if (daysLimit !== null) {
      const cutoffDate = subDays(new Date(), daysLimit);
      query = query.gte('date', format(cutoffDate, 'yyyy-MM-dd'));
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get dashboard aggregates with date restrictions
   */
  static async getDashboardData() {
    const daysLimit = await SubscriptionService.getTransactionDaysLimit();

    const startDate = daysLimit !== null
      ? subDays(new Date(), daysLimit)
      : subDays(new Date(), 365); // Last year for paid users

    // Query transactions within allowed window
    const { data: transactions } = await supabase
      .from('bank_transactions')
      .select('amount, booking_date, transaction_type')
      .gte('booking_date', format(startDate, 'yyyy-MM-dd'))
      .order('booking_date', { ascending: false });

    // Calculate aggregates
    const totalIncome = transactions
      ?.filter(t => t.transaction_type === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    const totalExpenses = transactions
      ?.filter(t => t.transaction_type === 'DEBIT')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: transactions?.length || 0,
      dateRangeStart: startDate,
      dateRangeEnd: new Date(),
      isRestricted: daysLimit !== null,
    };
  }
}
```

### UI Indicator for Free Users

Add to Dashboard or Transactions page:

```typescript
import { useEntitlements } from '@/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function TransactionsPage() {
  const { transactionDaysLimit } = useEntitlements();
  const navigate = useNavigate();

  return (
    <div>
      {transactionDaysLimit !== null && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Showing last {transactionDaysLimit} days of transactions (Free plan).
            </span>
            <Button size="sm" onClick={() => navigate('/pricing')}>
              Upgrade for Full History
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Your transactions list */}
    </div>
  );
}
```

---

## 3. Export Feature Gate (Pro Only)

**File**: Any component with export functionality

```typescript
import { useEntitlements } from '@/hooks/useSubscription';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { Download } from 'lucide-react';

export function ExportButton() {
  const { canExport } = useEntitlements();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleExport = () => {
    if (!canExport) {
      setShowUpgrade(true);
      return;
    }

    // Perform export
    exportToCSV();
  };

  return (
    <>
      <Button onClick={handleExport} variant="outline" className="gap-2">
        <Download className="h-4 w-4" />
        Export {!canExport && '(Pro)'}
      </Button>

      <UpgradePrompt
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        feature="Export to CSV/PDF"
        description="Export your financial data to CSV or PDF formats. Available on Pro plan."
      />
    </>
  );
}
```

---

## 4. Advanced Insights Gate (Pro Only)

```typescript
import { useEntitlements } from '@/hooks/useSubscription';

export function AdvancedInsights() {
  const { hasAdvancedInsights } = useEntitlements();

  if (!hasAdvancedInsights) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-medium mb-2">Advanced Insights (Pro)</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get AI-powered spending analysis, category trends, and budget recommendations.
          </p>
          <Button onClick={() => navigate('/pricing')}>
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Show actual advanced insights */}
    </div>
  );
}
```

---

## 5. Backend Enforcement for Tink Connections

**File**: `supabase/functions/tink-create-connection/index.ts`

Add this check at the beginning:

```typescript
// After auth check
const { data: entitlements } = await supabase
  .from('user_entitlements')
  .select('can_connect_banks')
  .eq('user_id', user.id)
  .single();

if (!entitlements?.can_connect_banks) {
  return new Response(JSON.stringify({
    error: 'Bank connections require Essential or Pro plan',
    upgrade_required: true,
  }), {
    status: 403,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Continue with connection logic...
```

---

## 6. Complete Usage Tracking Example

### Hook Usage in Chat Component

```typescript
import { useUsage } from '@/hooks/useSubscription';
import { useEffect } from 'react';

export function ChatInterface() {
  const { chatMessages, refetch } = useUsage();

  // Refresh usage data when component mounts
  useEffect(() => {
    refetch();
  }, []);

  // Show usage in UI
  const usageDisplay = chatMessages?.limit
    ? `${chatMessages.count}/${chatMessages.limit} messages`
    : `${chatMessages?.count || 0} messages (unlimited)`;

  return (
    <div>
      <div className="text-xs text-muted-foreground">
        {usageDisplay}
      </div>
      {/* Rest of chat UI */}
    </div>
  );
}
```

---

## 7. Testing Feature Gates

### Manual Testing Checklist

**Free User:**
- [ ] Cannot click "Connect Bank" (shows upgrade prompt)
- [ ] Can send 25 chat messages, then blocked
- [ ] Dashboard shows "Last 30 days" notice
- [ ] Transaction queries filtered to 30 days
- [ ] Export button shows "(Pro)" and prompts upgrade
- [ ] Advanced insights shows locked card

**Essential User:**
- [ ] Can connect banks
- [ ] Can send 10,000+ messages (fair use)
- [ ] Dashboard shows full history
- [ ] No transaction date restrictions
- [ ] Export still shows "(Pro)" and prompts
- [ ] Advanced insights still locked

**Pro User:**
- [ ] All features unlocked
- [ ] Can export to CSV/PDF
- [ ] Advanced insights visible
- [ ] All other Essential features work

---

## 8. Database Queries for Testing

```sql
-- Set a user to Free plan
UPDATE subscriptions SET plan = 'free' WHERE user_id = '<uuid>';

-- Set a user to Essential
UPDATE subscriptions
SET plan = 'essential', status = 'active'
WHERE user_id = '<uuid>';

-- Set a user to Pro
UPDATE subscriptions
SET plan = 'pro', status = 'active'
WHERE user_id = '<uuid>';

-- Check current entitlements
SELECT * FROM user_entitlements WHERE user_id = '<uuid>';

-- Reset usage for testing
DELETE FROM usage_meters WHERE user_id = '<uuid>';

-- Manually set usage to 24 (one below limit)
INSERT INTO usage_meters (user_id, metric_name, count, period_start, period_end, reset_at)
VALUES (
  '<uuid>',
  'chat_messages',
  24,
  date_trunc('month', now()),
  date_trunc('month', now()) + interval '1 month',
  date_trunc('month', now()) + interval '1 month'
);
```

---

## Summary

All feature gates follow the same pattern:

1. **Check entitlement** using `useEntitlements()` hook
2. **Show upgrade prompt** if user doesn't have access
3. **Enforce on backend** for critical features (bank connections, API calls)
4. **Track usage** for metered features (chat messages)
5. **Filter data** based on plan (transaction date restrictions)

This ensures a secure, user-friendly subscription experience!
