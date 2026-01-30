'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Target, Users, Clock, ExternalLink, Globe, Twitter, TrendingUp, Plus } from 'lucide-react';
import { Project, ProjectContribution, Pool, getProjectContributions, getProjects, getPools } from '../lib/supabase';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onFundWithPool: (project: Project) => void;
}

export function ProjectDetail({ project, onBack, onFundWithPool }: ProjectDetailProps) {
  const [contributions, setContributions] = useState<ProjectContribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await getProjectContributions(project.id);
      setContributions(data);
      setLoading(false);
    }
    loadData();
  }, [project.id]);

  const formatMoney = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return `$${n}`;
  };

  const progress = Math.min((project.raised_amount / project.target_amount) * 100, 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const isFunded = project.status === 'FUNDED' || project.status === 'COMPLETED';

  const fundedContributions = contributions.filter(c => c.status === 'FUNDED');
  const pendingContributions = contributions.filter(c => c.status === 'VOTING' || c.status === 'APPROVED');

  const getCategoryColor = (category: Project['category']) => {
    const colors = {
      STARTUP: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      CREATOR: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      COMMUNITY: 'bg-green-500/10 text-green-400 border-green-500/20',
      DEFI: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      NFT: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      OTHER: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return colors[category] || colors.OTHER;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-24">
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-[#888] mb-4 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Projects</span>
        </button>
        
        <div className="flex items-start gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryColor(project.category)}`}>
            {project.category}
          </span>
          {isFunded && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
              ✓ FUNDED
            </span>
          )}
        </div>
        
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-[#888] text-sm mt-1">by {project.creator_name || 'Anonymous'}</p>
      </header>

      {/* Progress Section */}
      <section className="px-5 py-4">
        <div className="bg-[#111116] border border-[#222] rounded-2xl p-5">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-3 bg-[#222] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${isFunded ? 'bg-[#22c55e]' : 'bg-gradient-to-r from-[#22c55e] to-emerald-400'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#22c55e]">{formatMoney(project.raised_amount)}</p>
              <p className="text-xs text-[#888]">of {formatMoney(project.target_amount)}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{fundedContributions.length}</p>
              <p className="text-xs text-[#888]">Pools Contributing</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{isFunded ? '✓' : daysLeft}</p>
              <p className="text-xs text-[#888]">{isFunded ? 'Funded' : 'Days Left'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fund with Pool Button */}
      {!isFunded && (
        <section className="px-5 py-2">
          <button
            onClick={() => onFundWithPool(project)}
            className="w-full flex items-center justify-center gap-2 bg-[#22c55e] text-black font-semibold py-4 rounded-xl"
          >
            <Plus className="w-5 h-5" />
            Fund with Your Pool
          </button>
        </section>
      )}

      {/* Description */}
      <section className="px-5 py-4">
        <h3 className="text-[#888] text-xs tracking-wider mb-3">ABOUT</h3>
        <p className="text-sm leading-relaxed">{project.description}</p>
        
        {/* Links */}
        {(project.website_url || project.twitter_url) && (
          <div className="flex gap-3 mt-4">
            {project.website_url && (
              <a
                href={project.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#111116] border border-[#222] rounded-lg text-sm hover:border-[#444]"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
            {project.twitter_url && (
              <a
                href={project.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#111116] border border-[#222] rounded-lg text-sm hover:border-[#444]"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </a>
            )}
          </div>
        )}
      </section>

      {/* Contributions */}
      <section className="px-5 py-4">
        <h3 className="text-[#888] text-xs tracking-wider mb-3">
          POOL CONTRIBUTIONS ({contributions.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-8 text-[#888]">Loading...</div>
        ) : contributions.length === 0 ? (
          <div className="bg-[#111116] border border-[#222] rounded-2xl p-6 text-center">
            <p className="text-[#888] mb-2">No contributions yet</p>
            <p className="text-xs text-[#666]">Be the first pool to fund this project!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contributions.map((contrib) => (
              <div
                key={contrib.id}
                className="bg-[#111116] border border-[#222] rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#22c55e]/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#22c55e]" />
                  </div>
                  <div>
                    <p className="font-medium">{contrib.pool_name || `Pool ${contrib.pool_id.slice(0, 6)}`}</p>
                    <p className="text-xs text-[#888]">
                      {contrib.status === 'FUNDED' && '✓ Funded'}
                      {contrib.status === 'VOTING' && '🗳️ Voting in progress'}
                      {contrib.status === 'APPROVED' && '✓ Approved, pending transfer'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#22c55e]">{formatMoney(contrib.amount)}</p>
                  <p className="text-xs text-[#888]">
                    {((contrib.amount / project.target_amount) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Remaining Amount */}
      {!isFunded && project.target_amount > project.raised_amount && (
        <section className="px-5 py-4">
          <div className="bg-gradient-to-r from-[#22c55e]/10 to-emerald-500/10 border border-[#22c55e]/20 rounded-2xl p-4 text-center">
            <p className="text-sm text-[#888] mb-1">Still needed</p>
            <p className="text-2xl font-bold text-[#22c55e]">
              {formatMoney(project.target_amount - project.raised_amount)}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
