'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useCreatePool } from '../hooks/useContracts';
import { CONTRACTS } from '../lib/contracts';
import { parseUnits } from 'viem';

interface CreatePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adminAddress: string;
}

// Token options for Base Sepolia
const TOKEN_OPTIONS = [
  { symbol: 'USDC', address: CONTRACTS.USDC, decimals: 6 },
  // Add more tokens as needed
];

export function CreatePoolModal({ isOpen, onClose, onSuccess, adminAddress }: CreatePoolModalProps) {
  const { createPool, isPending, isConfirming, isSuccess, error } = useCreatePool();
  
  const [form, setForm] = useState({
    name: '',
    depositToken: TOKEN_OPTIONS[0],
    minDeposit: '100',
    votingPeriodHours: 72,
    quorumPercent: 50,
    approvalThresholdPercent: 60,
    guardianThresholdPercent: 20,
    guardians: [''] as string[],
  });

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      onSuccess();
      onClose();
      // Reset form
      setForm({
        name: '',
        depositToken: TOKEN_OPTIONS[0],
        minDeposit: '100',
        votingPeriodHours: 72,
        quorumPercent: 50,
        approvalThresholdPercent: 60,
        guardianThresholdPercent: 20,
        guardians: [''],
      });
    }
  }, [isSuccess, onSuccess, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty guardian addresses
    const validGuardians = form.guardians
      .filter(g => g.trim() !== '' && g.startsWith('0x') && g.length === 42)
      .map(g => g as `0x${string}`);

    // Convert values
    const minDepositBigInt = parseUnits(form.minDeposit, form.depositToken.decimals);
    const votingPeriodSeconds = BigInt(form.votingPeriodHours * 3600);
    const quorumBps = BigInt(form.quorumPercent * 100);
    const approvalBps = BigInt(form.approvalThresholdPercent * 100);
    const guardianBps = BigInt(form.guardianThresholdPercent * 100);

    createPool({
      name: form.name,
      depositToken: form.depositToken.address as `0x${string}`,
      minDeposit: minDepositBigInt,
      votingPeriod: votingPeriodSeconds,
      quorumBps,
      approvalThresholdBps: approvalBps,
      guardianThresholdBps: guardianBps,
      guardians: validGuardians,
    });
  };

  const addGuardian = () => {
    setForm({ ...form, guardians: [...form.guardians, ''] });
  };

  const removeGuardian = (index: number) => {
    const newGuardians = form.guardians.filter((_, i) => i !== index);
    setForm({ ...form, guardians: newGuardians.length > 0 ? newGuardians : [''] });
  };

  const updateGuardian = (index: number, value: string) => {
    const newGuardians = [...form.guardians];
    newGuardians[index] = value;
    setForm({ ...form, guardians: newGuardians });
  };

  const isLoading = isPending || isConfirming;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80">
      <div className="w-full max-w-md bg-[#0a0a0f] border-t border-[#222] rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a0f] px-5 py-4 border-b border-[#222] flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">Create Pool</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error.message || 'Transaction failed'}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Pool Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Alpha Ventures"
              className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 focus:outline-none focus:border-[#22c55e]"
              required
            />
          </div>

          {/* Token */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Deposit Token</label>
            <div className="flex gap-2">
              {TOKEN_OPTIONS.map((token) => (
                <button
                  key={token.symbol}
                  type="button"
                  onClick={() => setForm({ ...form, depositToken: token })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    form.depositToken.symbol === token.symbol
                      ? 'bg-[#22c55e] text-black'
                      : 'bg-[#111116] border border-[#222] text-white hover:border-[#444]'
                  }`}
                >
                  {token.symbol}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#666] mt-2 font-mono">
              {form.depositToken.address.slice(0, 10)}...{form.depositToken.address.slice(-8)}
            </p>
          </div>

          {/* Min Deposit */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Minimum Deposit</label>
            <div className="relative">
              <input
                type="number"
                value={form.minDeposit}
                onChange={(e) => setForm({ ...form, minDeposit: e.target.value })}
                className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 pr-16 focus:outline-none focus:border-[#22c55e]"
                min={0}
                step={0.01}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888]">
                {form.depositToken.symbol}
              </span>
            </div>
          </div>

          {/* Voting Period */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Voting Period</label>
            <select
              value={form.votingPeriodHours}
              onChange={(e) => setForm({ ...form, votingPeriodHours: Number(e.target.value) })}
              className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 focus:outline-none focus:border-[#22c55e]"
            >
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={72}>72 hours (3 days)</option>
              <option value={168}>168 hours (1 week)</option>
            </select>
          </div>

          {/* Quorum, Threshold, Guardian Threshold */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-[#888] mb-2">Quorum</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.quorumPercent}
                  onChange={(e) => setForm({ ...form, quorumPercent: Number(e.target.value) })}
                  className="w-full bg-[#111116] border border-[#222] rounded-xl px-3 py-3 pr-7 focus:outline-none focus:border-[#22c55e] text-sm"
                  min={1}
                  max={100}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#888] text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#888] mb-2">Approval</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.approvalThresholdPercent}
                  onChange={(e) => setForm({ ...form, approvalThresholdPercent: Number(e.target.value) })}
                  className="w-full bg-[#111116] border border-[#222] rounded-xl px-3 py-3 pr-7 focus:outline-none focus:border-[#22c55e] text-sm"
                  min={1}
                  max={100}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#888] text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#888] mb-2">Guardian</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.guardianThresholdPercent}
                  onChange={(e) => setForm({ ...form, guardianThresholdPercent: Number(e.target.value) })}
                  className="w-full bg-[#111116] border border-[#222] rounded-xl px-3 py-3 pr-7 focus:outline-none focus:border-[#22c55e] text-sm"
                  min={1}
                  max={100}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#888] text-sm">%</span>
              </div>
            </div>
          </div>

          {/* Guardians */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Guardians (optional)</label>
            <p className="text-xs text-[#666] mb-3">
              Guardians can approve large requests (&gt;{form.guardianThresholdPercent}% of pool)
            </p>
            <div className="space-y-2">
              {form.guardians.map((guardian, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={guardian}
                    onChange={(e) => updateGuardian(index, e.target.value)}
                    placeholder="0x..."
                    className="flex-1 bg-[#111116] border border-[#222] rounded-xl px-4 py-3 focus:outline-none focus:border-[#22c55e] font-mono text-sm"
                  />
                  {form.guardians.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGuardian(index)}
                      className="p-3 bg-[#111116] border border-[#222] rounded-xl hover:border-red-500/50 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addGuardian}
                className="flex items-center gap-2 text-sm text-[#888] hover:text-white"
              >
                <Plus className="w-4 h-4" /> Add Guardian
              </button>
            </div>
          </div>

          {/* Network info */}
          <div className="p-3 bg-[#111116] border border-[#222] rounded-xl">
            <p className="text-xs text-[#888]">
              Network: <span className="text-white">Base Sepolia (Testnet)</span>
            </p>
            <p className="text-xs text-[#888] mt-1">
              Admin: <span className="text-white font-mono">{adminAddress.slice(0, 10)}...{adminAddress.slice(-8)}</span>
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !form.name}
            className="w-full bg-[#22c55e] text-black font-semibold py-4 rounded-xl hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Creating Pool...' : 'Create Pool'}
          </button>
        </form>
      </div>
    </div>
  );
}
