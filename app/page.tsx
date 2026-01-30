'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Button, Card, CardContent, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui';
import { PoolCard } from './components/PoolCard';
import { CreatePoolForm } from './components/CreatePoolForm';
import { getPools, Pool } from './lib/supabase';
import { formatAmount, formatAddress } from './lib/utils';
import { Plus, Wallet, TrendingUp, Users, Coins, Zap } from 'lucide-react';
import { ConnectWallet, ConnectWalletText } from '@coinbase/onchainkit/wallet';

// Demo pools for when DB is empty
const demoPools: Pool[] = [
  {
    id: 'demo-1',
    name: 'Alpha Friends Circle',
    description: 'Web3 builders pooling funds to support early-stage projects',
    deposit_token: 'USDC',
    total_deposited: 15000,
    member_count: 5,
    active_requests: 2,
    admin_address: '0x1234...5678',
    voting_period_days: 3,
    quorum_percent: 50,
    approval_threshold_percent: 60,
    guardian_threshold_percent: 20,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    name: 'DeFi Degens DAO',
    description: 'High-risk, high-reward funding for innovative DeFi protocols',
    deposit_token: 'ETH',
    total_deposited: 25,
    member_count: 12,
    active_requests: 1,
    admin_address: '0xabcd...efgh',
    voting_period_days: 5,
    quorum_percent: 40,
    approval_threshold_percent: 66,
    guardian_threshold_percent: 25,
    created_at: new Date().toISOString(),
  },
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

  const loadPools = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPools();
      // Use demo pools if DB is empty or not configured
      setPools(data.length > 0 ? data : demoPools);
    } catch (error) {
      console.error('Error loading pools:', error);
      setPools(demoPools);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPools();
  }, [loadPools]);

  const handlePoolCreated = () => {
    setShowCreateForm(false);
    loadPools();
  };

  // Stats
  const totalTVL = pools.reduce((acc, p) => {
    if (p.deposit_token === 'ETH') return acc + p.total_deposited * 2500; // Rough ETH price
    return acc + p.total_deposited;
  }, 0);
  const totalMembers = pools.reduce((acc, p) => acc + p.member_count, 0);
  const activeRequests = pools.reduce((acc, p) => acc + p.active_requests, 0);

  return (
    <main className="min-h-screen bg-[hsl(240,10%,3.9%)] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[hsl(240,10%,3.9%)]/80 border-b border-[hsl(240,3.7%,15.9%)]">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">PCC</span>
          </div>
          
          {isConnected ? (
            <Badge variant="secondary" className="font-mono">
              {formatAddress(address || '')}
            </Badge>
          ) : (
            <ConnectWallet>
              <ConnectWalletText>Connect</ConnectWalletText>
            </ConnectWallet>
          )}
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Peer Credit Circles</h1>
          <p className="text-[hsl(240,5%,64.9%)] text-sm">
            Pool funds with friends. Fund projects together. Share rewards.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center p-3">
            <Coins className="w-5 h-5 mx-auto mb-1 text-[hsl(142,76%,36%)]" />
            <div className="text-lg font-bold">${formatAmount(totalTVL, 0)}</div>
            <div className="text-xs text-[hsl(240,5%,64.9%)]">Total TVL</div>
          </Card>
          <Card className="text-center p-3">
            <Users className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <div className="text-lg font-bold">{totalMembers}</div>
            <div className="text-xs text-[hsl(240,5%,64.9%)]">Members</div>
          </Card>
          <Card className="text-center p-3">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
            <div className="text-lg font-bold">{activeRequests}</div>
            <div className="text-xs text-[hsl(240,5%,64.9%)]">Active</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="all">All Pools</TabsTrigger>
            <TabsTrigger value="my">My Pools</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Card key={i} className="h-32 animate-pulse bg-[hsl(240,10%,8%)]" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {pools.map((pool) => (
                  <PoolCard
                    key={pool.id}
                    pool={pool}
                    onClick={() => setSelectedPool(pool)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my">
            {!isConnected ? (
              <Card className="text-center py-8">
                <Wallet className="w-10 h-10 mx-auto mb-3 text-[hsl(240,5%,64.9%)]" />
                <p className="text-[hsl(240,5%,64.9%)] mb-4">Connect wallet to see your pools</p>
                <ConnectWallet>
                  <ConnectWalletText>Connect Wallet</ConnectWalletText>
                </ConnectWallet>
              </Card>
            ) : (
              <div className="space-y-3">
                {pools
                  .filter((p) => p.admin_address.toLowerCase() === address?.toLowerCase())
                  .map((pool) => (
                    <PoolCard
                      key={pool.id}
                      pool={pool}
                      onClick={() => setSelectedPool(pool)}
                    />
                  ))}
                {pools.filter((p) => p.admin_address.toLowerCase() === address?.toLowerCase()).length === 0 && (
                  <Card className="text-center py-8">
                    <p className="text-[hsl(240,5%,64.9%)] mb-4">You haven't created any pools yet</p>
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="w-4 h-4" />
                      Create Your First Pool
                    </Button>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* FAB */}
      {isConnected && (
        <div className="fixed bottom-6 right-6">
          <Button
            size="lg"
            className="rounded-full shadow-xl shadow-green-500/30 h-14 w-14"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Create Pool Modal */}
      {showCreateForm && address && (
        <CreatePoolForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handlePoolCreated}
          userAddress={address}
        />
      )}

      {/* Pool Detail Modal */}
      {selectedPool && (
        <PoolDetailModal
          pool={selectedPool}
          onClose={() => setSelectedPool(null)}
          userAddress={address}
        />
      )}
    </main>
  );
}

// Pool Detail Modal Component
function PoolDetailModal({ pool, onClose, userAddress }: { pool: Pool; onClose: () => void; userAddress?: string }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[hsl(240,10%,5%)] rounded-t-2xl sm:rounded-2xl border border-[hsl(240,3.7%,15.9%)] animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-[hsl(240,10%,5%)] border-b border-[hsl(240,3.7%,15.9%)] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{pool.name}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
          {pool.description && (
            <p className="text-sm text-[hsl(240,5%,64.9%)] mt-1">{pool.description}</p>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="text-sm text-[hsl(240,5%,64.9%)]">Total Deposited</div>
              <div className="text-xl font-bold">{formatAmount(pool.total_deposited)} {pool.deposit_token}</div>
            </Card>
            <Card className="p-3">
              <div className="text-sm text-[hsl(240,5%,64.9%)]">Members</div>
              <div className="text-xl font-bold">{pool.member_count}</div>
            </Card>
          </div>

          {/* Config */}
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold">Pool Configuration</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-[hsl(240,5%,64.9%)]">Voting Period</div>
              <div>{pool.voting_period_days} days</div>
              <div className="text-[hsl(240,5%,64.9%)]">Quorum</div>
              <div>{pool.quorum_percent}%</div>
              <div className="text-[hsl(240,5%,64.9%)]">Approval Threshold</div>
              <div>{pool.approval_threshold_percent}%</div>
              <div className="text-[hsl(240,5%,64.9%)]">Guardian Threshold</div>
              <div>{pool.guardian_threshold_percent}%</div>
            </div>
          </Card>

          {/* Active Requests */}
          {pool.active_requests > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Active Requests</h3>
                <Badge variant="warning">{pool.active_requests}</Badge>
              </div>
              <p className="text-sm text-[hsl(240,5%,64.9%)]">
                Voting is in progress. Connect wallet to participate.
              </p>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full" variant="default">
              <Coins className="w-4 h-4" />
              Deposit Funds
            </Button>
            <Button className="w-full" variant="secondary">
              <Plus className="w-4 h-4" />
              Request Funding
            </Button>
          </div>

          {/* Admin Notice */}
          {userAddress && pool.admin_address.toLowerCase() === userAddress.toLowerCase() && (
            <Card className="p-3 border-[hsl(142,76%,36%)]">
              <div className="flex items-center gap-2 text-sm text-[hsl(142,76%,36%)]">
                <Zap className="w-4 h-4" />
                You are the admin of this pool
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
