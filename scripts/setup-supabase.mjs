#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  console.log(`   URL: ${supabaseUrl}`);
  
  // Test basic query
  const { data, error } = await supabase.from('pools').select('count');
  
  if (error) {
    if (error.code === '42P01') {
      console.log('⚠️  Table "pools" does not exist yet');
      console.log('\n📋 Run this SQL in Supabase Dashboard > SQL Editor:\n');
      printSchema();
      return;
    }
    console.error('❌ Connection error:', error.message);
    return;
  }
  
  console.log('✅ Connected successfully!');
  console.log(`   Found ${data?.length || 0} pools`);
}

function printSchema() {
  const schema = `
-- PCC Schema for Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pools table
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

-- Pool members table
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

-- Funding requests table
CREATE TABLE IF NOT EXISTS funding_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  requester_address TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'GRANT' CHECK (request_type IN ('GRANT', 'LOAN', 'INVESTMENT')),
  reward_bps INTEGER NOT NULL DEFAULT 0,
  duration_days INTEGER,
  collateral_token TEXT,
  collateral_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'VOTING' CHECK (status IN ('VOTING', 'APPROVED', 'REJECTED', 'FUNDED', 'COMPLETED', 'DEFAULTED')),
  yes_votes NUMERIC NOT NULL DEFAULT 0,
  no_votes NUMERIC NOT NULL DEFAULT 0,
  guardian_approvals INTEGER NOT NULL DEFAULT 0,
  voting_ends_at TIMESTAMPTZ NOT NULL,
  funded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes table
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pool_members_pool ON pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_members_wallet ON pool_members(wallet_address);
CREATE INDEX IF NOT EXISTS idx_funding_requests_pool ON funding_requests(pool_id);
CREATE INDEX IF NOT EXISTS idx_funding_requests_status ON funding_requests(status);
CREATE INDEX IF NOT EXISTS idx_votes_request ON votes(request_id);

-- Enable Row Level Security
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (read-only for anon, full access for authenticated/service)
CREATE POLICY "Allow public read" ON pools FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON pool_members FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON funding_requests FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON votes FOR SELECT USING (true);

-- Service role can do everything
CREATE POLICY "Service role full access" ON pools FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON pool_members FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON funding_requests FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON votes FOR ALL USING (auth.role() = 'service_role');
`;
  console.log(schema);
}

testConnection();
