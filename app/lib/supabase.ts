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

// ============ PROJECT FUNCTIONS (for future use) ============

export interface Project {
  id: string;
  name: string;
  description?: string;
  creator_address: string;
  creator_name?: string;
  target_amount: number;
  raised_amount: number;
  currency: string;
  category: 'STARTUP' | 'CREATOR' | 'COMMUNITY' | 'DEFI' | 'NFT' | 'OTHER';
  status: 'FUNDING' | 'FUNDED' | 'CANCELLED' | 'COMPLETED';
  deadline: string;
  image_url?: string;
  website_url?: string;
  twitter_url?: string;
  created_at: string;
}

export interface ProjectContribution {
  id: string;
  project_id: string;
  pool_address: string;
  pool_name?: string;
  amount: number;
  status: 'VOTING' | 'APPROVED' | 'REJECTED' | 'FUNDED';
  voted_at?: string;
  funded_at?: string;
  created_at: string;
}

export async function getProjects(): Promise<Project[]> {
  // Projects feature - placeholder for now
  return [];
}

export async function getProject(id: string): Promise<Project | null> {
  return null;
}

export async function createProject(project: Partial<Project>): Promise<Project | null> {
  return null;
}

export async function getProjectContributions(projectId: string): Promise<ProjectContribution[]> {
  return [];
}

export async function createContribution(contribution: Partial<ProjectContribution>): Promise<ProjectContribution | null> {
  return null;
}

// ============ FUNDING REQUEST FUNCTIONS (legacy) ============

export interface LegacyFundingRequest {
  id: string;
  pool_id: string;
  requester_address: string;
  title: string;
  description?: string;
  amount: number;
  request_type: 'GRANT' | 'LOAN' | 'INVESTMENT';
  reward_bps: number;
  duration_days?: number;
  collateral_token?: string;
  collateral_amount: number;
  status: 'VOTING' | 'APPROVED' | 'REJECTED' | 'FUNDED' | 'COMPLETED' | 'DEFAULTED';
  yes_votes: number;
  no_votes: number;
  guardian_approvals: number;
  voting_ends_at: string;
  funded_at?: string;
  created_at: string;
}

export async function getFundingRequests(poolId?: string): Promise<LegacyFundingRequest[]> {
  // Convert from new format
  const requests = poolId ? await getPoolRequests(poolId) : await getActiveRequests();
  return requests.map(r => ({
    id: r.id || String(r.onchain_id),
    pool_id: r.pool_address,
    requester_address: r.requester_address,
    title: r.title,
    amount: parseFloat(r.amount),
    request_type: r.request_type,
    reward_bps: r.reward_bps,
    duration_days: r.duration / 86400,
    collateral_token: r.collateral_token,
    collateral_amount: parseFloat(r.collateral_amount),
    status: r.status as any,
    yes_votes: parseFloat(r.yes_votes),
    no_votes: parseFloat(r.no_votes),
    guardian_approvals: 0,
    voting_ends_at: r.voting_ends_at,
    funded_at: r.funded_at,
    created_at: r.created_at || new Date().toISOString(),
  }));
}

export async function createFundingRequest(request: Partial<LegacyFundingRequest>): Promise<LegacyFundingRequest | null> {
  // This should go through the contract now
  return null;
}

export async function castVote(requestId: string, voterAddress: string, support: boolean, votePower: number): Promise<any> {
  // This should go through the contract now
  return null;
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

export interface PoolMember {
  id: string;
  pool_id: string;
  wallet_address: string;
  display_name?: string;
  avatar_url?: string;
  deposited_amount: number;
  share_tokens: number;
  is_guardian: boolean;
  is_active: boolean;
  joined_at: string;
}

export async function getPoolMembersLegacy(poolId: string): Promise<PoolMember[]> {
  const members = await getPoolMembers(poolId);
  return members.map(m => ({
    id: m.id || m.address,
    pool_id: m.pool_address,
    wallet_address: m.address,
    deposited_amount: parseFloat(m.shares),
    share_tokens: parseFloat(m.shares),
    is_guardian: m.is_guardian,
    is_active: m.is_active,
    joined_at: m.joined_at,
  }));
}

// Alias for backwards compatibility
export { getPoolMembersLegacy as getPoolMembersCompat };

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
