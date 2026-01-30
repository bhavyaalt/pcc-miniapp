-- PCC (Peer Credit Circles) Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pools table
CREATE TABLE IF NOT EXISTS pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  deposit_token VARCHAR(10) NOT NULL DEFAULT 'USDC', -- USDC, ETH, DAI
  token_address VARCHAR(42), -- ERC20 contract address (null for ETH)
  min_deposit DECIMAL(18, 6) NOT NULL DEFAULT 100,
  total_deposited DECIMAL(18, 6) NOT NULL DEFAULT 0,
  voting_period_hours INTEGER NOT NULL DEFAULT 72,
  quorum_percent INTEGER NOT NULL DEFAULT 50,
  approval_threshold_percent INTEGER NOT NULL DEFAULT 60,
  guardian_threshold_percent INTEGER NOT NULL DEFAULT 20,
  admin_address VARCHAR(42) NOT NULL,
  contract_address VARCHAR(42), -- Deployed pool contract
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pool members table
CREATE TABLE IF NOT EXISTS pool_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  display_name VARCHAR(50),
  avatar_url TEXT,
  deposited_amount DECIMAL(18, 6) NOT NULL DEFAULT 0,
  share_tokens DECIMAL(18, 6) NOT NULL DEFAULT 0,
  is_guardian BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pool_id, wallet_address)
);

-- Funding requests table
CREATE TABLE IF NOT EXISTS funding_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  requester_address VARCHAR(42) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  description_uri TEXT, -- IPFS link for detailed description
  amount DECIMAL(18, 6) NOT NULL,
  request_type VARCHAR(20) NOT NULL DEFAULT 'GRANT', -- GRANT, LOAN, INVESTMENT
  reward_bps INTEGER DEFAULT 0, -- Expected return in basis points (1000 = 10%)
  duration_days INTEGER, -- Time to complete/repay
  collateral_token VARCHAR(42),
  collateral_amount DECIMAL(18, 6) DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'VOTING', -- VOTING, APPROVED, REJECTED, FUNDED, COMPLETED, DEFAULTED
  yes_votes DECIMAL(18, 6) NOT NULL DEFAULT 0,
  no_votes DECIMAL(18, 6) NOT NULL DEFAULT 0,
  guardian_approvals INTEGER NOT NULL DEFAULT 0,
  voting_ends_at TIMESTAMPTZ NOT NULL,
  funded_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES funding_requests(id) ON DELETE CASCADE,
  voter_address VARCHAR(42) NOT NULL,
  vote_power DECIMAL(18, 6) NOT NULL, -- Share tokens at time of vote
  support BOOLEAN NOT NULL, -- true = yes, false = no
  is_guardian_approval BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(request_id, voter_address)
);

-- Activity log for tracking all actions
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
  actor_address VARCHAR(42) NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- DEPOSIT, WITHDRAW, CREATE_REQUEST, VOTE, EXECUTE, etc.
  details JSONB,
  tx_hash VARCHAR(66),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pool_members_pool ON pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_members_wallet ON pool_members(wallet_address);
CREATE INDEX IF NOT EXISTS idx_funding_requests_pool ON funding_requests(pool_id);
CREATE INDEX IF NOT EXISTS idx_funding_requests_status ON funding_requests(status);
CREATE INDEX IF NOT EXISTS idx_votes_request ON votes(request_id);
CREATE INDEX IF NOT EXISTS idx_activity_pool ON activity_log(pool_id);
CREATE INDEX IF NOT EXISTS idx_activity_actor ON activity_log(actor_address);

-- Row Level Security (RLS)
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policies - Allow public read, authenticated write
CREATE POLICY "Public read pools" ON pools FOR SELECT USING (true);
CREATE POLICY "Public read members" ON pool_members FOR SELECT USING (true);
CREATE POLICY "Public read requests" ON funding_requests FOR SELECT USING (true);
CREATE POLICY "Public read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Public read activity" ON activity_log FOR SELECT USING (true);

-- Allow inserts/updates (in production, add proper auth checks)
CREATE POLICY "Allow inserts pools" ON pools FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow updates pools" ON pools FOR UPDATE USING (true);
CREATE POLICY "Allow inserts members" ON pool_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow updates members" ON pool_members FOR UPDATE USING (true);
CREATE POLICY "Allow inserts requests" ON funding_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow updates requests" ON funding_requests FOR UPDATE USING (true);
CREATE POLICY "Allow inserts votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow inserts activity" ON activity_log FOR INSERT WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_pools_updated_at
  BEFORE UPDATE ON pools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pool_members_updated_at
  BEFORE UPDATE ON pool_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_funding_requests_updated_at
  BEFORE UPDATE ON funding_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert some demo data
INSERT INTO pools (name, description, deposit_token, min_deposit, total_deposited, admin_address, voting_period_hours, quorum_percent, approval_threshold_percent)
VALUES 
  ('Alpha Ventures', 'Web3 builders pooling funds to support early-stage projects', 'USDC', 100, 16500, '0x1234567890123456789012345678901234567890', 72, 50, 60),
  ('Creator Grant', 'Supporting independent creators and artists', 'ETH', 0.1, 5.5, '0x1234567890123456789012345678901234567890', 48, 40, 60),
  ('Family Fund', 'Family savings and emergency fund', 'DAI', 50, 12380, '0x1234567890123456789012345678901234567890', 168, 60, 70);
