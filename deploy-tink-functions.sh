#!/bin/bash
set -e

echo "🚀 Deploying all Tink Edge Functions..."

functions=(
  "tink-list-providers"
  "tink-create-connection"
  "tink-handle-callback"
  "tink-sync-transactions"
  "tink-import-transactions"
  "tink-delete-connection"
)

for func in "${functions[@]}"; do
  echo "📦 Deploying $func..."
  supabase functions deploy "$func" --no-verify-jwt
done

echo "✅ All Tink functions deployed!"
echo ""
echo "📝 Don't forget to set these Supabase secrets:"
echo "   supabase secrets set TINK_CLIENT_ID=your_client_id"
echo "   supabase secrets set TINK_CLIENT_SECRET=your_client_secret"
