-- PCC Tables for Supabase

-- Pools table
CREATE TABLE IF NOT EXISTS pools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  deposit_token TEXT NOT NULL DEFAULT 'USDC',
  total_deposited NUMERIC DEFAULT 0,
  member_count INTEGER DEFAULT 0,
  active_requests INTEGER DEFAULT 0,
  admin_address TEXT NOT NULL,
  contract_address TEXT,
  voting_period_days INTEGER DEFAULT 3,
  quorum_percent INTEGER DEFAULT 50,
  approval_threshold_percent INTEGER DEFAULT 60,
  guardian_threshold_percent INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pool members table
CREATE TABLE IF NOT EXISTS pool_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  shares NUMERIC DEFAULT 0,
  deposited_amount NUMERIC DEFAULT 0,
  is_guardian BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pool_id, address)
);

-- Funding requests table
CREATE TABLE IF NOT EXISTS funding_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
  requester_address TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('GRANT', 'LOAN', 'INVESTMENT')),
  reward_percent INTEGER DEFAULT 0,
  duration_days INTEGER DEFAULT 30,
  collateral_amount NUMERIC DEFAULT 0,
  collateral_token TEXT,
  status TEXT DEFAULT 'VOTING' CHECK (status IN ('VOTING', 'APPROVED', 'REJECTED', 'FUNDED', 'COMPLETED', 'DEFAULTED')),
  yes_votes NUMERIC DEFAULT 0,
  no_votes NUMERIC DEFAULT 0,
  voting_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES funding_requests(id) ON DELETE CASCADE,
  voter_address TEXT NOT NULL,
  support BOOLEAN NOT NULL,
  weight NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, voter_address)
);

-- Enable RLS
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now - can tighten later)
CREATE POLICY "Allow all on pools" ON pools FOR ALL USING (true);
CREATE POLICY "Allow all on pool_members" ON pool_members FOR ALL USING (true);
CREATE POLICY "Allow all on funding_requests" ON funding_requests FOR ALL USING (true);
CREATE POLICY "Allow all on votes" ON votes FOR ALL USING (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_pools_admin ON pools(admin_address);
CREATE INDEX IF NOT EXISTS idx_members_pool ON pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_members_address ON pool_members(address);
CREATE INDEX IF NOT EXISTS idx_requests_pool ON funding_requests(pool_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON funding_requests(status);
