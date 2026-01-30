import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Pool {
  id: string;
  name: string;
  description?: string;
  deposit_token: string; // 'ETH' or token address
  total_deposited: number;
  member_count: number;
  active_requests: number;
  admin_address: string;
  contract_address?: string;
  created_at: string;
  voting_period_days: number;
  quorum_percent: number;
  approval_threshold_percent: number;
  guardian_threshold_percent: number;
}

export interface PoolMember {
  id: string;
  pool_id: string;
  address: string;
  shares: number;
  deposited_amount: number;
  is_guardian: boolean;
  joined_at: string;
}

export interface FundingRequest {
  id: string;
  pool_id: string;
  requester_address: string;
  title: string;
  description: string;
  amount: number;
  request_type: 'GRANT' | 'LOAN' | 'INVESTMENT';
  reward_percent: number;
  duration_days: number;
  collateral_amount: number;
  collateral_token?: string;
  status: 'VOTING' | 'APPROVED' | 'REJECTED' | 'FUNDED' | 'COMPLETED' | 'DEFAULTED';
  yes_votes: number;
  no_votes: number;
  voting_ends_at: string;
  created_at: string;
}

// API Functions
export async function getPools(): Promise<Pool[]> {
  const { data, error } = await supabase
    .from('pools')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pools:', error);
    return [];
  }
  return data || [];
}

export async function getPool(id: string): Promise<Pool | null> {
  const { data, error } = await supabase
    .from('pools')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching pool:', error);
    return null;
  }
  return data;
}

export async function createPool(pool: Omit<Pool, 'id' | 'created_at' | 'total_deposited' | 'member_count' | 'active_requests'>): Promise<Pool | null> {
  const { data, error } = await supabase
    .from('pools')
    .insert({
      ...pool,
      total_deposited: 0,
      member_count: 0,
      active_requests: 0,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating pool:', error);
    return null;
  }
  return data;
}

export async function getPoolMembers(poolId: string): Promise<PoolMember[]> {
  const { data, error } = await supabase
    .from('pool_members')
    .select('*')
    .eq('pool_id', poolId)
    .order('deposited_amount', { ascending: false });

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }
  return data || [];
}

export async function getPoolRequests(poolId: string): Promise<FundingRequest[]> {
  const { data, error } = await supabase
    .from('funding_requests')
    .select('*')
    .eq('pool_id', poolId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching requests:', error);
    return [];
  }
  return data || [];
}

export async function createFundingRequest(request: Omit<FundingRequest, 'id' | 'created_at' | 'yes_votes' | 'no_votes' | 'status'>): Promise<FundingRequest | null> {
  const votingEndsAt = new Date();
  votingEndsAt.setDate(votingEndsAt.getDate() + 3); // 3 day voting period

  const { data, error } = await supabase
    .from('funding_requests')
    .insert({
      ...request,
      status: 'VOTING',
      yes_votes: 0,
      no_votes: 0,
      voting_ends_at: votingEndsAt.toISOString(),
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating request:', error);
    return null;
  }
  return data;
}
