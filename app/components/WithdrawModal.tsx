'use client';

import { useState } from 'react';
import { X, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { Pool } from '../lib/supabase';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pool: Pool;
  userShare: { amount: number; percent: number };
  userAddress: string;
}

export function WithdrawModal({ isOpen, onClose, onSuccess, pool, userShare, userAddress }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'amount' | 'confirm' | 'processing' | 'success'>('amount');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const formatMoney = (n: number) => n.toLocaleString();

  const maxWithdraw = userShare.amount;
  const percentages = [25, 50, 75, 100];

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxWithdraw) return;
    
    setLoading(true);
    setStep('processing');

    // Simulate withdrawal
    await new Promise(r => setTimeout(r, 2000));
    setStep('success');
    setLoading(false);

    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1500);
  };

  const setPercentage = (pct: number) => {
    const amt = (maxWithdraw * pct) / 100;
    setAmount(amt.toFixed(pool.deposit_token === 'ETH' ? 4 : 2));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a0a0f] w-full max-w-lg rounded-t-3xl animate-slide-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="font-semibold">Withdraw from {pool.name}</h2>
              <p className="text-[#888] text-xs">Available: {formatMoney(maxWithdraw)} {pool.deposit_token}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Amount Step */}
          {step === 'amount' && (
            <>
              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm text-[#888] mb-2">Withdraw Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-4 text-2xl font-bold text-white placeholder-[#444] focus:border-orange-400 focus:outline-none pr-20"
                    max={maxWithdraw}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888] font-medium">
                    {pool.deposit_token}
                  </span>
                </div>
              </div>

              {/* Percentage Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {percentages.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPercentage(pct)}
                    className="py-2 rounded-lg text-sm bg-[#111116] border border-[#222] hover:border-[#444] transition-all"
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Share Info */}
              <div className="bg-[#111116] border border-[#222] rounded-xl p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-[#888]">Your current share</span>
                  <span>{formatMoney(userShare.amount)} {pool.deposit_token}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-[#888]">Withdrawing</span>
                  <span className="text-orange-400">-{amount || '0'} {pool.deposit_token}</span>
                </div>
                <div className="border-t border-[#222] pt-2 mt-2 flex justify-between font-semibold">
                  <span>Remaining</span>
                  <span>{formatMoney(Math.max(0, userShare.amount - parseFloat(amount || '0')))} {pool.deposit_token}</span>
                </div>
              </div>

              {/* Warning for full withdrawal */}
              {amount && parseFloat(amount) >= maxWithdraw && (
                <div className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-orange-400 font-medium">Full Withdrawal</p>
                    <p className="text-[#888]">You will exit this pool completely and lose your voting power.</p>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={() => setStep('confirm')}
                disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxWithdraw}
                className="w-full bg-orange-500 text-black font-semibold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </>
          )}

          {/* Confirm Step */}
          {step === 'confirm' && (
            <div>
              <div className="bg-[#111116] border border-[#222] rounded-xl p-5 mb-6 text-center">
                <p className="text-[#888] text-sm mb-2">You are withdrawing</p>
                <p className="text-3xl font-bold mb-1">
                  {amount} {pool.deposit_token}
                </p>
                <p className="text-[#888] text-sm">from {pool.name}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('amount')}
                  className="flex-1 bg-[#111116] border border-[#222] font-semibold py-4 rounded-xl"
                >
                  Back
                </button>
                <button
                  onClick={handleWithdraw}
                  className="flex-1 bg-orange-500 text-black font-semibold py-4 rounded-xl"
                >
                  Confirm Withdraw
                </button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <ArrowUpRight className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Processing Withdrawal...</h3>
              <p className="text-[#888]">Please confirm the transaction in your wallet</p>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Withdrawal Complete!</h3>
              <p className="text-[#888]">
                {amount} {pool.deposit_token} has been sent to your wallet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
