'use client';

import { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Clock, User, FileText } from 'lucide-react';
import { FundingRequest, castVote } from '../lib/supabase';

interface VoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  request: FundingRequest;
  token: string;
  voterAddress: string;
  votePower: number;
}

export function VoteModal({ isOpen, onClose, onSuccess, request, token, voterAddress, votePower }: VoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedVote, setSelectedVote] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const totalVotes = request.yes_votes + request.no_votes;
  const approvalPercent = totalVotes > 0 ? (request.yes_votes / totalVotes) * 100 : 0;
  const timeLeft = getTimeLeft(request.voting_ends_at);

  const handleVote = async () => {
    if (selectedVote === null) return;
    setLoading(true);

    try {
      const vote = await castVote(request.id, voterAddress, selectedVote, votePower);
      if (vote) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Error casting vote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80">
      <div className="w-full max-w-md bg-[#0a0a0f] border-t border-[#222] rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a0f] px-5 py-4 border-b border-[#222] flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cast Your Vote</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Request Info */}
          <div className="bg-gradient-to-br from-[#22c55e]/20 to-[#16a34a]/10 border border-[#22c55e]/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#22c55e]" />
              <span className="text-[#22c55e] text-sm font-medium">{timeLeft}</span>
            </div>
            
            <h3 className="text-xl font-bold mb-2">{request.title}</h3>
            
            <p className="text-3xl font-bold mb-4">
              {request.amount.toLocaleString()}
              <span className="text-[#22c55e] text-xl ml-1">{token === 'ETH' ? 'Ξ' : '$'}</span>
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
                <span>👍 {request.yes_votes.toLocaleString()} YES</span>
                <span>👎 {request.no_votes.toLocaleString()} NO</span>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-[#111116] border border-[#222] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-[#888]" />
              <div>
                <p className="text-[#888] text-xs">Type</p>
                <p className="font-medium">{request.request_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-[#888]" />
              <div>
                <p className="text-[#888] text-xs">Requester</p>
                <p className="font-medium font-mono text-sm">
                  {request.requester_address.slice(0, 8)}...{request.requester_address.slice(-6)}
                </p>
              </div>
            </div>
            {request.duration_days && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#888]" />
                <div>
                  <p className="text-[#888] text-xs">Duration</p>
                  <p className="font-medium">{request.duration_days} days</p>
                </div>
              </div>
            )}
          </div>

          {/* Your Vote Power */}
          <div className="bg-[#111116] border border-[#222] rounded-2xl p-4">
            <p className="text-[#888] text-sm mb-1">Your Voting Power</p>
            <p className="text-2xl font-bold">
              {votePower.toLocaleString()}
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
            disabled={loading || selectedVote === null}
            className={`w-full font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedVote === true 
                ? 'bg-[#22c55e] text-black hover:bg-[#16a34a]'
                : selectedVote === false
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-[#333] text-[#888]'
            }`}
          >
            {loading ? 'Submitting...' : selectedVote === null ? 'Select Your Vote' : 'Confirm Vote'}
          </button>

          {/* Warning */}
          <p className="text-[#666] text-xs text-center">
            ⚠️ Your vote cannot be changed after submission
          </p>
        </div>
      </div>
    </div>
  );
}

function getTimeLeft(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return 'Voting ended';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h left`;
  }
  return `${hours}h ${minutes}m left`;
}
