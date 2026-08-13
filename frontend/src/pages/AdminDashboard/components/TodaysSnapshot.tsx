import React from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatHour } from '@/lib/utils';
import type { AnalyticsSummary } from '@/types';
import { Calendar, Users, Clock, Flame, TrendingUp } from 'lucide-react';

interface TodaysSnapshotProps {
  summary: AnalyticsSummary | null;
  loading: boolean;
}

export const TodaysSnapshot: React.FC<TodaysSnapshotProps> = ({ summary, loading }) => {
  if (loading && !summary) {
    return (
      <Card className="p-6">
        <Skeleton className="h-4 w-36 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    );
  }

  const visitsToday = summary?.total_visits_today ?? 0;
  const uniqueStudents = summary?.unique_users_today ?? 0;
  const avgDuration = summary?.avg_duration_minutes ?? 0;
  const peakHourStr = summary ? formatHour(summary.peak_hour) : '—';
  const visitsWeek = summary?.total_visits_week ?? 0;
  const visitsMonth = summary?.total_visits_month ?? 0;

  return (
    <Card className="p-6 flex flex-col justify-between">
      <div>
        {/* Section Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-1.5">
            <Calendar size={14} className="text-blue-400" /> Today's Activity
          </div>
          <span className="text-[0.72rem] text-zinc-500 font-mono">
            Live Daily Metrics
          </span>
        </div>

        {/* Primary Metric & Secondary Metrics Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.8fr] gap-6 items-center">
          {/* Primary Anchor: Today's Visits */}
          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <div className="text-xs font-medium text-zinc-400 mb-1">
              Total Visits Today
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
                {visitsToday}
              </span>
              <span className="text-xs text-blue-400 font-medium">sessions</span>
            </div>
            <div className="text-[0.72rem] text-zinc-500 mt-1">
              Check-ins recorded since 00:00 IST
            </div>
          </div>

          {/* Grouped Supporting Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Unique Students */}
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[0.72rem] font-medium text-zinc-400 flex items-center gap-1 mb-1">
                <Users size={12} className="text-zinc-400" /> Students
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {uniqueStudents}
              </div>
              <div className="text-[0.68rem] text-zinc-500">Unique visitors</div>
            </div>

            {/* Avg Duration */}
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[0.72rem] font-medium text-zinc-400 flex items-center gap-1 mb-1">
                <Clock size={12} className="text-zinc-400" /> Avg Session
              </div>
              <div className="text-lg font-bold font-mono text-white">
                {avgDuration}m
              </div>
              <div className="text-[0.68rem] text-zinc-500">Per visitor</div>
            </div>

            {/* Peak Hour */}
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="text-[0.72rem] font-medium text-zinc-400 flex items-center gap-1 mb-1">
                <Flame size={12} className="text-amber-400" /> Peak Slot
              </div>
              <div className="text-lg font-bold font-mono text-amber-300">
                {peakHourStr}
              </div>
              <div className="text-[0.68rem] text-zinc-500">Highest density</div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Context Row */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <TrendingUp size={12} className="text-zinc-500" />
            <strong className="font-mono text-zinc-300">{visitsWeek}</strong> visits this week
          </span>
          <span className="text-zinc-600">•</span>
          <span>
            <strong className="font-mono text-zinc-300">{visitsMonth}</strong> visits this month
          </span>
        </div>
      </div>
    </Card>
  );
};
