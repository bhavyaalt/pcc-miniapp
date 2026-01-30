'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Plus, LayoutGrid, Info, Users, CheckSquare, ChevronRight, TrendingUp, Settings } from 'lucide-react';
import { getPools, getActiveRequests, Pool, FundingRequest, getUserShare } from './lib/supabase';
import { CreatePoolModal } from './components/CreatePoolModal';
import { PoolDetail } from './components/PoolDetail';
import { CreateRequestModal } from './components/CreateRequestModal';
import { VoteModal } from './components/VoteModal';

type View = 'home' | 'pool-detail' | 'my-pools' | 'activity' | 'settings';

export default function Home() {
  const { address, isConnected } = useAccount();
  
  // State
  const [view, setView] = useState<View>('home');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pools, setPools] = useState<Pool[]>([]);
  const [activeRequests, setActiveRequests] = useState<FundingRequest[]>([]);
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [userShares, setUserShares] = useState<Record<string, { amount: number; percent: number }>>({});
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FundingRequest | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [poolsData, requestsData] = await Promise.all([
        getPools(),
        getActiveRequests(),
      ]);
      setPools(poolsData);
      setActiveRequests(requestsData);

      // Load user shares for each pool
      if (address) {
        const shares: Record<string, { amount: number; percent: number }> = {};
        for (const pool of poolsData) {
          const share = await getUserShare(pool.id, address);
          if (share) shares[pool.id] = share;
        }
        setUserShares(shares);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculations
  const totalPooledValue = pools.reduce((sum, p) => {
    if (p.deposit_token === 'ETH') return sum + p.total_deposited * 2500;
    return sum + p.total_deposited;
  }, 0);

  const userTotalValue = Object.entries(userShares).reduce((sum, [poolId, share]) => {
    const pool = pools.find(p => p.id === poolId);
    if (!pool) return sum;
    if (pool.deposit_token === 'ETH') return sum + share.amount * 2500;
    return sum + share.amount;
  }, 0);

  const formatMoney = (n: number) => n.toLocaleString();

  // Pool detail view
  if (view === 'pool-detail' && selectedPool) {
    return (
      <>
        <PoolDetail
          pool={selectedPool}
          userAddress={address}
          userShare={userShares[selectedPool.id]}
          onBack={() => {
            setView('home');
            setSelectedPool(null);
          }}
          onCreateRequest={() => setShowCreateRequest(true)}
        />
        {showCreateRequest && address && (
          <CreateRequestModal
            isOpen={showCreateRequest}
            onClose={() => setShowCreateRequest(false)}
            onSuccess={loadData}
            pool={selectedPool}
            requesterAddress={address}
          />
        )}
      </>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#22c55e] flex items-center justify-center">
            <span className="text-black font-bold text-sm">cb</span>
          </div>
          <span className="font-semibold text-lg">PCC</span>
        </div>
        
        <ConnectButton.Custom>
          {({ account, openConnectModal, openAccountModal, mounted }) => {
            const connected = mounted && account;
            return connected ? (
              <button 
                onClick={openAccountModal}
                className="flex items-center gap-2 bg-[#1a1a1f] rounded-full pl-3 pr-2 py-1.5"
              >
                <span className="text-sm">{account.displayName}</span>
                <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center">
                  <span className="text-xs">👤</span>
                </div>
              </button>
            ) : (
              <button 
                onClick={openConnectModal}
                className="bg-[#22c55e] text-black rounded-full px-4 py-1.5 text-sm font-medium"
              >
                Connect
              </button>
            );
          }}
        </ConnectButton.Custom>
      </header>

      {/* Hero Stat */}
      <section className="px-5 py-6 text-center">
        <p className="text-[#666] text-xs tracking-wider mb-2">TOTAL POOLED VALUE</p>
        <h1 className="text-5xl font-bold mb-2">
          {formatMoney(Math.round(totalPooledValue))}
          <span className="text-[#22c55e] text-3xl">$</span>
        </h1>
        {isConnected && userTotalValue > 0 && (
          <p className="text-[#22c55e] text-sm">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            Your share: {formatMoney(Math.round(userTotalValue))}$
          </p>
        )}
      </section>

      {/* Tabs */}
      <nav className="px-5 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {['Dashboard', 'My Pools', 'Activity', 'Settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                activeTab === tab.toLowerCase().replace(' ', '-')
                  ? 'bg-white text-black font-medium'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* Content based on active tab */}
      {activeTab === 'dashboard' && (
        <>
          {/* Action Required */}
          {activeRequests.length > 0 && (
            <section className="px-5 mb-6">
              <p className="text-[#666] text-xs tracking-wider mb-3">ACTION REQUIRED</p>
              {activeRequests.slice(0, 1).map((request) => {
                const pool = pools.find(p => p.id === request.pool_id);
                const totalVotes = request.yes_votes + request.no_votes;
                const approvalPercent = totalVotes > 0 ? (request.yes_votes / totalVotes) * 100 : 0;
                const timeLeft = getTimeLeft(request.voting_ends_at);
                
                return (
                  <button
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className="w-full bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-2xl p-5 relative overflow-hidden text-left"
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
                    </div>
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-black/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                          VOTE ENDING SOON
                        </span>
                        <ChevronRight className="w-5 h-5 text-white/80" />
                      </div>
                      
                      <p className="text-white/80 text-sm mb-1">Funding Request #{request.id.slice(-3)}</p>
                      <p className="text-4xl font-bold text-white mb-4">
                        {formatMoney(request.amount)}
                        <span className="text-2xl">{pool?.deposit_token === 'ETH' ? 'Ξ' : '$'}</span>
                      </p>
                      
                      <div className="h-1.5 bg-black/20 rounded-full mb-2">
                        <div 
                          className="h-full bg-white rounded-full transition-all"
                          style={{ width: `${approvalPercent}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-white font-medium">{approvalPercent.toFixed(0)}% Approved</span>
                        <span className="text-white/70">{timeLeft}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          {/* Active Pools */}
          <section className="px-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#666] text-xs tracking-wider">ACTIVE POOLS</p>
              <ChevronRight className="w-4 h-4 text-[#666]" />
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-[#111116] border border-[#222] rounded-2xl p-4 h-24 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {pools.map((pool) => {
                  const userShare = userShares[pool.id];
                  const sharePercent = userShare?.percent || 0;
                  
                  return (
                    <button
                      key={pool.id}
                      onClick={() => {
                        setSelectedPool(pool);
                        setView('pool-detail');
                      }}
                      className="w-full bg-[#111116] border border-[#222] rounded-2xl p-4 flex items-center justify-between text-left hover:border-[#333] transition-all"
                    >
                      <div>
                        <h3 className="font-semibold mb-1">{pool.name}</h3>
                        <p className="text-[#666] text-xs mb-1">
                          {userShare ? 'Your Share' : 'Total Pooled'}
                        </p>
                        <p className="text-2xl font-bold">
                          {formatMoney(userShare?.amount || pool.total_deposited)}
                          <span className="text-[#22c55e] text-lg ml-1">
                            {pool.deposit_token === 'ETH' ? 'Ξ' : '$'}
                          </span>
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[#666] text-sm">{pool.deposit_token}</span>
                        <div className="mt-2">
                          {sharePercent >= 50 ? (
                            <span className="text-[#22c55e] font-semibold text-lg">{sharePercent.toFixed(0)}%</span>
                          ) : sharePercent > 0 ? (
                            <span className="text-[#888] font-medium">{sharePercent.toFixed(0)}%</span>
                          ) : (
                            <ChevronRight className="w-5 h-5 text-[#666] ml-auto" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === 'my-pools' && (
        <section className="px-5">
          <p className="text-[#666] text-xs tracking-wider mb-4">YOUR POOLS</p>
          {!isConnected ? (
            <div className="text-center py-12">
              <p className="text-[#888] mb-4">Connect wallet to see your pools</p>
              <ConnectButton />
            </div>
          ) : Object.keys(userShares).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#888] mb-4">You haven&apos;t joined any pools yet</p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="bg-[#22c55e] text-black font-semibold px-6 py-3 rounded-xl"
              >
                Browse Pools
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pools.filter(p => userShares[p.id]).map((pool) => (
                <button
                  key={pool.id}
                  onClick={() => {
                    setSelectedPool(pool);
                    setView('pool-detail');
                  }}
                  className="w-full bg-[#111116] border border-[#222] rounded-2xl p-4 text-left hover:border-[#333]"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{pool.name}</h3>
                      <p className="text-[#666] text-sm">{pool.deposit_token}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{formatMoney(userShares[pool.id].amount)}</p>
                      <p className="text-[#22c55e] text-sm">{userShares[pool.id].percent.toFixed(1)}%</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'activity' && (
        <section className="px-5">
          <p className="text-[#666] text-xs tracking-wider mb-4">RECENT ACTIVITY</p>
          <div className="text-center py-12 text-[#888]">
            Activity feed coming soon...
          </div>
        </section>
      )}

      {activeTab === 'settings' && (
        <section className="px-5">
          <p className="text-[#666] text-xs tracking-wider mb-4">SETTINGS</p>
          <div className="space-y-3">
            <div className="bg-[#111116] border border-[#222] rounded-2xl p-4">
              <p className="font-medium mb-1">Connected Wallet</p>
              <p className="text-[#888] font-mono text-sm">
                {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'Not connected'}
              </p>
            </div>
            <div className="bg-[#111116] border border-[#222] rounded-2xl p-4">
              <p className="font-medium mb-1">Network</p>
              <p className="text-[#888] text-sm">Base</p>
            </div>
          </div>
        </section>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-lg border-t border-[#222] px-6 py-4">
        <div className="flex items-center justify-around">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-white' : 'text-[#666]'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('my-pools')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'my-pools' ? 'text-white' : 'text-[#666]'}`}
          >
            <Info className="w-5 h-5" />
          </button>
          
          {/* Center FAB */}
          <button 
            onClick={() => setShowCreatePool(true)}
            className="w-12 h-12 bg-[#22c55e] rounded-full flex items-center justify-center -mt-6 shadow-lg shadow-[#22c55e]/30"
          >
            <Plus className="w-6 h-6 text-black" />
          </button>
          
          <button 
            onClick={() => setActiveTab('activity')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'activity' ? 'text-white' : 'text-[#666]'}`}
          >
            <Users className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-white' : 'text-[#666]'}`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Modals */}
      {showCreatePool && address && (
        <CreatePoolModal
          isOpen={showCreatePool}
          onClose={() => setShowCreatePool(false)}
          onSuccess={loadData}
          adminAddress={address}
        />
      )}

      {selectedRequest && selectedPool && address && userShares[selectedPool.id] && (
        <VoteModal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSuccess={loadData}
          request={selectedRequest}
          token={selectedPool.deposit_token}
          voterAddress={address}
          votePower={userShares[selectedPool.id].amount}
        />
      )}
    </main>
  );
}

function getTimeLeft(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d left`;
  }
  return `${hours}h ${minutes}m left`;
}
