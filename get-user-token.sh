#!/bin/bash

# Helper script to get Supabase user access token

SUPABASE_URL="https://gqqlqxmiqjzusyivpkzm.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcWxxeG1pcWp6dXN5aXZwa3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzQxMjgsImV4cCI6MjA3ODgxMDEyOH0.a3YVs_hw41kbFaxd402F2IhKwuhk4z9AuIMO-ogvbIg"

echo "🔐 Supabase User Authentication"
echo "================================"
echo ""
read -p "Email: " EMAIL
read -sp "Password: " PASSWORD
echo ""
echo ""

# Sign in and get access token
RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

# Check for error
ERROR=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('error', ''))" 2>/dev/null)

if [ -n "$ERROR" ]; then
  echo "❌ Authentication failed!"
  echo "Error: $ERROR"
  exit 1
fi

# Extract access token
ACCESS_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('access_token', ''))" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token!"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "✅ Authentication successful!"
echo ""
echo "Your access token is:"
echo "$ACCESS_TOKEN"
echo ""
echo "Copy this token and use it for testing the Tink integration."
