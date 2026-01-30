import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client with service role key - use only server-side!
// This bypasses Row Level Security (RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper to run migrations or seed data
export async function seedDemoData() {
  const pools = [
    {
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
    },
    {
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
    },
  ];

  const { data, error } = await supabaseAdmin.from('pools').insert(pools).select();
  
  if (error) {
    console.error('Error seeding pools:', error);
    return null;
  }
  
  console.log('Seeded pools:', data);
  return data;
}
