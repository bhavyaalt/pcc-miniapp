// Indexer Configuration

export const config = {
  // Chain
  chainId: 84532, // Base Sepolia
  rpcUrl: process.env.RPC_URL || 'https://sepolia.base.org',
  
  // Contracts
  poolFactory: '0x3A15E25Fed95d1092F593aD72B395835edec8ce6' as `0x${string}`,
  
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Indexer settings
  pollingInterval: 5000, // 5 seconds
  batchSize: 1000, // Max events per query
  startBlock: BigInt(process.env.START_BLOCK || '0'), // Block to start indexing from
};

// Validate config
export function validateConfig() {
  if (!config.supabaseUrl) throw new Error('SUPABASE_URL is required');
  if (!config.supabaseServiceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}
