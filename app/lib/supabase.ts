import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types - Updated to match indexer schema
export interface Pool {
  id?: string;
  address: string; // Contract address (primary identifier)
  name: string;
  deposit_token: string;
  deposit_token_symbol: string;
  deposit_token_decimals: number;
  min_deposit: string;
  total_deposited: string;
  voting_period: number; // seconds
  quorum_bps: number;
  approval_bps: number;
  guardian_threshold_bps: number;
  admin_address: string;
  share_token?: string;
  chain_id: number;
  is_active: boolean;
  created_at?: string;
  created_tx?: string;
}

export interface Member {
  id?: string;
  pool_address: string;
  address: string;
  is_guardian: boolean;
  is_active: boolean;
  shares: string;
  joined_at: string;
}

export interface FundingRequest {
  id?: string;
  pool_address: string;
  onchain_id: number;
  requester_address: string;
  title: string;
  description_uri?: string;
  amount: string;
  request_type: 'GRANT' | 'LOAN' | 'INVESTMENT';
  reward_bps: number;
  duration: number;
  collateral_token?: string;
  collateral_amount: string;
  status: 'PENDING' | 'VOTING' | 'APPROVED' | 'REJECTED' | 'FUNDED' | 'COMPLETED' | 'DEFAULTED' | 'CANCELLED';
  yes_votes: string;
  no_votes: string;
  voting_ends_at: string;
  funded_at?: string;
  created_at?: string;
}

export interface Vote {
  id?: string;
  request_id: string;
  voter_address: string;
  support: boolean;
  weight: string;
  tx_hash?: string;
  voted_at?: string;
}

export interface Transaction {
  id?: string;
  pool_address: string;
  address: string;
  tx_type: 'DEPOSIT' | 'WITHDRAW' | 'FUND' | 'REPAY';
  amount: string;
  tx_hash?: string;
  block_number?: number;
  created_at?: string;
}

// ============ POOL FUNCTIONS ============

export async function getPools(): Promise<Pool[]> {
  try {
    const { data, error } = await supabase
      .from('pools')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching pools:', e);
    return [];
  }
}

export async function getPool(address: string): Promise<Pool | null> {
  try {
    const { data, error } = await supabase
      .from('pools')
      .select('*')
      .eq('address', address.toLowerCase())
      .single();
    
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('Error fetching pool:', e);
    return null;
  }
}

export async function getPoolByAddress(address: string): Promise<Pool | null> {
  return getPool(address);
}

// ============ MEMBER FUNCTIONS ============

export async function getPoolMembers(poolAddress: string): Promise<Member[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('pool_address', poolAddress.toLowerCase())
      .eq('is_active', true)
      .order('shares', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching members:', e);
    return [];
  }
}

export async function getMember(poolAddress: string, userAddress: string): Promise<Member | null> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('pool_address', poolAddress.toLowerCase())
      .eq('address', userAddress.toLowerCase())
      .single();
    
    if (error) throw error;
    return data;
  } catch (e) {
    return null;
  }
}

export async function getUserPools(userAddress: string): Promise<Pool[]> {
  try {
    // Get all pools where user is a member
    const { data: memberships, error: memberError } = await supabase
      .from('members')
      .select('pool_address')
      .eq('address', userAddress.toLowerCase())
      .eq('is_active', true);
    
    if (memberError) throw memberError;
    if (!memberships || memberships.length === 0) return [];
    
    const poolAddresses = memberships.map(m => m.pool_address);
    
    const { data: pools, error: poolError } = await supabase
      .from('pools')
      .select('*')
      .in('address', poolAddresses);
    
    if (poolError) throw poolError;
    return pools || [];
  } catch (e) {
    console.error('Error fetching user pools:', e);
    return [];
  }
}

export async function getUserShare(poolAddress: string, userAddress: string): Promise<{ amount: number; percent: number } | null> {
  try {
    const [member, pool] = await Promise.all([
      getMember(poolAddress, userAddress),
      getPool(poolAddress),
    ]);
    
    if (!member || !pool) return null;
    
    const shares = parseFloat(member.shares);
    const totalDeposited = parseFloat(pool.total_deposited);
    const percent = totalDeposited > 0 ? (shares / totalDeposited) * 100 : 0;
    
    return { amount: shares, percent };
  } catch (e) {
    return null;
  }
}

// ============ REQUEST FUNCTIONS ============

export async function getPoolRequests(poolAddress: string): Promise<FundingRequest[]> {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('pool_address', poolAddress.toLowerCase())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching requests:', e);
    return [];
  }
}

export async function getActiveRequests(): Promise<FundingRequest[]> {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('status', 'VOTING')
      .order('voting_ends_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching active requests:', e);
    return [];
  }
}

export async function getRequest(poolAddress: string, onchainId: number): Promise<FundingRequest | null> {
  try {
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('pool_address', poolAddress.toLowerCase())
      .eq('onchain_id', onchainId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (e) {
    return null;
  }
}

// ============ VOTE FUNCTIONS ============

export async function getRequestVotes(requestId: string): Promise<Vote[]> {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('request_id', requestId)
      .order('voted_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching votes:', e);
    return [];
  }
}

// ============ TRANSACTION FUNCTIONS ============

export async function getPoolTransactions(poolAddress: string, limit = 50): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('pool_address', poolAddress.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching transactions:', e);
    return [];
  }
}

export async function getUserTransactions(userAddress: string, limit = 50): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('address', userAddress.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching user transactions:', e);
    return [];
  }
}

// ============ STATS FUNCTIONS ============

export async function getGlobalStats(): Promise<{
  totalPools: number;
  totalValueLocked: number;
  totalMembers: number;
}> {
  try {
    const { data: pools, error } = await supabase
      .from('pools')
      .select('total_deposited, deposit_token_symbol');
    
    if (error) throw error;
    
    let tvl = 0;
    for (const pool of pools || []) {
      const amount = parseFloat(pool.total_deposited);
      // Simple conversion - in production you'd use price feeds
      if (pool.deposit_token_symbol === 'ETH') {
        tvl += amount * 2500; // Rough ETH price
      } else {
        tvl += amount; // Assume stablecoins
      }
    }
    
    const { count: memberCount } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    return {
      totalPools: pools?.length || 0,
      totalValueLocked: tvl,
      totalMembers: memberCount || 0,
    };
  } catch (e) {
    console.error('Error fetching stats:', e);
    return { totalPools: 0, totalValueLocked: 0, totalMembers: 0 };
  }
}

// ============ LEGACY COMPATIBILITY ============
// These functions maintain compatibility with old code

export interface LegacyPool {
  id: string;
  name: string;
  description?: string;
  deposit_token: string;
  min_deposit: number;
  total_deposited: number;
  voting_period_hours: number;
  quorum_percent: number;
  approval_threshold_percent: number;
  guardian_threshold_percent: number;
  admin_address: string;
  is_open: boolean;
  created_at: string;
}

export function poolToLegacy(pool: Pool): LegacyPool {
  return {
    id: pool.address,
    name: pool.name,
    deposit_token: pool.deposit_token_symbol,
    min_deposit: parseFloat(pool.min_deposit),
    total_deposited: parseFloat(pool.total_deposited),
    voting_period_hours: pool.voting_period / 3600,
    quorum_percent: pool.quorum_bps / 100,
    approval_threshold_percent: pool.approval_bps / 100,
    guardian_threshold_percent: pool.guardian_threshold_bps / 100,
    admin_address: pool.admin_address,
    is_open: pool.is_active,
    created_at: pool.created_at || new Date().toISOString(),
  };
}

export async function getPoolsLegacy(): Promise<LegacyPool[]> {
  const pools = await getPools();
  return pools.map(poolToLegacy);
}
