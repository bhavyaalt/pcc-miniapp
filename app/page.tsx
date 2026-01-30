'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Plus, LayoutGrid, Info, Users, CheckSquare, ChevronRight, TrendingUp } from 'lucide-react';

// Demo data
const demoPools = [
  { id: '1', name: 'Alpha Ventures', token: 'USDC', yourShare: 12376, sharePercent: 75, totalDeposited: 16500 },
  { id: '2', name: 'Creator Grant', token: 'ETH', yourShare: 9800, sharePercent: 59, totalDeposited: 16610 },
  { id: '3', name: 'Family Fund', token: 'DAI', yourShare: 5200, sharePercent: 42, totalDeposited: 12380 },
];

const demoRequest = {
  id: '802',
  title: 'Funding Request',
  amount: 44205,
  approvedPercent: 75,
  timeLeft: '2h left',
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('dashboard');

  const totalPooledValue = 154520;
  const monthlyChange = 12.6;

  const formatMoney = (n: number) => n.toLocaleString();

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
                className="bg-[#1a1a1f] rounded-full px-4 py-1.5 text-sm"
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
          {formatMoney(totalPooledValue)}
          <span className="text-[#22c55e] text-3xl">$</span>
        </h1>
        <p className="text-[#22c55e] text-sm">
          <TrendingUp className="w-3 h-3 inline mr-1" />
          +{monthlyChange}% <span className="text-[#666]">this month</span>
        </p>
      </section>

      {/* Tabs */}
      <nav className="px-5 mb-6">
        <div className="flex gap-1">
          {['Dashboard', 'My Pools', 'Activity', 'Settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
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

      {/* Action Required */}
      <section className="px-5 mb-6">
        <p className="text-[#666] text-xs tracking-wider mb-3">ACTION REQUIRED</p>
        <div className="bg-gradient-to-br from-[#22c55e] to-[#16a34a] rounded-2xl p-5 relative overflow-hidden">
          {/* Subtle pattern overlay */}
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
            
            <p className="text-white/80 text-sm mb-1">Funding Request #{demoRequest.id}</p>
            <p className="text-4xl font-bold text-white mb-4">
              {formatMoney(demoRequest.amount)}
              <span className="text-2xl">$</span>
            </p>
            
            {/* Progress bar */}
            <div className="h-1.5 bg-black/20 rounded-full mb-2">
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${demoRequest.approvedPercent}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-white font-medium">{demoRequest.approvedPercent}% Approved</span>
              <span className="text-white/70">{demoRequest.timeLeft}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Active Pools */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[#666] text-xs tracking-wider">ACTIVE POOLS</p>
          <ChevronRight className="w-4 h-4 text-[#666]" />
        </div>
        
        <div className="space-y-3">
          {demoPools.map((pool) => (
            <div 
              key={pool.id}
              className="bg-[#111116] border border-[#222] rounded-2xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{pool.name}</h3>
                </div>
                <p className="text-[#666] text-xs mb-1">Your Share</p>
                <p className="text-2xl font-bold">
                  {formatMoney(pool.yourShare)}
                  <span className="text-[#22c55e] text-lg">$</span>
                </p>
              </div>
              
              <div className="text-right">
                <span className="text-[#666] text-sm">{pool.token}</span>
                <div className="mt-2">
                  {pool.sharePercent >= 70 ? (
                    <span className="text-[#22c55e] font-semibold text-lg">{pool.sharePercent}%</span>
                  ) : (
                    <span className="text-[#888] font-medium">{pool.sharePercent}%</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-lg border-t border-[#222] px-6 py-4">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-white">
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button className="flex flex-col items-center gap-1 text-[#666]">
            <Info className="w-5 h-5" />
          </button>
          
          {/* Center FAB */}
          <button className="w-12 h-12 bg-[#22c55e] rounded-full flex items-center justify-center -mt-6 shadow-lg shadow-[#22c55e]/30">
            <Plus className="w-6 h-6 text-black" />
          </button>
          
          <button className="flex flex-col items-center gap-1 text-[#666]">
            <Users className="w-5 h-5" />
          </button>
          <button className="flex flex-col items-center gap-1 text-[#666]">
            <CheckSquare className="w-5 h-5" />
          </button>
        </div>
      </nav>
    </main>
  );
}
