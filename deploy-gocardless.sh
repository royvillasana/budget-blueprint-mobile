#!/bin/bash

echo "🚀 Deploying GoCardless Integration..."

# Apply migrations first
echo "📊 Applying database migrations..."
supabase db push --db-url "postgresql://postgres.gqqlqxmiqjzusyivpkzm:$SUPABASE_DB_PASSWORD@aws-0-eu-north-1.pooler.supabase.com:6543/postgres" || {
  echo "⚠️  Migration failed. Trying to apply only GoCardless migrations..."
  supabase migration up --db-url "postgresql://postgres.gqqlqxmiqjzusyivpkzm:$SUPABASE_DB_PASSWORD@aws-0-eu-north-1.pooler.supabase.com:6543/postgres" 20251228000001
  supabase migration up --db-url "postgresql://postgres.gqqlqxmiqjzusyivpkzm:$SUPABASE_DB_PASSWORD@aws-0-eu-north-1.pooler.supabase.com:6543/postgres" 20251228000002
}

# Deploy Edge Function
echo "⚡ Deploying Edge Functions..."
supabase functions deploy gocardless-list-institutions

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Set your GoCardless credentials:"
echo "   supabase secrets set GOCARDLESS_SECRET_ID=your_secret_id"
echo "   supabase secrets set GOCARDLESS_SECRET_KEY=your_secret_key"
echo ""
echo "2. Test the function:"
echo "   curl -X POST https://gqqlqxmiqjzusyivpkzm.supabase.co/functions/v1/gocardless-list-institutions \\"
echo "     -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"country\":\"ES\"}'"
