'use client';

import { useState, useEffect } from 'react';
import { X, ArrowDownLeft, Wallet, AlertCircle, Check } from 'lucide-react';
import { useDeposit, useApproveToken, useTokenBalance, useTokenAllowance, parseTokenAmount, formatTokenAmount } from '../hooks/useContracts';
import { formatUnits, parseUnits } from 'viem';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pool: {
    address: `0x${string}`;
    name: string;
    depositToken: `0x${string}`;
    depositTokenSymbol: string;
    depositTokenDecimals: number;
    minDeposit: bigint;
    totalDeposited: bigint;
  };
  userAddress: `0x${string}`;
}

export function DepositModal({ isOpen, onClose, onSuccess, pool, userAddress }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'amount' | 'approve' | 'deposit' | 'success'>('amount');
  
  // Contract hooks
  const { approve, isPending: isApproving, isConfirming: isApproveConfirming, isSuccess: approveSuccess, error: approveError } = useApproveToken();
  const { deposit, isPending: isDepositing, isConfirming: isDepositConfirming, isSuccess: depositSuccess, error: depositError } = useDeposit();
  
  // Read hooks
  const { data: tokenBalance } = useTokenBalance(pool.depositToken, userAddress);
  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(pool.depositToken, userAddress, pool.address);

  // Handle approve success -> move to deposit
  useEffect(() => {
    if (approveSuccess && step === 'approve') {
      refetchAllowance();
      setStep('deposit');
      // Now deposit
      const amountBigInt = parseUnits(amount, pool.depositTokenDecimals);
      deposit(pool.address, amountBigInt);
    }
  }, [approveSuccess, step, amount, pool, deposit, refetchAllowance]);

  // Handle deposit success
  useEffect(() => {
    if (depositSuccess && step === 'deposit') {
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }
  }, [depositSuccess, step, onSuccess, onClose]);

  if (!isOpen) return null;

  const minDepositFormatted = formatUnits(pool.minDeposit, pool.depositTokenDecimals);
  const balanceFormatted = tokenBalance ? formatUnits(tokenBalance, pool.depositTokenDecimals) : '0';
  
  const suggestedAmounts = pool.depositTokenSymbol === 'ETH' 
    ? ['0.1', '0.5', '1', '2']
    : ['100', '500', '1000', '5000'];

  const handleDeposit = async () => {
    const amountNum = parseFloat(amount);
    const minDepositNum = parseFloat(minDepositFormatted);
    
    if (!amount || amountNum < minDepositNum) return;
    
    const amountBigInt = parseUnits(amount, pool.depositTokenDecimals);
    const currentAllowance = allowance || BigInt(0);

    // Check if we need approval
    if (currentAllowance < amountBigInt) {
      setStep('approve');
      // Approve max amount for convenience
      approve(pool.depositToken, pool.address, amountBigInt);
    } else {
      // Already approved, go straight to deposit
      setStep('deposit');
      deposit(pool.address, amountBigInt);
    }
  };

  const isLoading = isApproving || isApproveConfirming || isDepositing || isDepositConfirming;
  const error = approveError || depositError;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a0a0f] w-full max-w-lg rounded-t-3xl animate-slide-up">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#22c55e]/10 rounded-full flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-[#22c55e]" />
            </div>
            <div>
              <h2 className="font-semibold">Deposit to {pool.name}</h2>
              <p className="text-[#888] text-xs">{pool.depositTokenSymbol}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
              {error.message || 'Transaction failed'}
            </div>
          )}

          {/* Amount Step */}
          {step === 'amount' && (
            <>
              {/* Balance */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#888]">Your balance</span>
                <span className="text-sm font-mono">
                  {parseFloat(balanceFormatted).toFixed(2)} {pool.depositTokenSymbol}
                </span>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-4 text-2xl font-bold text-white placeholder-[#444] focus:border-[#22c55e] focus:outline-none pr-20"
                    min={minDepositFormatted}
                  />
                  <button
                    type="button"
                    onClick={() => setAmount(balanceFormatted)}
                    className="absolute right-16 top-1/2 -translate-y-1/2 text-xs text-[#22c55e] hover:text-[#16a34a]"
                  >
                    MAX
                  </button>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888] font-medium">
                    {pool.depositTokenSymbol}
                  </span>
                </div>
              </div>

              {/* Suggested Amounts */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {suggestedAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-2 rounded-lg text-sm transition-all ${
                      amount === amt
                        ? 'bg-[#22c55e] text-black font-medium'
                        : 'bg-[#111116] border border-[#222] hover:border-[#444]'
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>

              {/* Min Deposit Notice */}
              {pool.minDeposit > BigInt(0) && (
                <div className="flex items-center gap-2 bg-[#111116] border border-[#222] rounded-xl p-3 mb-4 text-sm">
                  <AlertCircle className="w-4 h-4 text-[#888]" />
                  <span className="text-[#888]">Minimum deposit: {minDepositFormatted} {pool.depositTokenSymbol}</span>
                </div>
              )}

              {/* What You Get */}
              <div className="bg-[#111116] border border-[#222] rounded-xl p-4 mb-6">
                <p className="text-[#888] text-sm mb-2">You will receive</p>
                <p className="text-2xl font-bold">
                  {amount || '0'} <span className="text-[#22c55e]">Share Tokens</span>
                </p>
                <p className="text-[#888] text-xs mt-1">
                  1:1 ratio with deposit amount
                </p>
              </div>

              {/* Submit */}
              <button
                onClick={handleDeposit}
                disabled={!amount || parseFloat(amount) < parseFloat(minDepositFormatted) || parseFloat(amount) > parseFloat(balanceFormatted)}
                className="w-full bg-[#22c55e] text-black font-semibold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deposit {amount || '0'} {pool.depositTokenSymbol}
              </button>
            </>
          )}

          {/* Approve Step */}
          {step === 'approve' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#111116] border border-[#222] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Wallet className="w-8 h-8 text-[#22c55e]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Approve Token</h3>
              <p className="text-[#888]">
                {isApproving ? 'Confirm in wallet...' : 'Waiting for confirmation...'}
              </p>
            </div>
          )}

          {/* Deposit Step */}
          {step === 'deposit' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <ArrowDownLeft className="w-8 h-8 text-[#22c55e]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Depositing...</h3>
              <p className="text-[#888]">
                {isDepositing ? 'Confirm in wallet...' : 'Waiting for confirmation...'}
              </p>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-2">Deposit Successful!</h3>
              <p className="text-[#888]">
                You deposited {amount} {pool.depositTokenSymbol} to {pool.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
