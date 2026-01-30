'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Clock, TrendingUp, Plus, ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react';
import { Pool, PoolMember, FundingRequest, getPoolMembers, getFundingRequests } from '../lib/supabase';

interface PoolDetailProps {
  pool: Pool;
  userAddress?: string;
  userShare?: { amount: number; percent: number };
  onBack: () => void;
  onCreateRequest: () => void;
}

export function PoolDetail({ pool, userAddress, userShare, onBack, onCreateRequest }: PoolDetailProps) {
  const [members, setMembers] = useState<PoolMember[]>([]);
  const [requests, setRequests] = useState<FundingRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'members'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [membersData, requestsData] = await Promise.all([
        getPoolMembers(pool.id),
        getFundingRequests(pool.id),
      ]);
      setMembers(membersData);
      setRequests(requestsData);
      setLoading(false);
    }
    loadData();
  }, [pool.id]);

  const formatMoney = (n: number) => n.toLocaleString();
  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const activeRequests = requests.filter(r => r.status === 'VOTING');
  const totalMembers = members.length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-[#888] mb-4 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{pool.name}</h1>
            <p className="text-[#888] text-sm mt-1">{pool.description}</p>
          </div>
          <span className="bg-[#111116] border border-[#222] rounded-full px-3 py-1 text-sm">
            {pool.deposit_token}
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#111116] border border-[#222] rounded-2xl p-4">
            <p className="text-[#888] text-xs mb-1">Total Pooled</p>
            <p className="text-2xl font-bold">
              {formatMoney(pool.total_deposited)}
              <span className="text-[#22c55e] text-lg ml-1">{pool.deposit_token === 'ETH' ? 'Ξ' : '$'}</span>
            </p>
          </div>
          <div className="bg-[#111116] border border-[#222] rounded-2xl p-4">
            <p className="text-[#888] text-xs mb-1">Your Share</p>
            <p className="text-2xl font-bold">
              {userShare ? formatMoney(userShare.amount) : '0'}
              <span className="text-[#22c55e] text-lg ml-1">{userShare ? `${userShare.percent.toFixed(1)}%` : ''}</span>
            </p>
          </div>
          <div className="bg-[#111116] border border-[#222] rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#888]" />
              <p className="text-[#888] text-xs">Members</p>
            </div>
            <p className="text-xl font-bold mt-1">{totalMembers}</p>
          </div>
          <div className="bg-[#111116] border border-[#222] rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#888]" />
              <p className="text-[#888] text-xs">Active Requests</p>
            </div>
            <p className="text-xl font-bold mt-1">{activeRequests.length}</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      {userAddress && (
        <section className="px-5 py-2">
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#22c55e] text-black font-semibold py-3 rounded-xl">
              <ArrowDownLeft className="w-4 h-4" />
              Deposit
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-[#111116] border border-[#222] font-semibold py-3 rounded-xl hover:border-[#444]">
              <ArrowUpRight className="w-4 h-4" />
              Withdraw
            </button>
          </div>
        </section>
      )}

      {/* Tabs */}
      <nav className="px-5 py-4">
        <div className="flex gap-1 bg-[#111116] p-1 rounded-xl">
          {(['overview', 'requests', 'members'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <section className="px-5">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Active Requests Preview */}
            {activeRequests.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[#888] text-xs tracking-wider">PENDING VOTES</p>
                  <button 
                    onClick={() => setActiveTab('requests')}
                    className="text-[#22c55e] text-sm"
                  >
                    See all
                  </button>
                </div>
                {activeRequests.slice(0, 2).map((request) => (
                  <RequestCard key={request.id} request={request} token={pool.deposit_token} />
                ))}
              </div>
            )}

            {/* Pool Rules */}
            <div>
              <p className="text-[#888] text-xs tracking-wider mb-3">POOL RULES</p>
              <div className="bg-[#111116] border border-[#222] rounded-2xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#888]">Min Deposit</span>
                  <span>{pool.min_deposit} {pool.deposit_token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">Voting Period</span>
                  <span>{pool.voting_period_hours}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">Quorum Required</span>
                  <span>{pool.quorum_percent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">Approval Threshold</span>
                  <span>{pool.approval_threshold_percent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">Guardian Threshold</span>
                  <span>{pool.guardian_threshold_percent}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[#888] text-xs tracking-wider">FUNDING REQUESTS</p>
              <button
                onClick={onCreateRequest}
                className="flex items-center gap-1 text-[#22c55e] text-sm"
              >
                <Plus className="w-4 h-4" />
                New Request
              </button>
            </div>
            {loading ? (
              <div className="text-center py-8 text-[#888]">Loading...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#888] mb-4">No funding requests yet</p>
                <button
                  onClick={onCreateRequest}
                  className="bg-[#22c55e] text-black font-semibold px-6 py-3 rounded-xl"
                >
                  Create First Request
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <RequestCard key={request.id} request={request} token={pool.deposit_token} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <p className="text-[#888] text-xs tracking-wider mb-4">MEMBERS ({totalMembers})</p>
            {loading ? (
              <div className="text-center py-8 text-[#888]">Loading...</div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-[#111116] border border-[#222] rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#222] rounded-full flex items-center justify-center">
                        <span className="text-sm">👤</span>
                      </div>
                      <div>
                        <p className="font-medium">{member.display_name || formatAddress(member.wallet_address)}</p>
                        <p className="text-[#888] text-xs">
                          {member.is_guardian && <span className="text-[#22c55e]">Guardian · </span>}
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatMoney(member.deposited_amount)}</p>
                      <p className="text-[#888] text-xs">
                        {((member.deposited_amount / pool.total_deposited) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function RequestCard({ request, token }: { request: FundingRequest; token: string }) {
  const totalVotes = request.yes_votes + request.no_votes;
  const approvalPercent = totalVotes > 0 ? (request.yes_votes / totalVotes) * 100 : 0;
  const isVoting = request.status === 'VOTING';
  
  const timeLeft = isVoting ? getTimeLeft(request.voting_ends_at) : null;

  return (
    <div className={`rounded-2xl p-4 mb-3 ${
      isVoting 
        ? 'bg-gradient-to-br from-[#22c55e]/20 to-[#16a34a]/10 border border-[#22c55e]/30' 
        : 'bg-[#111116] border border-[#222]'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          isVoting ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#222] text-[#888]'
        }`}>
          {request.status}
        </span>
        {timeLeft && <span className="text-[#888] text-xs">{timeLeft}</span>}
      </div>
      
      <h3 className="font-semibold mb-1">{request.title}</h3>
      <p className="text-2xl font-bold mb-3">
        {request.amount.toLocaleString()}
        <span className="text-[#22c55e] text-lg ml-1">{token === 'ETH' ? 'Ξ' : '$'}</span>
      </p>
      
      {isVoting && (
        <>
          <div className="h-1.5 bg-[#222] rounded-full mb-2">
            <div 
              className="h-full bg-[#22c55e] rounded-full transition-all"
              style={{ width: `${approvalPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#22c55e]">{approvalPercent.toFixed(0)}% Approved</span>
            <ChevronRight className="w-4 h-4 text-[#888]" />
          </div>
        </>
      )}
    </div>
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
