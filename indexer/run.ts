// Indexer runner script
// Usage: npx tsx indexer/run.ts

import { runIndexer } from './index';

// Check for required env vars
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = required.filter(key => !process.env[key] && !process.env[`NEXT_PUBLIC_${key}`]);

if (missing.length > 0) {
  console.error('Missing required environment variables:');
  missing.forEach(key => console.error(`  - ${key}`));
  console.error('\nMake sure to set these in your .env file or environment.');
  process.exit(1);
}

console.log('Environment check passed ✓');
console.log('');

// Run indexer
runIndexer(false).catch(err => {
  console.error('Fatal indexer error:', err);
  process.exit(1);
});
