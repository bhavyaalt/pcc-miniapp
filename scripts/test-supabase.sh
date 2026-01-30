#!/bin/bash
cd "$(dirname "$0")/.."

# Load env
export $(grep -v '^#' .env | xargs)

# Simple curl test
echo "🔌 Testing Supabase connection..."
echo "   URL: $NEXT_PUBLIC_SUPABASE_URL"

RESPONSE=$(curl -s -X GET \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/pools?select=count" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY")

echo "   Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "42P01\|does not exist"; then
  echo ""
  echo "⚠️  Tables don't exist yet. Run this SQL in Supabase Dashboard:"
  echo ""
  cat << 'EOF'
-- Run in Supabase Dashboard > SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  deposit_token TEXT NOT NULL DEFAULT 'USDC',
  token_address TEXT,
  min_deposit NUMERIC NOT NULL DEFAULT 0,
  total_deposited NUMERIC NOT NULL DEFAULT 0,
  voting_period_hours INTEGER NOT NULL DEFAULT 72,
  quorum_percent INTEGER NOT NULL DEFAULT 50,
  approval_threshold_percent INTEGER NOT NULL DEFAULT 60,
  guardian_threshold_percent INTEGER NOT NULL DEFAULT 20,
  admin_address TEXT NOT NULL,
  contract_address TEXT,
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pool_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  deposited_amount NUMERIC NOT NULL DEFAULT 0,
  share_tokens NUMERIC NOT NULL DEFAULT 0,
  is_guardian BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pool_id, wallet_address)
);

CREATE TABLE IF NOT EXISTS funding_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  requester_address TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'GRANT',
  reward_bps INTEGER NOT NULL DEFAULT 0,
  duration_days INTEGER,
  collateral_token TEXT,
  collateral_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'VOTING',
  yes_votes NUMERIC NOT NULL DEFAULT 0,
  no_votes NUMERIC NOT NULL DEFAULT 0,
  guardian_approvals INTEGER NOT NULL DEFAULT 0,
  voting_ends_at TIMESTAMPTZ NOT NULL,
  funded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES funding_requests(id) ON DELETE CASCADE,
  voter_address TEXT NOT NULL,
  vote_power NUMERIC NOT NULL,
  support BOOLEAN NOT NULL,
  is_guardian_approval BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(request_id, voter_address)
);

-- Enable RLS
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "public_read_pools" ON pools FOR SELECT USING (true);
CREATE POLICY "public_read_members" ON pool_members FOR SELECT USING (true);
CREATE POLICY "public_read_requests" ON funding_requests FOR SELECT USING (true);
CREATE POLICY "public_read_votes" ON votes FOR SELECT USING (true);

-- Service role full access
CREATE POLICY "service_pools" ON pools FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_members" ON pool_members FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_requests" ON funding_requests FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_votes" ON votes FOR ALL USING (auth.role() = 'service_role');
EOF
else
  echo "✅ Connected successfully!"
fi
