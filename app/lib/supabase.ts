import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export interface Pool {
  id: string;
  name: string;
  description?: string;
  deposit_token: string;
  token_address?: string;
  min_deposit: number;
  total_deposited: number;
  voting_period_hours: number;
  quorum_percent: number;
  approval_threshold_percent: number;
  guardian_threshold_percent: number;
  admin_address: string;
  contract_address?: string;
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

export interface FundingRequest {
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

export interface Vote {
  id: string;
  request_id: string;
  voter_address: string;
  vote_power: number;
  support: boolean;
  is_guardian_approval: boolean;
  created_at: string;
}

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
  pool_id: string;
  pool_name?: string;
  amount: number;
  status: 'VOTING' | 'APPROVED' | 'REJECTED' | 'FUNDED';
  voted_at?: string;
  funded_at?: string;
  created_at: string;
}

// Demo data (used when Supabase tables don't exist)
const DEMO_POOLS: Pool[] = [
  {
    id: '1',
    name: 'Alpha Ventures',
    description: 'Web3 builders pooling funds to support early-stage projects',
    deposit_token: 'USDC',
    min_deposit: 100,
    total_deposited: 16500,
    voting_period_hours: 72,
    quorum_percent: 50,
    approval_threshold_percent: 60,
    guardian_threshold_percent: 20,
    admin_address: '0x1234567890123456789012345678901234567890',
    is_open: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Creator Grant',
    description: 'Supporting independent creators and artists',
    deposit_token: 'ETH',
    min_deposit: 0.1,
    total_deposited: 5.5,
    voting_period_hours: 48,
    quorum_percent: 40,
    approval_threshold_percent: 60,
    guardian_threshold_percent: 20,
    admin_address: '0x1234567890123456789012345678901234567890',
    is_open: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Family Fund',
    description: 'Family savings and emergency fund',
    deposit_token: 'DAI',
    min_deposit: 50,
    total_deposited: 12380,
    voting_period_hours: 168,
    quorum_percent: 60,
    approval_threshold_percent: 70,
    guardian_threshold_percent: 20,
    admin_address: '0x1234567890123456789012345678901234567890',
    is_open: true,
    created_at: new Date().toISOString(),
  },
];

const DEMO_REQUESTS: FundingRequest[] = [
  {
    id: '802',
    pool_id: '1',
    requester_address: '0xabcdef1234567890abcdef1234567890abcdef12',
    title: 'Build DeFi Analytics Dashboard',
    description: 'Creating a comprehensive analytics tool for DeFi protocols',
    amount: 44205,
    request_type: 'GRANT',
    reward_bps: 0,
    duration_days: 30,
    collateral_amount: 0,
    status: 'VOTING',
    yes_votes: 12375,
    no_votes: 4125,
    guardian_approvals: 0,
    voting_ends_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    created_at: new Date().toISOString(),
  },
];

const DEMO_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Onchain Analytics Platform',
    description: 'Building the Bloomberg Terminal for DeFi. Real-time analytics, portfolio tracking, and alpha signals for serious traders.',
    creator_address: '0xabc123...',
    creator_name: 'DeFi Labs',
    target_amount: 250000,
    raised_amount: 125000,
    currency: 'USDC',
    category: 'DEFI',
    status: 'FUNDING',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    website_url: 'https://example.com',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'NFT Creator Collective',
    description: 'A DAO-owned studio for independent artists. We provide tools, marketing, and community to help creators succeed.',
    creator_address: '0xdef456...',
    creator_name: 'Art3 Collective',
    target_amount: 100000,
    raised_amount: 67500,
    currency: 'USDC',
    category: 'CREATOR',
    status: 'FUNDING',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    twitter_url: 'https://twitter.com/example',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Base Gaming SDK',
    description: 'Open-source SDK for building onchain games on Base. Includes wallet integration, NFT minting, and leaderboards.',
    creator_address: '0x789abc...',
    creator_name: 'GameFi Builders',
    target_amount: 75000,
    raised_amount: 75000,
    currency: 'USDC',
    category: 'STARTUP',
    status: 'FUNDED',
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
];

const DEMO_CONTRIBUTIONS: ProjectContribution[] = [
  {
    id: '1',
    project_id: '1',
    pool_id: '1',
    pool_name: 'Alpha Ventures',
    amount: 50000,
    status: 'FUNDED',
    funded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    project_id: '1',
    pool_id: '2',
    pool_name: 'Creator Grant',
    amount: 75000,
    status: 'FUNDED',
    funded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    project_id: '2',
    pool_id: '1',
    pool_name: 'Alpha Ventures',
    amount: 25000,
    status: 'VOTING',
    created_at: new Date().toISOString(),
  },
];

let useDemo = true; // Will be set to false if Supabase works

// API Functions
export async function getPools(): Promise<Pool[]> {
  try {
    const { data, error } = await supabase
      .from('pools')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (data && data.length > 0) {
      useDemo = false;
      return data;
    }
  } catch (e) {
    console.log('Using demo data for pools');
  }
  return DEMO_POOLS;
}

export async function getPool(id: string): Promise<Pool | null> {
  try {
    const { data, error } = await supabase
      .from('pools')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (data) return data;
  } catch (e) {
    console.log('Using demo data for pool');
  }
  return DEMO_POOLS.find(p => p.id === id) || null;
}

export async function getPoolMembers(poolId: string): Promise<PoolMember[]> {
  try {
    const { data, error } = await supabase
      .from('pool_members')
      .select('*')
      .eq('pool_id', poolId)
      .order('deposited_amount', { ascending: false });
    
    if (error) throw error;
    if (data) return data;
  } catch (e) {
    console.log('Using demo data for members');
  }
  // Demo members
  return [
    { id: '1', pool_id: poolId, wallet_address: '0x1234...5678', display_name: 'Mike Snow', deposited_amount: 5000, share_tokens: 5000, is_guardian: true, is_active: true, joined_at: new Date().toISOString() },
    { id: '2', pool_id: poolId, wallet_address: '0xabcd...efgh', display_name: 'Alice', deposited_amount: 3500, share_tokens: 3500, is_guardian: false, is_active: true, joined_at: new Date().toISOString() },
    { id: '3', pool_id: poolId, wallet_address: '0x9876...5432', display_name: 'Bob', deposited_amount: 2000, share_tokens: 2000, is_guardian: false, is_active: true, joined_at: new Date().toISOString() },
  ];
}

export async function getFundingRequests(poolId?: string): Promise<FundingRequest[]> {
  try {
    let query = supabase.from('funding_requests').select('*');
    if (poolId) query = query.eq('pool_id', poolId);
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) return data;
  } catch (e) {
    console.log('Using demo data for requests');
  }
  return poolId ? DEMO_REQUESTS.filter(r => r.pool_id === poolId) : DEMO_REQUESTS;
}

export async function getActiveRequests(): Promise<FundingRequest[]> {
  try {
    const { data, error } = await supabase
      .from('funding_requests')
      .select('*')
      .eq('status', 'VOTING')
      .order('voting_ends_at', { ascending: true });
    
    if (error) throw error;
    if (data && data.length > 0) return data;
  } catch (e) {
    console.log('Using demo data for active requests');
  }
  return DEMO_REQUESTS.filter(r => r.status === 'VOTING');
}

export async function createPool(pool: Partial<Pool>): Promise<Pool | null> {
  const { data, error } = await supabase
    .from('pools')
    .insert(pool)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating pool:', error);
    return null;
  }
  return data;
}

export async function createFundingRequest(request: Partial<FundingRequest>): Promise<FundingRequest | null> {
  const { data, error } = await supabase
    .from('funding_requests')
    .insert(request)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating request:', error);
    return null;
  }
  return data;
}

export async function castVote(requestId: string, voterAddress: string, support: boolean, votePower: number): Promise<Vote | null> {
  const { data, error } = await supabase
    .from('votes')
    .insert({
      request_id: requestId,
      voter_address: voterAddress,
      support,
      vote_power: votePower,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error casting vote:', error);
    return null;
  }
  
  // Update request vote counts
  const { error: updateError } = await supabase
    .from('funding_requests')
    .update({
      yes_votes: support ? supabase.rpc('increment', { x: votePower }) : undefined,
      no_votes: !support ? supabase.rpc('increment', { x: votePower }) : undefined,
    })
    .eq('id', requestId);
  
  return data;
}

export async function joinPool(poolId: string, walletAddress: string, amount: number): Promise<PoolMember | null> {
  const { data, error } = await supabase
    .from('pool_members')
    .insert({
      pool_id: poolId,
      wallet_address: walletAddress,
      deposited_amount: amount,
      share_tokens: amount,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error joining pool:', error);
    return null;
  }
  return data;
}

// Helper to get user's pools
export async function getUserPools(walletAddress: string): Promise<Pool[]> {
  try {
    const { data: memberships, error } = await supabase
      .from('pool_members')
      .select('pool_id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('is_active', true);
    
    if (error) throw error;
    if (!memberships || memberships.length === 0) return [];
    
    const poolIds = memberships.map(m => m.pool_id);
    const { data: pools } = await supabase
      .from('pools')
      .select('*')
      .in('id', poolIds);
    
    return pools || [];
  } catch (e) {
    return [];
  }
}

// Helper to get user's share in a pool
export async function getUserShare(poolId: string, walletAddress: string): Promise<{ amount: number; percent: number } | null> {
  try {
    const { data, error } = await supabase
      .from('pool_members')
      .select('deposited_amount, share_tokens')
      .eq('pool_id', poolId)
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();
    
    if (error) throw error;
    
    const pool = await getPool(poolId);
    if (!pool || !data) return null;
    
    const percent = pool.total_deposited > 0 
      ? (data.deposited_amount / pool.total_deposited) * 100 
      : 0;
    
    return { amount: data.deposited_amount, percent };
  } catch (e) {
    return null;
  }
}

// ============ PROJECT FUNCTIONS ============

export async function getProjects(status?: Project['status']): Promise<Project[]> {
  try {
    let query = supabase.from('projects').select('*');
    if (status) query = query.eq('status', status);
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) return data;
  } catch (e) {
    console.log('Using demo data for projects');
  }
  return status ? DEMO_PROJECTS.filter(p => p.status === status) : DEMO_PROJECTS;
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (data) return data;
  } catch (e) {
    console.log('Using demo data for project');
  }
  return DEMO_PROJECTS.find(p => p.id === id) || null;
}

export async function getProjectContributions(projectId: string): Promise<ProjectContribution[]> {
  try {
    const { data, error } = await supabase
      .from('project_contributions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (data) return data;
  } catch (e) {
    console.log('Using demo data for contributions');
  }
  return DEMO_CONTRIBUTIONS.filter(c => c.project_id === projectId);
}

export async function getPoolContributions(poolId: string): Promise<ProjectContribution[]> {
  try {
    const { data, error } = await supabase
      .from('project_contributions')
      .select('*')
      .eq('pool_id', poolId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    if (data) return data;
  } catch (e) {
    console.log('Using demo data for pool contributions');
  }
  return DEMO_CONTRIBUTIONS.filter(c => c.pool_id === poolId);
}

export async function createProject(project: Partial<Project>): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating project:', error);
    return null;
  }
  return data;
}

export async function createContribution(contribution: Partial<ProjectContribution>): Promise<ProjectContribution | null> {
  const { data, error } = await supabase
    .from('project_contributions')
    .insert(contribution)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating contribution:', error);
    return null;
  }
  return data;
}
