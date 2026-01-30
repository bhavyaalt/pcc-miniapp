'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { createProject, Project } from '../lib/supabase';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  creatorAddress: string;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess, creatorAddress }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [category, setCategory] = useState<Project['category']>('STARTUP');
  const [creatorName, setCreatorName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + parseInt(deadlineDays));

      const project = await createProject({
        name,
        description,
        creator_address: creatorAddress,
        creator_name: creatorName || undefined,
        target_amount: parseFloat(targetAmount),
        raised_amount: 0,
        currency: 'USDC',
        category,
        status: 'FUNDING',
        deadline: deadline.toISOString(),
        website_url: websiteUrl || undefined,
        twitter_url: twitterUrl || undefined,
      });

      if (project) {
        onSuccess();
        onClose();
      } else {
        setError('Failed to create project. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories: { value: Project['category']; label: string; emoji: string }[] = [
    { value: 'STARTUP', label: 'Startup', emoji: '🚀' },
    { value: 'CREATOR', label: 'Creator', emoji: '🎨' },
    { value: 'COMMUNITY', label: 'Community', emoji: '🌍' },
    { value: 'DEFI', label: 'DeFi', emoji: '💎' },
    { value: 'NFT', label: 'NFT', emoji: '🖼️' },
    { value: 'OTHER', label: 'Other', emoji: '📦' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a0a0f] w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a0a0f] px-5 py-4 border-b border-[#222] flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Project</h2>
          <button onClick={onClose} className="p-2 hover:bg-[#222] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Onchain Analytics Platform"
              className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:border-[#22c55e] focus:outline-none"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you building? Why should pools fund it?"
              rows={3}
              className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:border-[#22c55e] focus:outline-none resize-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Category *</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    category === cat.value
                      ? 'bg-[#22c55e] text-black'
                      : 'bg-[#111116] border border-[#222] hover:border-[#444]'
                  }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <p className="text-xs mt-1">{cat.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Funding Goal */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Funding Goal (USDC) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888]">$</span>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="250,000"
                className="w-full bg-[#111116] border border-[#222] rounded-xl pl-8 pr-4 py-3 text-white placeholder-[#666] focus:border-[#22c55e] focus:outline-none"
                min="1000"
                required
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Funding Deadline</label>
            <div className="flex gap-3">
              {['14', '30', '60', '90'].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setDeadlineDays(days)}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                    deadlineDays === days
                      ? 'bg-[#22c55e] text-black font-medium'
                      : 'bg-[#111116] border border-[#222] hover:border-[#444]'
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
          </div>

          {/* Creator Info */}
          <div>
            <label className="block text-sm text-[#888] mb-2">Your Name / Team Name</label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="e.g., DeFi Labs"
              className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:border-[#22c55e] focus:outline-none"
            />
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-[#888] mb-2">Website</label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://"
                className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:border-[#22c55e] focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-[#888] mb-2">Twitter</label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="https://twitter.com/"
                className="w-full bg-[#111116] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:border-[#22c55e] focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !name || !description || !targetAmount}
            className="w-full bg-[#22c55e] text-black font-semibold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
}
