'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCreateRequest } from '../hooks/useContracts';
import { RequestType } from '../lib/contracts';
import { parseUnits } from 'viem';

interface Pool {
  address: string;
  name: string;
  deposit_token: string;
  deposit_token_symbol: string;
  deposit_token_decimals: number;
  total_deposited: string;
  voting_period: number;
  quorum_bps: number;
  approval_bps: number;
  guardian_threshold_bps: number;
}

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pool: Pool;
  requesterAddress: string;
}

export function CreateRequestModal({ isOpen, onClose, onSuccess, pool, requesterAddress }: CreateRequestModalProps) {
  const { createRequest, isPending, isConfirming, isSuccess, error } = useCreateRequest();
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    request_type: RequestType.GRANT,
    reward_bps: 0,
    duration_days: 30,
  });

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      onSuccess();
      onClose();
      setForm({
        title: '',
        description: '',
        amount: '',
        request_type: RequestType.GRANT,
        reward_bps: 0,
        duration_days: 30,
      });
    }
  }, [isSuccess, onSuccess, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountBigInt = parseUnits(form.amount, pool.deposit_token_decimals);
    const durationSeconds = BigInt(form.duration_days * 24 * 60 * 60);

    createRequest(pool.address as `0x${string}`, {
      title: form.title,
      descriptionUri: form.description ? `data:text/plain,${encodeURIComponent(form.description)}` : '',
      amount: amountBigInt,
      requestType: form.request_type,
      rewardBps: BigInt(form.reward_bps),
      duration: durationSeconds,
      collateralToken: '0x0000000000000000000000000000000000000000' as `0x${string}`,
      collateralAmount: BigInt(0),
    });
  };

  const isLoading = isPending || isConfirming;
  const votingPeriodHours = Math.floor(pool.voting_period / 3600);
  const totalDeposited = parseFloat(pool.total_deposited);
  const guardianThresholdAmount = totalDeposited * (pool.guardian_threshold_bps / 10000);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80">
      <div className="w-full max-w-md bg-[#0a0a0f] border-t border-[#222] rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a0f] px-5 py-4 border-b border-[#222] flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">Request Funding</h2>
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

          {/* Title */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Build DeFi Analytics Dashboard"
              className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 focus:outline-none focus:border-[#22c55e]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Explain what you'll build and how it benefits the pool..."
              rows={4}
              className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 focus:outline-none focus:border-[#22c55e] resize-none"
            />
          </div>

          {/* Request Type */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Request Type</label>
            <div className="flex gap-2">
              {[
                { type: RequestType.GRANT, label: 'GRANT' },
                { type: RequestType.LOAN, label: 'LOAN' },
                { type: RequestType.INVESTMENT, label: 'INVEST' },
              ].map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, request_type: type })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all text-sm ${
                    form.request_type === type
                      ? 'bg-[#22c55e] text-black'
                      : 'bg-[#111116] border border-[#222] text-white hover:border-[#444]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[#666] text-xs mt-2">
              {form.request_type === RequestType.GRANT && 'No repayment required - for community contributions'}
              {form.request_type === RequestType.LOAN && 'Requires collateral and repayment with interest'}
              {form.request_type === RequestType.INVESTMENT && 'Pool invests for a share of returns'}
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Amount Requested</label>
            <div className="relative">
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="10000"
                className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 pr-16 focus:outline-none focus:border-[#22c55e]"
                min={0}
                step={0.01}
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888]">
                {pool.deposit_token_symbol}
              </span>
            </div>
            <p className="text-[#666] text-xs mt-1">
              Pool has {totalDeposited.toLocaleString()} {pool.deposit_token_symbol} available
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Duration (days to complete)</label>
            <input
              type="number"
              value={form.duration_days}
              onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })}
              className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 focus:outline-none focus:border-[#22c55e]"
              min={1}
              max={365}
            />
          </div>

          {/* Expected Return (for LOAN/INVESTMENT) */}
          {form.request_type !== RequestType.GRANT && (
            <div>
              <label className="block text-sm text-[#888] mb-2">Expected Return (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.reward_bps / 100}
                  onChange={(e) => setForm({ ...form, reward_bps: Number(e.target.value) * 100 })}
                  placeholder="10"
                  className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 pr-8 focus:outline-none focus:border-[#22c55e]"
                  min={0}
                  max={100}
                  step={0.5}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888]">%</span>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-[#111116] border border-[#222] rounded-xl p-4">
            <p className="text-sm text-[#888]">
              <strong className="text-white">Voting Rules:</strong><br/>
              • {votingPeriodHours}h voting period<br/>
              • {pool.quorum_bps / 100}% quorum required<br/>
              • {pool.approval_bps / 100}% approval to pass
              {parseFloat(form.amount || '0') > guardianThresholdAmount && (
                <><br/>• ⚠️ Requires guardian approval (large request)</>
              )}
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !form.title || !form.amount}
            className="w-full bg-[#22c55e] text-black font-semibold py-4 rounded-xl hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Creating...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
