'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createPool } from '../lib/supabase';

interface CreatePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adminAddress: string;
}

export function CreatePoolModal({ isOpen, onClose, onSuccess, adminAddress }: CreatePoolModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    deposit_token: 'USDC',
    min_deposit: 100,
    voting_period_hours: 72,
    quorum_percent: 50,
    approval_threshold_percent: 60,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pool = await createPool({
        ...form,
        admin_address: adminAddress,
        total_deposited: 0,
        guardian_threshold_percent: 20,
        is_open: true,
      });

      if (pool) {
        onSuccess();
        onClose();
        setForm({
          name: '',
          description: '',
          deposit_token: 'USDC',
          min_deposit: 100,
          voting_period_hours: 72,
          quorum_percent: 50,
          approval_threshold_percent: 60,
        });
      }
    } catch (error) {
      console.error('Error creating pool:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80">
      <div className="w-full max-w-md bg-[#0a0a0f] border-t border-[#222] rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a0f] px-5 py-4 border-b border-[#222] flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Pool</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
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

          {/* Description */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What's this pool for?"
              rows={3}
              className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 focus:outline-none focus:border-[#22c55e] resize-none"
            />
          </div>

          {/* Token */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Deposit Token</label>
            <div className="flex gap-2">
              {['USDC', 'ETH', 'DAI'].map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => setForm({ ...form, deposit_token: token })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    form.deposit_token === token
                      ? 'bg-[#22c55e] text-black'
                      : 'bg-[#111116] border border-[#222] text-white hover:border-[#444]'
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          {/* Min Deposit */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Minimum Deposit</label>
            <div className="relative">
              <input
                type="number"
                value={form.min_deposit}
                onChange={(e) => setForm({ ...form, min_deposit: Number(e.target.value) })}
                className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 pr-16 focus:outline-none focus:border-[#22c55e]"
                min={0}
                step={form.deposit_token === 'ETH' ? 0.01 : 1}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888]">
                {form.deposit_token}
              </span>
            </div>
          </div>

          {/* Voting Period */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Voting Period</label>
            <select
              value={form.voting_period_hours}
              onChange={(e) => setForm({ ...form, voting_period_hours: Number(e.target.value) })}
              className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 focus:outline-none focus:border-[#22c55e]"
            >
              <option value={24}>24 hours</option>
              <option value={48}>48 hours</option>
              <option value={72}>72 hours (3 days)</option>
              <option value={168}>168 hours (1 week)</option>
            </select>
          </div>

          {/* Quorum & Threshold */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#888] mb-2">Quorum</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.quorum_percent}
                  onChange={(e) => setForm({ ...form, quorum_percent: Number(e.target.value) })}
                  className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 pr-8 focus:outline-none focus:border-[#22c55e]"
                  min={1}
                  max={100}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888]">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#888] mb-2">Approval</label>
              <div className="relative">
                <input
                  type="number"
                  value={form.approval_threshold_percent}
                  onChange={(e) => setForm({ ...form, approval_threshold_percent: Number(e.target.value) })}
                  className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 pr-8 focus:outline-none focus:border-[#22c55e]"
                  min={1}
                  max={100}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888]">%</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.name}
            className="w-full bg-[#22c55e] text-black font-semibold py-4 rounded-xl hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Creating...' : 'Create Pool'}
          </button>
        </form>
      </div>
    </div>
  );
}
