'use client';

import { useState, useEffect } from 'react';
import { X, Users, ChevronRight, Check } from 'lucide-react';
import { Pool, Project, getUserPools, createContribution } from '../lib/supabase';

interface FundProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project;
  userAddress: string;
  userPools: Pool[];
}

export function FundProjectModal({ isOpen, onClose, onSuccess, project, userAddress, userPools }: FundProjectModalProps) {
  const [step, setStep] = useState<'select-pool' | 'enter-amount' | 'confirm'>('select-pool');
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const formatMoney = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return `$${n}`;
  };

  const remainingAmount = project.target_amount - project.raised_amount;
  const suggestedAmounts = [
    Math.min(10000, remainingAmount),
    Math.min(25000, remainingAmount),
    Math.min(50000, remainingAmount),
    remainingAmount,
  ].filter((v, i, a) => a.indexOf(v) === i && v > 0);

  const handleSelectPool = (pool: Pool) => {
    setSelectedPool(pool);
    setStep('enter-amount');
  };

  const handleSubmit = async () => {
    if (!selectedPool || !amount) return;
    
    setError('');
    setLoading(true);

    try {
      const contribution = await createContribution({
        project_id: project.id,
        pool_id: selectedPool.id,
        pool_name: selectedPool.name,
        amount: parseFloat(amount),
        status: 'VOTING',
      });

      if (contribution) {
        setStep('confirm');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setError('Failed to submit contribution. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'enter-amount') {
      setStep('select-pool');
      setSelectedPool(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a0a0f] w-full max-w-lg rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a0f] px-5 py-4 border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'select-pool' && step !== 'confirm' && (
              <button onClick={handleBack} className="text-[#888] hover:text-white">
                ←
              </button>
            )}
            <h2 className="text-lg font-semibold">
              {step === 'select-pool' && 'Select Pool'}
              {step === 'enter-amount' && 'Contribution Amount'}
              {step === 'confirm' && 'Success!'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Info */}
        <div className="px-5 py-4 border-b border-[#222]">
          <p className="text-[#888] text-xs mb-1">FUNDING</p>
          <p className="font-semibold">{project.name}</p>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-[#22c55e]">{formatMoney(project.raised_amount)}</span>
            <span className="text-[#888]">of {formatMoney(project.target_amount)}</span>
            <span className="text-[#888]">•</span>
            <span className="text-[#888]">{formatMoney(remainingAmount)} remaining</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Step 1: Select Pool */}
          {step === 'select-pool' && (
            <div>
              <p className="text-[#888] text-sm mb-4">
                Choose which pool to contribute from. Your pool members will vote on this contribution.
              </p>
              
              {userPools.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#888] mb-4">You're not a member of any pools yet</p>
                  <button
                    onClick={onClose}
                    className="text-[#22c55e] font-medium"
                  >
                    Join a pool first →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userPools.map((pool) => (
                    <button
                      key={pool.id}
                      onClick={() => handleSelectPool(pool)}
                      className="w-full bg-[#111116] border border-[#222] rounded-xl p-4 flex items-center justify-between hover:border-[#444] transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#22c55e]/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-[#22c55e]" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{pool.name}</p>
                          <p className="text-[#888] text-sm">
                            {formatMoney(pool.total_deposited)} {pool.deposit_token}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[#888]" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Enter Amount */}
          {step === 'enter-amount' && selectedPool && (
            <div>
              <p className="text-[#888] text-sm mb-4">
                How much should <span className="text-white">{selectedPool.name}</span> contribute?
              </p>

              {/* Amount Input */}
              <div className="mb-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-[#888]">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-[#111116] border border-[#222] rounded-xl pl-10 pr-4 py-4 text-3xl font-bold text-white placeholder-[#444] focus:border-[#22c55e] focus:outline-none text-center"
                    max={Math.min(selectedPool.total_deposited, remainingAmount)}
                  />
                </div>
                <p className="text-center text-[#888] text-sm mt-2">
                  Pool balance: {formatMoney(selectedPool.total_deposited)} {selectedPool.deposit_token}
                </p>
              </div>

              {/* Suggested Amounts */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {suggestedAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className={`py-2 rounded-lg text-sm transition-all ${
                      amount === amt.toString()
                        ? 'bg-[#22c55e] text-black font-medium'
                        : 'bg-[#111116] border border-[#222] hover:border-[#444]'
                    }`}
                  >
                    {formatMoney(amt)}
                  </button>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || !amount || parseFloat(amount) <= 0}
                className="w-full bg-[#22c55e] text-black font-semibold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit for Pool Vote'}
              </button>

              <p className="text-center text-[#888] text-xs mt-3">
                This will create a vote in your pool. Members must approve before funds are sent.
              </p>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-2">Contribution Submitted!</h3>
              <p className="text-[#888]">
                Your pool members will now vote on this {formatMoney(parseFloat(amount))} contribution.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
