#!/bin/bash
cd "$(dirname "$0")/.."

# Load env
export $(grep -v '^#' .env | xargs)

echo "🚀 Pushing schema to Supabase..."

# Read the migration SQL
SQL=$(cat supabase/migrations/20260130120000_initial_schema.sql)

# Use the Supabase REST API to run SQL via rpc
RESPONSE=$(curl -s -X POST \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL" | jq -Rs .)}")

if echo "$RESPONSE" | grep -q "error\|42501"; then
  echo "⚠️  RPC method not available, trying direct approach..."
  
  # Alternative: Use Supabase Management API if we have access token
  # For now, let's output instructions
  echo ""
  echo "📋 Please run this SQL in Supabase Dashboard > SQL Editor:"
  echo "   https://supabase.com/dashboard/project/ohwtiwhbqsiwpktteaur/sql"
  echo ""
  cat supabase/migrations/20260130120000_initial_schema.sql
else
  echo "✅ Schema pushed successfully!"
  echo "$RESPONSE"
fi
