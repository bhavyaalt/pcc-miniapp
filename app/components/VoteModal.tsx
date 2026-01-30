'use client';

import { useState, useEffect } from 'react';
import { X, ThumbsUp, ThumbsDown, Clock, User, FileText, Check } from 'lucide-react';
import { useVote, useHasVoted } from '../hooks/useContracts';
import { RequestType, REQUEST_TYPE_LABELS } from '../lib/contracts';
import { formatUnits } from 'viem';

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  poolAddress: `0x${string}`;
  request: {
    id: bigint;
    title: string;
    description?: string;
    amount: bigint;
    requestType: RequestType;
    requester: `0x${string}`;
    yesVotes: bigint;
    noVotes: bigint;
    votingEndsAt: bigint;
    duration: bigint;
  };
  tokenSymbol: string;
  tokenDecimals: number;
  voterAddress: `0x${string}`;
  votePower: bigint;
}

export function VoteModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  poolAddress,
  request, 
  tokenSymbol, 
  tokenDecimals,
  voterAddress, 
  votePower 
}: VoteModalProps) {
  const [selectedVote, setSelectedVote] = useState<boolean | null>(null);
  const [step, setStep] = useState<'vote' | 'confirming' | 'success'>('vote');
  
  const { vote, isPending, isConfirming, isSuccess, error } = useVote();
  const { data: hasVoted } = useHasVoted(poolAddress, request.id, voterAddress);

  // Handle success
  useEffect(() => {
    if (isSuccess && step === 'confirming') {
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }
  }, [isSuccess, step, onSuccess, onClose]);

  if (!isOpen) return null;

  const totalVotes = request.yesVotes + request.noVotes;
  const approvalPercent = totalVotes > BigInt(0) 
    ? Number((request.yesVotes * BigInt(10000)) / totalVotes) / 100
    : 0;
  const timeLeft = getTimeLeft(Number(request.votingEndsAt) * 1000);
  const amountFormatted = formatUnits(request.amount, tokenDecimals);
  const votePowerFormatted = formatUnits(votePower, 18); // Share tokens have 18 decimals
  const yesVotesFormatted = formatUnits(request.yesVotes, 18);
  const noVotesFormatted = formatUnits(request.noVotes, 18);

  const handleVote = async () => {
    if (selectedVote === null) return;
    setStep('confirming');
    vote(poolAddress, request.id, selectedVote);
  };

  const isLoading = isPending || isConfirming;

  // Already voted
  if (hasVoted) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80">
        <div className="w-full max-w-md bg-[#0a0a0f] border-t border-[#222] rounded-t-3xl p-8 text-center">
          <div className="w-16 h-16 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-[#22c55e]" />
          </div>
          <h3 className="text-xl font-bold mb-2">Already Voted</h3>
          <p className="text-[#888] mb-6">You have already cast your vote on this request.</p>
          <button
            onClick={onClose}
            className="w-full bg-[#222] text-white font-semibold py-4 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80">
      <div className="w-full max-w-md bg-[#0a0a0f] border-t border-[#222] rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a0f] px-5 py-4 border-b border-[#222] flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">Cast Your Vote</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error.message || 'Transaction failed'}
            </div>
          )}

          {step === 'vote' && (
            <>
              {/* Request Info */}
              <div className="bg-gradient-to-br from-[#22c55e]/20 to-[#16a34a]/10 border border-[#22c55e]/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[#22c55e]" />
                  <span className="text-[#22c55e] text-sm font-medium">{timeLeft}</span>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{request.title}</h3>
                
                <p className="text-3xl font-bold mb-4">
                  {parseFloat(amountFormatted).toLocaleString()}
                  <span className="text-[#22c55e] text-xl ml-1">{tokenSymbol}</span>
                </p>

                {request.description && (
                  <p className="text-[#888] text-sm mb-4">{request.description}</p>
                )}

                {/* Current Votes */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#888]">Current approval</span>
                    <span className="text-white font-medium">{approvalPercent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-[#222] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#22c55e] rounded-full transition-all"
                      style={{ width: `${approvalPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[#888]">
                    <span>👍 {parseFloat(yesVotesFormatted).toFixed(0)} YES</span>
                    <span>👎 {parseFloat(noVotesFormatted).toFixed(0)} NO</span>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="bg-[#111116] border border-[#222] rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#888]" />
                  <div>
                    <p className="text-[#888] text-xs">Type</p>
                    <p className="font-medium">{REQUEST_TYPE_LABELS[request.requestType]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[#888]" />
                  <div>
                    <p className="text-[#888] text-xs">Requester</p>
                    <p className="font-medium font-mono text-sm">
                      {request.requester.slice(0, 8)}...{request.requester.slice(-6)}
                    </p>
                  </div>
                </div>
                {request.duration > BigInt(0) && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#888]" />
                    <div>
                      <p className="text-[#888] text-xs">Duration</p>
                      <p className="font-medium">{Number(request.duration) / 86400} days</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Your Vote Power */}
              <div className="bg-[#111116] border border-[#222] rounded-2xl p-4">
                <p className="text-[#888] text-sm mb-1">Your Voting Power</p>
                <p className="text-2xl font-bold">
                  {parseFloat(votePowerFormatted).toFixed(0)}
                  <span className="text-[#888] text-lg ml-2">shares</span>
                </p>
              </div>

              {/* Vote Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedVote(true)}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                    selectedVote === true
                      ? 'bg-[#22c55e] text-black'
                      : 'bg-[#111116] border-2 border-[#222] text-white hover:border-[#22c55e]'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  Vote YES
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedVote(false)}
                  className={`flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all ${
                    selectedVote === false
                      ? 'bg-red-500 text-white'
                      : 'bg-[#111116] border-2 border-[#222] text-white hover:border-red-500'
                  }`}
                >
                  <ThumbsDown className="w-5 h-5" />
                  Vote NO
                </button>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleVote}
                disabled={selectedVote === null}
                className={`w-full font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedVote === true 
                    ? 'bg-[#22c55e] text-black hover:bg-[#16a34a]'
                    : selectedVote === false
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-[#333] text-[#888]'
                }`}
              >
                {selectedVote === null ? 'Select Your Vote' : 'Confirm Vote'}
              </button>

              {/* Warning */}
              <p className="text-[#666] text-xs text-center">
                ⚠️ Your vote cannot be changed after submission
              </p>
            </>
          )}

          {/* Confirming Step */}
          {step === 'confirming' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                {selectedVote ? (
                  <ThumbsUp className="w-8 h-8 text-[#22c55e]" />
                ) : (
                  <ThumbsDown className="w-8 h-8 text-red-500" />
                )}
              </div>
              <h3 className="text-xl font-bold mb-2">Casting Vote...</h3>
              <p className="text-[#888]">
                {isPending ? 'Confirm in wallet...' : 'Waiting for confirmation...'}
              </p>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-bold mb-2">Vote Cast!</h3>
              <p className="text-[#888]">
                Your vote has been recorded on-chain.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeLeft(endTimeMs: number): string {
  const diff = endTimeMs - Date.now();
  if (diff <= 0) return 'Voting ended';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }
  return `${hours}h ${minutes}m left`;
}
