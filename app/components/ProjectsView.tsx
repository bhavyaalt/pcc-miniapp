'use client';

import { useState, useEffect } from 'react';
import { Target, Users, Clock, ExternalLink, ChevronRight, Plus, TrendingUp } from 'lucide-react';
import { Project, ProjectContribution, getProjects, getProjectContributions } from '../lib/supabase';

interface ProjectsViewProps {
  onSelectProject: (project: Project) => void;
  onCreateProject: () => void;
}

export function ProjectsView({ onSelectProject, onCreateProject }: ProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<'all' | 'funding' | 'funded'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      const data = await getProjects();
      setProjects(data);
      setLoading(false);
    }
    loadProjects();
  }, []);

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'funding') return p.status === 'FUNDING';
    if (filter === 'funded') return p.status === 'FUNDED' || p.status === 'COMPLETED';
    return true;
  });

  const formatMoney = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return `$${n}`;
  };

  const getProgress = (raised: number, target: number) => Math.min((raised / target) * 100, 100);

  const getDaysLeft = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

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
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Projects</h2>
          <p className="text-[#888] text-sm">Discover projects seeking funding</p>
        </div>
        <button
          onClick={onCreateProject}
          className="flex items-center gap-2 bg-[#22c55e] text-black font-medium px-4 py-2 rounded-lg text-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'funding', 'funded'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === f
                ? 'bg-white text-black'
                : 'bg-[#111116] text-[#888] hover:text-white border border-[#222]'
            }`}
          >
            {f === 'all' ? 'All' : f === 'funding' ? '🔥 Funding' : '✅ Funded'}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#111116] border border-[#222] rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-[#22c55e]">{projects.length}</p>
          <p className="text-[10px] text-[#888] uppercase">Projects</p>
        </div>
        <div className="bg-[#111116] border border-[#222] rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-[#22c55e]">
            {formatMoney(projects.reduce((s, p) => s + p.raised_amount, 0))}
          </p>
          <p className="text-[10px] text-[#888] uppercase">Raised</p>
        </div>
        <div className="bg-[#111116] border border-[#222] rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-[#22c55e]">
            {projects.filter(p => p.status === 'FUNDING').length}
          </p>
          <p className="text-[10px] text-[#888] uppercase">Active</p>
        </div>
      </div>

      {/* Project List */}
      {loading ? (
        <div className="text-center py-12 text-[#888]">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#888] mb-4">No projects found</p>
          <button
            onClick={onCreateProject}
            className="bg-[#22c55e] text-black font-semibold px-6 py-3 rounded-xl"
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onSelectProject(project)}
              formatMoney={formatMoney}
              getProgress={getProgress}
              getDaysLeft={getDaysLeft}
              getCategoryColor={getCategoryColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  formatMoney: (n: number) => string;
  getProgress: (raised: number, target: number) => number;
  getDaysLeft: (deadline: string) => number;
  getCategoryColor: (category: Project['category']) => string;
}

function ProjectCard({ project, onClick, formatMoney, getProgress, getDaysLeft, getCategoryColor }: ProjectCardProps) {
  const progress = getProgress(project.raised_amount, project.target_amount);
  const daysLeft = getDaysLeft(project.deadline);
  const isFunded = project.status === 'FUNDED' || project.status === 'COMPLETED';

  return (
    <button
      onClick={onClick}
      className="w-full bg-[#111116] border border-[#222] rounded-2xl p-5 text-left hover:border-[#444] transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryColor(project.category)}`}>
              {project.category}
            </span>
            {isFunded && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
                ✓ FUNDED
              </span>
            )}
          </div>
          <h3 className="font-semibold text-lg">{project.name}</h3>
          <p className="text-[#888] text-xs mt-1">by {project.creator_name || 'Anonymous'}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-[#888]" />
      </div>

      <p className="text-[#888] text-sm mb-4 line-clamp-2">{project.description}</p>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-2 bg-[#222] rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${isFunded ? 'bg-[#22c55e]' : 'bg-gradient-to-r from-[#22c55e] to-emerald-400'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-bold text-[#22c55e]">{formatMoney(project.raised_amount)}</span>
          <span className="text-[#888]"> / {formatMoney(project.target_amount)}</span>
        </div>
        <div className="flex items-center gap-3 text-[#888]">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {progress.toFixed(0)}%
          </span>
          {!isFunded && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {daysLeft}d left
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
