'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from './ui';
import { Pool } from '@/app/lib/supabase';
import { formatAmount } from '@/app/lib/utils';
import { Users, Coins, FileText, ChevronRight } from 'lucide-react';

interface PoolCardProps {
  pool: Pool;
  onClick?: () => void;
}

export function PoolCard({ pool, onClick }: PoolCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:border-[hsl(142,76%,36%)] transition-all hover:shadow-xl hover:shadow-green-500/10"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{pool.name}</CardTitle>
          <ChevronRight className="w-4 h-4 text-[hsl(240,5%,64.9%)]" />
        </div>
        {pool.description && (
          <CardDescription className="line-clamp-2">{pool.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Stats Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-[hsl(240,5%,64.9%)]">
              <Coins className="w-4 h-4" />
              <span>{formatAmount(pool.total_deposited)} {pool.deposit_token}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[hsl(240,5%,64.9%)]">
              <Users className="w-4 h-4" />
              <span>{pool.member_count} members</span>
            </div>
          </div>

          {/* Active Requests */}
          {pool.active_requests > 0 && (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">{pool.active_requests} active request{pool.active_requests > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Token Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{pool.deposit_token}</Badge>
            <Badge variant="secondary">{pool.quorum_percent}% quorum</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
