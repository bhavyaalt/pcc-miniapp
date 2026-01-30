'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createFundingRequest, Pool } from '../lib/supabase';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pool: Pool;
  requesterAddress: string;
}

export function CreateRequestModal({ isOpen, onClose, onSuccess, pool, requesterAddress }: CreateRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    request_type: 'GRANT' as 'GRANT' | 'LOAN' | 'INVESTMENT',
    reward_bps: 0,
    duration_days: 30,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const votingEndsAt = new Date();
      votingEndsAt.setHours(votingEndsAt.getHours() + pool.voting_period_hours);

      const request = await createFundingRequest({
        pool_id: pool.id,
        requester_address: requesterAddress,
        title: form.title,
        description: form.description,
        amount: parseFloat(form.amount),
        request_type: form.request_type,
        reward_bps: form.reward_bps,
        duration_days: form.duration_days,
        collateral_amount: 0,
        status: 'VOTING',
        yes_votes: 0,
        no_votes: 0,
        guardian_approvals: 0,
        voting_ends_at: votingEndsAt.toISOString(),
      });

      if (request) {
        onSuccess();
        onClose();
        setForm({
          title: '',
          description: '',
          amount: '',
          request_type: 'GRANT',
          reward_bps: 0,
          duration_days: 30,
        });
      }
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80">
      <div className="w-full max-w-md bg-[#0a0a0f] border-t border-[#222] rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a0f] px-5 py-4 border-b border-[#222] flex items-center justify-between">
          <h2 className="text-lg font-semibold">Request Funding</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
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
              {(['GRANT', 'LOAN', 'INVESTMENT'] as const).map((type) => (
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
                  {type}
                </button>
              ))}
            </div>
            <p className="text-[#666] text-xs mt-2">
              {form.request_type === 'GRANT' && 'No repayment required - for community contributions'}
              {form.request_type === 'LOAN' && 'Requires collateral and repayment with interest'}
              {form.request_type === 'INVESTMENT' && 'Pool invests for a share of returns'}
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
                step={pool.deposit_token === 'ETH' ? 0.01 : 1}
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888]">
                {pool.deposit_token}
              </span>
            </div>
            <p className="text-[#666] text-xs mt-1">
              Pool has {pool.total_deposited.toLocaleString()} {pool.deposit_token} available
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
          {form.request_type !== 'GRANT' && (
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
              • {pool.voting_period_hours}h voting period<br/>
              • {pool.quorum_percent}% quorum required<br/>
              • {pool.approval_threshold_percent}% approval to pass
              {parseFloat(form.amount) > pool.total_deposited * (pool.guardian_threshold_percent / 100) && (
                <><br/>• ⚠️ Requires guardian approval (large request)</>
              )}
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.title || !form.amount}
            className="w-full bg-[#22c55e] text-black font-semibold py-4 rounded-xl hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
