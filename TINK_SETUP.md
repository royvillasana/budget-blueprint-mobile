# Tink Open Banking Integration - Setup Guide

## Overview

Successfully deployed Tink integration with 6 Edge Functions for Open Banking in Spain (and all Europe).

## ✅ Deployed Edge Functions

All functions deployed to: `https://gqqlqxmiqjzusyivpkzm.supabase.co/functions/v1/`

1. **tink-list-providers** - List available banks for a market
2. **tink-create-connection** - Create Tink user and get authorization link
3. **tink-handle-callback** - Handle callback after bank authorization
4. **tink-sync-transactions** - Fetch transactions from Tink
5. **tink-import-transactions** - Import transactions to monthly budget
6. **tink-delete-connection** - Delete bank connection (GDPR)

## 🔑 Set Up Tink Credentials

You mentioned you already have a Tink token. To complete the setup, you need to set your Tink credentials as Supabase secrets:

```bash
# Set your Tink client ID
supabase secrets set TINK_CLIENT_ID=your_tink_client_id

# Set your Tink client secret
supabase secrets set TINK_CLIENT_SECRET=your_tink_client_secret
```

### Where to Find Your Tink Credentials

1. Log in to your Tink Console: https://console.tink.com/
2. Navigate to your app settings
3. Copy your **Client ID** and **Client Secret**

## 📊 Database Schema

The database migrations have already been applied:

- **gocardless_tokens** - Stores Tink OAuth tokens (reusing existing table)
- **bank_requisitions** - Stores bank connections and Tink user IDs
- **bank_accounts** - Stores connected bank accounts
- **bank_transactions** - Stores fetched transactions
- **bank_sync_logs** - Audit trail for syncs
- **monthly_transactions_[month]** - Budget transactions with `bank_transaction_id` link
- **monthly_income_[month]** - Income transactions with `bank_transaction_id` link

## 🔄 Integration Flow

### 1. List Available Banks

```typescript
// Frontend call
const response = await fetch(
  'https://gqqlqxmiqjzusyivpkzm.supabase.co/functions/v1/tink-list-providers',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ market: 'ES' })
  }
)

const { providers } = await response.json()
// providers = [{ name, displayName, logo, ... }, ...]
```

### 2. Create Connection & Get Authorization Link

```typescript
const response = await fetch(
  'https://gqqlqxmiqjzusyivpkzm.supabase.co/functions/v1/tink-create-connection',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      redirectUrl: 'http://localhost:8080/banking/callback',
      market: 'ES',
      locale: 'es_ES'
    })
  }
)

const { tinkUserId, authorizationLink } = await response.json()
// Redirect user to authorizationLink to connect their bank
```

### 3. Handle Callback (After User Authorizes)

```typescript
// After user completes authorization and returns to your app
const response = await fetch(
  'https://gqqlqxmiqjzusyivpkzm.supabase.co/functions/v1/tink-handle-callback',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tinkUserId })
  }
)

const { accounts, credentialsCount } = await response.json()
// Returns connected accounts
```

### 4. Sync Transactions

```typescript
const response = await fetch(
  'https://gqqlqxmiqjzusyivpkzm.supabase.co/functions/v1/tink-sync-transactions',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tinkUserId,
      accountIds: ['account-1', 'account-2'] // Optional: specific accounts
    })
  }
)

const { transactionsSynced, transactionsSkipped } = await response.json()
```

### 5. Import Transactions to Budget

```typescript
const response = await fetch(
  'https://gqqlqxmiqjzusyivpkzm.supabase.co/functions/v1/tink-import-transactions',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transactionIds: ['tx-1', 'tx-2', 'tx-3'],
      year: 2025,
      month: 1 // 1-12
    })
  }
)

const { imported, skipped, errors } = await response.json()
```

### 6. Delete Connection

```typescript
const response = await fetch(
  'https://gqqlqxmiqjzusyivpkzm.supabase.co/functions/v1/tink-delete-connection',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ credentialsId: 'cred-123' })
  }
)

const { success } = await response.json()
```

## 🧪 Testing the Integration

### Step 1: Set Credentials

```bash
supabase secrets set TINK_CLIENT_ID=your_client_id
supabase secrets set TINK_CLIENT_SECRET=your_client_secret
```

### Step 2: Test Listing Providers

```bash
curl -X POST \
  https://gqqlqxmiqjzusyivpkzm.supabase.co/functions/v1/tink-list-providers \
  -H "Authorization: Bearer YOUR_SUPABASE_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"market":"ES"}'
```

### Step 3: Test Creating Connection

```bash
curl -X POST \
  https://gqqlqxmiqjzusyivpkzm.supabase.co/functions/v1/tink-create-connection \
  -H "Authorization: Bearer YOUR_SUPABASE_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"redirectUrl":"http://localhost:8080/banking/callback","market":"ES"}'
```

## 🎯 Auto-Categorization

Transactions are automatically categorized using the `auto_categorize_transaction` SQL function:

- **Groceries**: Mercadona, Carrefour, Lidl, DIA, Alcampo, Eroski
- **Restaurants**: Restaurants, cafes, McDonald's, pizza places
- **Transportation**: Uber, Cabify, gas stations (Shell, Repsol, Cepsa), parking, metro
- **Entertainment**: Netflix, Spotify, Amazon Prime, HBO, Disney+, cinemas
- **Utilities**: Iberdrola, Endesa, Gas Natural, Telefónica, Vodafone, Orange
- **Shopping**: Amazon, Zara, H&M, Mango, El Corte Inglés, Fnac
- **Health**: Pharmacies, hospitals, clinics

You can extend the categorization logic in the migration file.

## 🔒 Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ User authentication required for all endpoints
- ✅ OAuth 2.0 with automatic token refresh
- ✅ PSD2 compliant
- ✅ CORS headers configured
- ✅ Cascade deletes for GDPR compliance

## 📱 Frontend Integration (Next Steps)

You'll need to create React components to:

1. Display list of banks (from `tink-list-providers`)
2. Initiate bank connection (redirect to Tink Link)
3. Handle callback after authorization
4. Display fetched transactions
5. Allow user to review and import transactions
6. Show imported transactions in monthly budget

## 🚀 Ready to Test

Your Tink integration is fully deployed and ready to test!

**Next step**: Set your Tink credentials using the commands above, then test the integration with your Tink account.

## 🔧 Troubleshooting

### If you get "Tink credentials not configured" error:
- Make sure you've set both `TINK_CLIENT_ID` and `TINK_CLIENT_SECRET` secrets
- Restart the Edge Functions after setting secrets (they should auto-restart)

### If you get authentication errors:
- Check that your Tink Console credentials are correct
- Verify your Tink app has the correct scopes enabled

### If providers list is empty:
- Verify your market code is correct (ES for Spain)
- Check Tink Console to ensure your app supports that market

## 📞 Support

If you encounter any issues, check:
- Tink API Documentation: https://docs.tink.com/
- Tink Console: https://console.tink.com/
- Supabase Dashboard: https://supabase.com/dashboard/project/gqqlqxmiqjzusyivpkzm
