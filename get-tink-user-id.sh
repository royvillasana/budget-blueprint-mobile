#!/bin/bash

SUPABASE_URL="https://gqqlqxmiqjzusyivpkzm.supabase.co"
ACCESS_TOKEN="$1"

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Usage: ./get-tink-user-id.sh YOUR_ACCESS_TOKEN"
  exit 1
fi

# Query bank_requisitions to find the Tink user ID
curl -s -X GET "${SUPABASE_URL}/rest/v1/bank_requisitions?institution_id=eq.tink&select=requisition_id,institution_name,created_at" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcWxxeG1pcWp6dXN5aXZwa3ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzQxMjgsImV4cCI6MjA3ODgxMDEyOH0.a3YVs_hw41kbFaxd402F2IhKwuhk4z9AuIMO-ogvbIg" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" | python3 -m json.tool
