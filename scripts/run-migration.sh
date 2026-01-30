#!/bin/bash
# Usage: ./scripts/run-migration.sh <database_password>
# Or set SUPABASE_DB_PASSWORD env var

cd "$(dirname "$0")/.."

PASSWORD="${1:-$SUPABASE_DB_PASSWORD}"

if [ -z "$PASSWORD" ]; then
  echo "❌ Database password required"
  echo ""
  echo "Usage: ./scripts/run-migration.sh YOUR_DB_PASSWORD"
  echo ""
  echo "Find your password at:"
  echo "https://supabase.com/dashboard/project/ohwtiwhbqsiwpktteaur/settings/database"
  exit 1
fi

echo "🚀 Running migration..."

psql "postgres://postgres.ohwtiwhbqsiwpktteaur:$PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres" \
  -f supabase/migrations/20260130120000_initial_schema.sql

if [ $? -eq 0 ]; then
  echo "✅ Migration complete!"
else
  echo "❌ Migration failed"
fi
