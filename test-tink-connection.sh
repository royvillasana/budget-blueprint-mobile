#!/bin/bash

# Test Tink Connection Script
# This script helps you test the Tink integration with your Supabase account

SUPABASE_URL="https://gqqlqxmiqjzusyivpkzm.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcWxxeG1pcWp6dXN5aXZwa3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzQxMjgsImV4cCI6MjA3ODgxMDEyOH0.a3YVs_hw41kbFaxd402F2IhKwuhk4z9AuIMO-ogvbIg"

echo "🔐 Tink Integration Test Script"
echo "================================"
echo ""
echo "Please provide your Supabase user credentials:"
read -p "Email: " EMAIL
read -sp "Password: " PASSWORD
echo ""
echo ""

echo "📝 Authenticating with Supabase..."

# Sign in and get access token
RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

# Extract access token
ACCESS_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('access_token', ''))" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Authentication failed!"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✅ Authentication successful!"
echo ""

# Test 1: List providers
echo "📋 Test 1: Listing Spanish banks..."
PROVIDERS=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/tink-list-providers" \
  -H "Content-Type: application/json" \
  -d '{"market":"ES"}')

PROVIDER_COUNT=$(echo "$PROVIDERS" | python3 -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('providers', [])))" 2>/dev/null)

if [ "$PROVIDER_COUNT" -gt 0 ]; then
  echo "✅ Found $PROVIDER_COUNT Spanish banks"
  echo "$PROVIDERS" | python3 -m json.tool 2>/dev/null | head -20
else
  echo "❌ Failed to list providers"
  echo "$PROVIDERS"
fi

echo ""

# Test 2: Create connection
echo "🔗 Test 2: Creating Tink connection..."
CONNECTION=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/tink-create-connection" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"redirectUrl":"http://localhost:8080/banking/callback","market":"ES","locale":"es_ES"}')

echo "$CONNECTION" | python3 -m json.tool 2>/dev/null

# Check if we got an authorization link
AUTH_LINK=$(echo "$CONNECTION" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('authorizationLink', ''))" 2>/dev/null)

if [ -n "$AUTH_LINK" ]; then
  echo ""
  echo "✅ Connection created successfully!"
  echo ""
  echo "📱 Next step: Open this link in your browser to connect your bank:"
  echo "$AUTH_LINK"
  echo ""
  echo "Note: This link opens Tink Link UI where you can:"
  echo "  1. Select your bank"
  echo "  2. Enter your bank credentials (use Tink test credentials)"
  echo "  3. Authorize the connection"
  echo "  4. Get redirected back to your app"
else
  echo ""
  echo "⚠️  Connection creation returned an error or unexpected response"
fi

echo ""
echo "🎉 Test completed!"
