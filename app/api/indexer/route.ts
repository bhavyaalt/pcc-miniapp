// API route for indexer (can be called by Vercel cron)
import { NextResponse } from 'next/server';
import { createPublicClient, http, parseAbiItem, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { createClient } from '@supabase/supabase-js';

const CONFIG = {
  chainId: 84532,
  rpcUrl: 'https://sepolia.base.org',
  poolFactory: '0x3A15E25Fed95d1092F593aD72B395835edec8ce6' as `0x${string}`,
  batchSize: 500,
};

const POOL_FACTORY_ABI = [
  {
    type: 'function',
    name: 'getAllPools',
    inputs: [],
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
  },
] as const;

const POOL_ABI = [
  {
    type: 'function',
    name: 'config',
    inputs: [],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'depositToken', type: 'address' },
      { name: 'minDeposit', type: 'uint256' },
      { name: 'votingPeriod', type: 'uint256' },
      { name: 'quorumBps', type: 'uint256' },
      { name: 'approvalThresholdBps', type: 'uint256' },
      { name: 'guardianThresholdBps', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'admin',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalDeposited',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;

const ERC20_ABI = [
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
] as const;

export async function GET(request: Request) {
  // Verify cron secret (optional security)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow if no secret is set, or if it matches
    if (process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 });
  }

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(CONFIG.rpcUrl),
  });

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get all pools from factory
    const pools = await publicClient.readContract({
      address: CONFIG.poolFactory,
      abi: POOL_FACTORY_ABI,
      functionName: 'getAllPools',
    }) as string[];

    console.log(`Found ${pools.length} pools`);

    let indexed = 0;
    
    for (const poolAddress of pools) {
      try {
        // Fetch pool data
        const [configData, admin, totalDeposited] = await Promise.all([
          publicClient.readContract({
            address: poolAddress as `0x${string}`,
            abi: POOL_ABI,
            functionName: 'config',
          }),
          publicClient.readContract({
            address: poolAddress as `0x${string}`,
            abi: POOL_ABI,
            functionName: 'admin',
          }),
          publicClient.readContract({
            address: poolAddress as `0x${string}`,
            abi: POOL_ABI,
            functionName: 'totalDeposited',
          }),
        ]);

        // Get token info
        let tokenSymbol = 'USDC';
        let tokenDecimals = 6;
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
          console.warn('Could not fetch token info, using defaults');
        }

        const poolData = {
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
          total_deposited: formatUnits(totalDeposited as bigint, tokenDecimals),
          chain_id: CONFIG.chainId,
          is_active: true,
        };

        // Upsert to DB
        const { error } = await supabase
          .from('pools')
          .upsert(poolData, { onConflict: 'address' });

        if (error) {
          console.error(`Error upserting pool ${poolAddress}:`, error);
        } else {
          indexed++;
          console.log(`✓ Indexed pool: ${poolData.name}`);
        }
      } catch (e) {
        console.error(`Error processing pool ${poolAddress}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      poolsFound: pools.length,
      poolsIndexed: indexed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Indexer error:', error);
    return NextResponse.json(
      { error: 'Indexer failed', details: String(error) },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: Request) {
  return GET(request);
}
