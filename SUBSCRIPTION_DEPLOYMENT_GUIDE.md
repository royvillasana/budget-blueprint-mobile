# Subscription System Deployment Guide

## 🎯 Overview

This guide covers deploying the complete subscription and billing system with Stripe integration for the Budget Blueprint app.

**Tiers Implemented:**
- **Free**: 25 AI messages/month, last 30 days transactions, no bank connections
- **Essential**: $4.99/month, unlimited messages, bank connections, full transaction history
- **Pro**: $8.99/month, everything + exports, advanced insights, priority support

---

## 📋 Prerequisites

### 1. Stripe Account Setup
1. Create a Stripe account at https://stripe.com (use your existing account if you have one)
2. Complete business verification for live mode
3. Note your **Publishable Key** and **Secret Key** (both test and live)

### 2. Create Stripe Products

**In Stripe Dashboard → Products:**

Create 4 products with exact pricing:

**Product 1: Essential Monthly**
- Name: "Essential Plan"
- Description: "Monthly subscription for Essential features"
- Pricing: $4.99/month (recurring)
- Copy the **Price ID** (starts with `price_`)

**Product 2: Essential Yearly**
- Name: "Essential Plan (Annual)"
- Description: "Annual subscription for Essential features"
- Pricing: $49.99/year (recurring)
- Copy the **Price ID**

**Product 3: Pro Monthly**
- Name: "Pro Plan"
- Description: "Monthly subscription for Pro features"
- Pricing: $8.99/month (recurring)
- Copy the **Price ID**

**Product 4: Pro Yearly**
- Name: "Pro Plan (Annual)"
- Description: "Annual subscription for Pro features"
- Pricing: $89.99/year (recurring)
- Copy the **Price ID**

### 3. Configure Stripe Billing Portal

1. Go to **Settings → Billing → Customer Portal**
2. Enable the customer portal
3. Configure these settings:
   - **Allow customers to**: Update payment method, View invoices, Cancel subscription
   - **Cancellation behavior**: Cancel at period end (recommended)
   - **Proration**: Enable proration for upgrades/downgrades
4. Save configuration

---

## 🔧 Environment Variables

### Required Supabase Secrets

Set these in Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```bash
# Stripe Keys (Test Mode - for development)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Price IDs (Test Mode)
STRIPE_PRICE_ESSENTIAL_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ESSENTIAL_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxx

# For Production, use live keys:
# STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
# STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
# STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
# (and corresponding live price IDs)
```

**How to set secrets:**

```bash
# Option 1: Via Supabase CLI
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
supabase secrets set STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
supabase secrets set STRIPE_PRICE_ESSENTIAL_MONTHLY=price_xxxxx
supabase secrets set STRIPE_PRICE_ESSENTIAL_YEARLY=price_xxxxx
supabase secrets set STRIPE_PRICE_PRO_MONTHLY=price_xxxxx
supabase secrets set STRIPE_PRICE_PRO_YEARLY=price_xxxxx

# Option 2: Via Supabase Dashboard
# Go to Project Settings → Edge Functions → Add secret
```

---

## 🗄️ Database Migration

### Step 1: Run Migration

```bash
# Push database migration
supabase db push

# Or apply specific migration
supabase migration up --file 20251229000001_create_subscription_system.sql
```

### Step 2: Verify Tables

Run in Supabase SQL Editor:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('subscriptions', 'usage_meters', 'billing_events');

-- Verify view
SELECT * FROM user_entitlements LIMIT 1;

-- Test functions
SELECT check_usage_limit(auth.uid(), 'chat_messages');
```

---

## 🚀 Deploy Edge Functions

### Deploy All Billing Functions

```bash
# Deploy all at once
supabase functions deploy billing-checkout
supabase functions deploy billing-portal
supabase functions deploy billing-info
supabase functions deploy stripe-webhook

# Verify deployment
supabase functions list
```

### Get Function URLs

```bash
# Your functions will be available at:
# https://<project-ref>.supabase.co/functions/v1/billing-checkout
# https://<project-ref>.supabase.co/functions/v1/billing-portal
# https://<project-ref>.supabase.co/functions/v1/billing-info
# https://<project-ref>.supabase.co/functions/v1/stripe-webhook
```

---

## 🔗 Configure Stripe Webhook

### Step 1: Create Webhook Endpoint

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   ```
   https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook
   ```
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Set it as `STRIPE_WEBHOOK_SECRET` in Supabase secrets

### Step 2: Test Webhook

```bash
# Use Stripe CLI to test locally (optional)
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Or test via Stripe Dashboard → Webhooks → Send test webhook
```

---

## 🧪 Testing

### Test Checkout Flow

1. **Development (Test Mode)**:
   ```bash
   # Use Stripe test cards
   # Card: 4242 4242 4242 4242
   # Expiry: Any future date
   # CVC: Any 3 digits
   ```

2. **Test Essential Subscription**:
   - Navigate to `/pricing`
   - Click "Subscribe to Essential"
   - Complete checkout with test card
   - Verify redirect to `/billing?success=true`
   - Check database: `SELECT * FROM subscriptions WHERE user_id = auth.uid();`

3. **Test Free User Restrictions**:
   - Create new user (auto-gets Free plan)
   - Try to connect bank → Should show upgrade prompt
   - Send 26 chat messages → Should hit limit and show upgrade CTA

4. **Test Customer Portal**:
   - Go to `/billing`
   - Click "Manage Subscription"
   - Verify Stripe portal opens
   - Test cancel subscription → Verify `cancel_at_period_end` updates

### Test Webhooks

```bash
# Send test webhook from Stripe Dashboard
# Or use Stripe CLI:
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```

### Verify Database Updates

```sql
-- Check subscription after webhook
SELECT * FROM subscriptions WHERE plan != 'free';

-- Check billing events log
SELECT * FROM billing_events ORDER BY created_at DESC LIMIT 10;

-- Check user entitlements
SELECT * FROM user_entitlements WHERE user_id = '<user-uuid>';
```

---

## 🎨 Frontend Integration

### Install Dependencies

Your package.json already has required dependencies. If missing:

```bash
npm install sonner date-fns
```

### Update Navigation

Add links to pricing/billing in your Header component:

```typescript
// In src/components/Header.tsx or navigation
<Link to="/pricing">Pricing</Link>
<Link to="/billing">Billing</Link>
```

---

## 🔒 Security Checklist

- ✅ Webhook signature verification enabled
- ✅ RLS policies on all subscription tables
- ✅ Service role key used server-side only
- ✅ Never expose Stripe secret key to frontend
- ✅ HTTPS enforced on webhook endpoint
- ✅ Idempotency keys for webhook processing
- ✅ Error handling and logging in place

---

## 📊 Monitoring

### Set Up Alerts

**Supabase Dashboard:**
- Monitor Edge Function errors
- Track webhook failures in `billing_events` table

**Stripe Dashboard:**
- Set up alerts for failed payments
- Monitor subscription churn
- Track MRR (Monthly Recurring Revenue)

### Key Metrics Queries

```sql
-- Active paying subscribers
SELECT COUNT(*) FROM subscriptions
WHERE plan IN ('essential', 'pro') AND status = 'active';

-- MRR calculation
SELECT
  plan,
  COUNT(*) as subscribers,
  CASE plan
    WHEN 'essential' THEN COUNT(*) * 4.99
    WHEN 'pro' THEN COUNT(*) * 8.99
    ELSE 0
  END as mrr
FROM subscriptions
WHERE status = 'active' AND billing_interval = 'month'
GROUP BY plan;

-- Failed webhook events
SELECT * FROM billing_events
WHERE processed = false
ORDER BY created_at DESC;

-- High usage users (approaching limits)
SELECT
  u.email,
  um.metric_name,
  um.count,
  ue.chat_message_limit
FROM usage_meters um
JOIN subscriptions s ON um.user_id = s.user_id
JOIN auth.users u ON um.user_id = u.id
JOIN user_entitlements ue ON um.user_id = ue.user_id
WHERE um.metric_name = 'chat_messages'
  AND um.count > (ue.chat_message_limit * 0.8);
```

---

## 🚨 Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook endpoint**:
   ```bash
   curl https://<project-ref>.supabase.co/functions/v1/stripe-webhook
   ```

2. **Verify secret is set**:
   ```bash
   supabase secrets list | grep STRIPE_WEBHOOK_SECRET
   ```

3. **Check Stripe logs**:
   - Stripe Dashboard → Developers → Webhooks → [Your endpoint] → Logs

4. **View function logs**:
   ```bash
   supabase functions logs stripe-webhook --limit 50
   ```

### Subscription Not Updating

1. **Check billing_events table**:
   ```sql
   SELECT * FROM billing_events
   WHERE event_type LIKE '%subscription%'
   ORDER BY created_at DESC LIMIT 10;
   ```

2. **Verify webhook delivered**:
   - Check Stripe Dashboard webhook logs
   - Look for 200 OK responses

3. **Check for errors**:
   ```sql
   SELECT * FROM billing_events WHERE error_message IS NOT NULL;
   ```

### Users Stuck on Free Plan

```sql
-- Manually upgrade a user (emergency only)
UPDATE subscriptions
SET
  plan = 'essential',
  status = 'active',
  billing_interval = 'month',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 month'
WHERE user_id = '<user-uuid>';
```

---

## 🌍 Production Deployment

### Before Going Live

1. **Switch to Stripe Live Mode**:
   - Use live API keys (starts with `sk_live_` and `pk_live_`)
   - Use live Price IDs
   - Update webhook URL with live signing secret

2. **Update Environment Variables**:
   ```bash
   # Set live keys in production
   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
   supabase secrets set STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   # ... etc
   ```

3. **Test with Real Card**:
   - Make a real $4.99 subscription
   - Verify end-to-end flow
   - Test cancellation
   - Refund the test charge

4. **Enable Tax Collection** (if applicable):
   - Stripe Dashboard → Settings → Tax
   - Enable Stripe Tax for automatic calculation

5. **Set up Bank Account** for payouts:
   - Stripe Dashboard → Settings → Payouts

---

## 📝 Post-Deployment Tasks

### Week 1
- [ ] Monitor webhook delivery (should be 100%)
- [ ] Check for failed subscriptions
- [ ] Verify all events in `billing_events` are processed
- [ ] Test actual upgrade/downgrade flows

### Month 1
- [ ] Review usage patterns
- [ ] Adjust fair use limits if needed
- [ ] Analyze conversion rates (free → paid)
- [ ] Gather user feedback on pricing

### Ongoing
- [ ] Monitor churn rate
- [ ] Track MRR growth
- [ ] Review failed payments
- [ ] Update features as plans evolve

---

## 🆘 Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions
- **This Codebase**: See inline comments in Edge Functions

---

## ✅ Deployment Checklist

**Database:**
- [ ] Migration applied successfully
- [ ] Tables created (subscriptions, usage_meters, billing_events)
- [ ] View created (user_entitlements)
- [ ] Functions work (check_usage_limit, increment_usage)
- [ ] RLS policies enabled

**Stripe:**
- [ ] Products created (Essential, Pro, Monthly, Yearly)
- [ ] Prices configured ($4.99, $8.99, $49.99, $89.99)
- [ ] Webhook endpoint added
- [ ] Webhook events selected (6 events)
- [ ] Webhook secret copied to Supabase
- [ ] Billing portal configured

**Supabase:**
- [ ] All secrets set (7 secrets)
- [ ] Edge Functions deployed (4 functions)
- [ ] Functions respond with 200 OK
- [ ] Webhook URL accessible

**Frontend:**
- [ ] Routes added (/pricing, /billing)
- [ ] Components deployed
- [ ] Feature gates working
- [ ] Upgrade prompts showing

**Testing:**
- [ ] Test checkout flow (works end-to-end)
- [ ] Test webhook processing (events update DB)
- [ ] Test customer portal (can cancel)
- [ ] Test free tier limits (chat limit enforced)
- [ ] Test bank connection gate (blocked for Free)

**Production:**
- [ ] Live keys configured
- [ ] Real transaction tested
- [ ] Monitoring set up
- [ ] Tax configured (if needed)
- [ ] Bank account added for payouts

---

## 🎉 You're Ready!

Once all checklist items are complete, your subscription system is live and ready to accept payments!

**Next Steps:**
1. Announce pricing to users
2. Add upgrade CTAs throughout the app
3. Monitor first subscriptions closely
4. Iterate based on user feedback

Good luck with your launch! 🚀
