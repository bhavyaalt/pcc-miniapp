// PCC Event Indexer
// Syncs on-chain events to Supabase

import { createPublicClient, http, formatUnits, parseAbiItem, Log } from 'viem';
import { baseSepolia } from 'viem/chains';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config, validateConfig } from './config';
import { POOL_FACTORY_ABI, POOL_ABI, ERC20_ABI } from './abis';

// Types
interface IndexerState {
  lastBlock: bigint;
  pools: Set<string>;
}

// Initialize clients
function initClients() {
  validateConfig();
  
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(config.rpcUrl),
  });
  
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
  
  return { publicClient, supabase };
}

// Get or create indexer state
async function getState(supabase: SupabaseClient): Promise<IndexerState> {
  // Try to get last indexed block from DB
  const { data } = await supabase
    .from('indexer_state')
    .select('*')
    .single();
  
  return {
    lastBlock: data?.last_block ? BigInt(data.last_block) : config.startBlock,
    pools: new Set(data?.pools || []),
  };
}

// Save indexer state
async function saveState(supabase: SupabaseClient, state: IndexerState) {
  await supabase
    .from('indexer_state')
    .upsert({
      id: 1,
      last_block: state.lastBlock.toString(),
      pools: Array.from(state.pools),
      updated_at: new Date().toISOString(),
    });
}

// Fetch pool data from contract
async function fetchPoolData(publicClient: any, poolAddress: `0x${string}`) {
  const [configData, admin, totalDeposited, shareToken] = await Promise.all([
    publicClient.readContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'config',
    }),
    publicClient.readContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'admin',
    }),
    publicClient.readContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'totalDeposited',
    }),
    publicClient.readContract({
      address: poolAddress,
      abi: POOL_ABI,
      functionName: 'shareToken',
    }),
  ]);

  // Get token info
  let tokenSymbol = 'UNKNOWN';
  let tokenDecimals = 18;
  try {
    const [symbol, decimals] = await Promise.all([
      publicClient.readContract({
        address: configData[1] as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }),
      publicClient.readContract({
        address: configData[1] as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
    ]);
    tokenSymbol = symbol as string;
    tokenDecimals = decimals as number;
  } catch (e) {
    console.warn('Could not fetch token info:', e);
  }

  return {
    address: poolAddress.toLowerCase(),
    name: configData[0] as string,
    deposit_token: (configData[1] as string).toLowerCase(),
    deposit_token_symbol: tokenSymbol,
    deposit_token_decimals: tokenDecimals,
    min_deposit: formatUnits(configData[2] as bigint, tokenDecimals),
    voting_period: Number(configData[3]),
    quorum_bps: Number(configData[4]),
    approval_bps: Number(configData[5]),
    guardian_threshold_bps: Number(configData[6]),
    admin_address: (admin as string).toLowerCase(),
    share_token: (shareToken as string).toLowerCase(),
    total_deposited: formatUnits(totalDeposited as bigint, tokenDecimals),
    chain_id: config.chainId,
    is_active: true,
  };
}

// Fetch request data from contract
async function fetchRequestData(publicClient: any, poolAddress: `0x${string}`, requestId: bigint) {
  const request = await publicClient.readContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'getRequest',
    args: [requestId],
  }) as any;

  return {
    pool_address: poolAddress.toLowerCase(),
    onchain_id: Number(request.id),
    requester_address: request.requester.toLowerCase(),
    title: request.title,
    description_uri: request.descriptionUri,
    amount: request.amount.toString(),
    request_type: ['GRANT', 'LOAN', 'INVESTMENT'][request.requestType] || 'GRANT',
    reward_bps: Number(request.rewardBps),
    duration: Number(request.duration),
    collateral_token: request.collateralToken.toLowerCase(),
    collateral_amount: request.collateralAmount.toString(),
    status: ['PENDING', 'VOTING', 'APPROVED', 'REJECTED', 'FUNDED', 'COMPLETED', 'DEFAULTED', 'CANCELLED'][request.status] || 'PENDING',
    voting_ends_at: new Date(Number(request.votingEndsAt) * 1000).toISOString(),
    yes_votes: request.yesVotes.toString(),
    no_votes: request.noVotes.toString(),
    funded_at: request.fundedAt > 0 ? new Date(Number(request.fundedAt) * 1000).toISOString() : null,
  };
}

// Process PoolCreated event
async function handlePoolCreated(
  supabase: SupabaseClient,
  publicClient: any,
  log: Log,
  state: IndexerState
) {
  const poolAddress = log.topics[1] as `0x${string}`;
  const adminAddress = log.topics[2];
  
  console.log(`Processing PoolCreated: ${poolAddress}`);
  
  // Fetch full pool data
  const poolData = await fetchPoolData(publicClient, poolAddress);
  poolData.created_tx = log.transactionHash;
  
  // Upsert to DB
  await supabase.from('pools').upsert(poolData, { onConflict: 'address' });
  
  // Track pool for future events
  state.pools.add(poolAddress.toLowerCase());
  
  console.log(`✓ Pool indexed: ${poolData.name} (${poolAddress})`);
}

// Process Deposited event
async function handleDeposited(
  supabase: SupabaseClient,
  publicClient: any,
  poolAddress: string,
  log: Log
) {
  // Decode log data
  const member = log.topics[1] as string;
  // amount and shares are in log.data
  
  console.log(`Processing Deposited: ${member} to ${poolAddress}`);
  
  // Update pool total
  const totalDeposited = await publicClient.readContract({
    address: poolAddress as `0x${string}`,
    abi: POOL_ABI,
    functionName: 'totalDeposited',
  });
  
  // Get member info
  const memberInfo = await publicClient.readContract({
    address: poolAddress as `0x${string}`,
    abi: POOL_ABI,
    functionName: 'members',
    args: [member],
  }) as any;
  
  // Get share balance
  const shareToken = await publicClient.readContract({
    address: poolAddress as `0x${string}`,
    abi: POOL_ABI,
    functionName: 'shareToken',
  });
  
  const shareBalance = await publicClient.readContract({
    address: shareToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [member],
  });
  
  // Update pool
  await supabase
    .from('pools')
    .update({ total_deposited: formatUnits(totalDeposited as bigint, 6) }) // Assuming 6 decimals for USDC
    .eq('address', poolAddress.toLowerCase());
  
  // Upsert member
  await supabase.from('members').upsert({
    pool_address: poolAddress.toLowerCase(),
    address: member.toLowerCase(),
    is_guardian: memberInfo[1],
    is_active: memberInfo[0],
    shares: formatUnits(shareBalance as bigint, 18),
    joined_at: memberInfo[0] ? new Date(Number(memberInfo[2]) * 1000).toISOString() : new Date().toISOString(),
  }, { onConflict: 'pool_address,address' });
  
  // Record transaction
  await supabase.from('transactions').insert({
    pool_address: poolAddress.toLowerCase(),
    address: member.toLowerCase(),
    tx_type: 'DEPOSIT',
    amount: formatUnits(shareBalance as bigint, 18), // Will be corrected with proper decoding
    tx_hash: log.transactionHash,
    block_number: Number(log.blockNumber),
  });
  
  console.log(`✓ Deposit indexed: ${member}`);
}

// Process VoteCast event
async function handleVoteCast(
  supabase: SupabaseClient,
  publicClient: any,
  poolAddress: string,
  log: Log
) {
  const requestId = BigInt(log.topics[1] as string);
  const voter = log.topics[2] as string;
  
  console.log(`Processing VoteCast: request ${requestId} by ${voter}`);
  
  // Fetch updated request data
  const requestData = await fetchRequestData(publicClient, poolAddress as `0x${string}`, requestId);
  
  // Upsert request
  await supabase.from('requests').upsert(requestData, { onConflict: 'pool_address,onchain_id' });
  
  // Get request ID from DB
  const { data: dbRequest } = await supabase
    .from('requests')
    .select('id')
    .eq('pool_address', poolAddress.toLowerCase())
    .eq('onchain_id', Number(requestId))
    .single();
  
  if (dbRequest) {
    // Record vote (we'd need to decode log.data for support and weight)
    await supabase.from('votes').upsert({
      request_id: dbRequest.id,
      voter_address: voter.toLowerCase(),
      support: true, // Would need to decode from log.data
      weight: '0', // Would need to decode from log.data
      tx_hash: log.transactionHash,
    }, { onConflict: 'request_id,voter_address' });
  }
  
  console.log(`✓ Vote indexed: request ${requestId}`);
}

// Process RequestCreated event
async function handleRequestCreated(
  supabase: SupabaseClient,
  publicClient: any,
  poolAddress: string,
  log: Log
) {
  const requestId = BigInt(log.topics[1] as string);
  
  console.log(`Processing RequestCreated: ${requestId} in ${poolAddress}`);
  
  // Fetch request data
  const requestData = await fetchRequestData(publicClient, poolAddress as `0x${string}`, requestId);
  
  // Upsert request
  await supabase.from('requests').upsert(requestData, { onConflict: 'pool_address,onchain_id' });
  
  console.log(`✓ Request indexed: ${requestId}`);
}

// Process RequestApproved/Rejected/Funded events
async function handleRequestStatusChange(
  supabase: SupabaseClient,
  publicClient: any,
  poolAddress: string,
  log: Log
) {
  const requestId = BigInt(log.topics[1] as string);
  
  console.log(`Processing request status change: ${requestId}`);
  
  // Fetch updated request data
  const requestData = await fetchRequestData(publicClient, poolAddress as `0x${string}`, requestId);
  
  // Update request
  await supabase.from('requests').upsert(requestData, { onConflict: 'pool_address,onchain_id' });
  
  console.log(`✓ Request status updated: ${requestId} -> ${requestData.status}`);
}

// Main indexing loop
async function indexEvents(
  publicClient: any,
  supabase: SupabaseClient,
  state: IndexerState,
  fromBlock: bigint,
  toBlock: bigint
) {
  console.log(`\nIndexing blocks ${fromBlock} to ${toBlock}...`);
  
  // 1. Get PoolCreated events from factory
  const poolCreatedLogs = await publicClient.getLogs({
    address: config.poolFactory,
    event: parseAbiItem('event PoolCreated(address indexed pool, address indexed admin, string name)'),
    fromBlock,
    toBlock,
  });
  
  for (const log of poolCreatedLogs) {
    await handlePoolCreated(supabase, publicClient, log, state);
  }
  
  // 2. Get events from all known pools
  const poolAddresses = Array.from(state.pools);
  
  for (const poolAddress of poolAddresses) {
    // Deposited events
    const depositedLogs = await publicClient.getLogs({
      address: poolAddress as `0x${string}`,
      event: parseAbiItem('event Deposited(address indexed member, uint256 amount, uint256 shares)'),
      fromBlock,
      toBlock,
    });
    for (const log of depositedLogs) {
      await handleDeposited(supabase, publicClient, poolAddress, log);
    }
    
    // RequestCreated events
    const requestCreatedLogs = await publicClient.getLogs({
      address: poolAddress as `0x${string}`,
      event: parseAbiItem('event RequestCreated(uint256 indexed requestId, address indexed requester, uint256 amount, uint8 requestType)'),
      fromBlock,
      toBlock,
    });
    for (const log of requestCreatedLogs) {
      await handleRequestCreated(supabase, publicClient, poolAddress, log);
    }
    
    // VoteCast events
    const voteCastLogs = await publicClient.getLogs({
      address: poolAddress as `0x${string}`,
      event: parseAbiItem('event VoteCast(uint256 indexed requestId, address indexed voter, bool support, uint256 weight)'),
      fromBlock,
      toBlock,
    });
    for (const log of voteCastLogs) {
      await handleVoteCast(supabase, publicClient, poolAddress, log);
    }
    
    // RequestApproved events
    const approvedLogs = await publicClient.getLogs({
      address: poolAddress as `0x${string}`,
      event: parseAbiItem('event RequestApproved(uint256 indexed requestId)'),
      fromBlock,
      toBlock,
    });
    for (const log of approvedLogs) {
      await handleRequestStatusChange(supabase, publicClient, poolAddress, log);
    }
    
    // RequestRejected events
    const rejectedLogs = await publicClient.getLogs({
      address: poolAddress as `0x${string}`,
      event: parseAbiItem('event RequestRejected(uint256 indexed requestId)'),
      fromBlock,
      toBlock,
    });
    for (const log of rejectedLogs) {
      await handleRequestStatusChange(supabase, publicClient, poolAddress, log);
    }
    
    // RequestFunded events
    const fundedLogs = await publicClient.getLogs({
      address: poolAddress as `0x${string}`,
      event: parseAbiItem('event RequestFunded(uint256 indexed requestId, address indexed requester, uint256 amount)'),
      fromBlock,
      toBlock,
    });
    for (const log of fundedLogs) {
      await handleRequestStatusChange(supabase, publicClient, poolAddress, log);
    }
  }
  
  state.lastBlock = toBlock;
}

// Load existing pools from factory
async function loadExistingPools(publicClient: any, state: IndexerState) {
  console.log('Loading existing pools from factory...');
  
  const pools = await publicClient.readContract({
    address: config.poolFactory,
    abi: POOL_FACTORY_ABI,
    functionName: 'getAllPools',
  }) as string[];
  
  for (const pool of pools) {
    state.pools.add(pool.toLowerCase());
  }
  
  console.log(`Found ${pools.length} existing pools`);
}

// Main function
export async function runIndexer(once = false) {
  console.log('🚀 Starting PCC Indexer...');
  console.log(`Chain: Base Sepolia (${config.chainId})`);
  console.log(`Factory: ${config.poolFactory}`);
  
  const { publicClient, supabase } = initClients();
  const state = await getState(supabase);
  
  // Load existing pools
  await loadExistingPools(publicClient, state);
  
  const poll = async () => {
    try {
      const currentBlock = await publicClient.getBlockNumber();
      
      if (state.lastBlock < currentBlock) {
        const toBlock = state.lastBlock + BigInt(config.batchSize) < currentBlock 
          ? state.lastBlock + BigInt(config.batchSize)
          : currentBlock;
        
        await indexEvents(publicClient, supabase, state, state.lastBlock + BigInt(1), toBlock);
        await saveState(supabase, state);
      }
    } catch (error) {
      console.error('Indexer error:', error);
    }
    
    if (!once) {
      setTimeout(poll, config.pollingInterval);
    }
  };
  
  await poll();
}

// Run if called directly
if (require.main === module) {
  runIndexer().catch(console.error);
}
