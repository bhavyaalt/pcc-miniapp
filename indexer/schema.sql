-- PCC Indexer Schema
-- Run this AFTER the main schema

-- ============================================
-- INDEXER STATE (tracks sync progress)
-- ============================================
CREATE TABLE IF NOT EXISTS indexer_state (
  id INTEGER PRIMARY KEY DEFAULT 1,
  last_block TEXT NOT NULL DEFAULT '0',
  pools TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial state
INSERT INTO indexer_state (id, last_block, pools) 
VALUES (1, '0', '{}')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MODIFY POOLS TABLE (add address as unique)
-- ============================================
-- Drop existing constraint if any
ALTER TABLE pools DROP CONSTRAINT IF EXISTS pools_address_key;

-- Add unique constraint on address
ALTER TABLE pools ADD CONSTRAINT pools_address_key UNIQUE (address);

-- Add new columns if missing
ALTER TABLE pools ADD COLUMN IF NOT EXISTS deposit_token_symbol TEXT DEFAULT 'USDC';
ALTER TABLE pools ADD COLUMN IF NOT EXISTS deposit_token_decimals INTEGER DEFAULT 6;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS share_token TEXT;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS created_tx TEXT;

-- ============================================
-- MODIFY MEMBERS TABLE (use pool_address)
-- ============================================
-- Add pool_address column if not exists
ALTER TABLE members ADD COLUMN IF NOT EXISTS pool_address TEXT;

-- Add unique constraint
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_pool_address_address_key;
ALTER TABLE members ADD CONSTRAINT members_pool_address_address_key UNIQUE (pool_address, address);

-- ============================================
-- MODIFY REQUESTS TABLE (use pool_address)
-- ============================================
ALTER TABLE requests ADD COLUMN IF NOT EXISTS pool_address TEXT;
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_pool_address_onchain_id_key;
ALTER TABLE requests ADD CONSTRAINT requests_pool_address_onchain_id_key UNIQUE (pool_address, onchain_id);

-- ============================================
-- MODIFY TRANSACTIONS TABLE (use pool_address)
-- ============================================
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS pool_address TEXT;

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pools_address ON pools(address);
CREATE INDEX IF NOT EXISTS idx_members_pool_address ON members(pool_address);
CREATE INDEX IF NOT EXISTS idx_requests_pool_address ON requests(pool_address);
CREATE INDEX IF NOT EXISTS idx_transactions_pool_address ON transactions(pool_address);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
-- Service role has full access by default
