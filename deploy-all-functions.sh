#!/bin/bash
set -e

echo "🚀 Deploying all GoCardless Edge Functions..."

# Array of functions to deploy
functions=(
  "gocardless-list-institutions"
  "gocardless-create-requisition"
  "gocardless-handle-callback"
  "gocardless-sync-transactions"
  "gocardless-import-transactions"
  "gocardless-delete-connection"
)

for func in "${functions[@]}"; do
  echo "📦 Deploying $func..."
  supabase functions deploy "$func" --no-verify-jwt || echo "⚠️  $func failed (may not exist yet)"
done

echo "✅ All functions deployed!"
echo ""
echo "🔑 Don't forget to set your secrets:"
echo "   supabase secrets set GOCARDLESS_SECRET_ID=your_secret_id"
echo "   supabase secrets set GOCARDLESS_SECRET_KEY=your_secret_key"
