import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatHour, formatDuration } from '@/lib/utils';
import type { AnalyticsSummary as AnalyticsSummaryType } from '@/types';
import type { TimeRangeDays } from './AnalyticsHeader';
import { Users, Clock, Flame, Activity } from 'lucide-react';

interface AnalyticsSummaryProps {
  summary: AnalyticsSummaryType | null;
  days: TimeRangeDays;
  periodVisits: number;
  loading: boolean;
}

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({
  summary,
  days,
  periodVisits,
  loading,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <Skeleton height="12px" width="80px" className="mb-2" />
            <Skeleton height="26px" width="100px" className="mb-1" />
            <Skeleton height="10px" width="110px" />
          </div>
        ))}
      </div>
    );
  }

  const peakFormatted = summary
    ? `${formatHour(summary.peak_hour)} – ${formatHour((summary.peak_hour + 1) % 24)}`
    : '—';

  const metrics = [
    {
      id: 'visits',
      label: `Total Visits (${days} Days)`,
      value: periodVisits.toLocaleString('en-IN'),
      subtext: `Selected ${days}-day window`,
      icon: <Users className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'duration',
      label: 'Average Session',
      value: summary?.avg_duration_minutes ? formatDuration(summary.avg_duration_minutes) : '—',
      subtext: 'Time spent per visit',
      icon: <Clock className="w-4 h-4 text-zinc-400" />,
    },
    {
      id: 'peak',
      label: 'Busiest Period',
      value: peakFormatted,
      subtext: 'Peak hourly density',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'unique',
      label: "Today's Unique Students",
      value: summary?.unique_users_today ?? 0,
      subtext: 'Active attendees today',
      icon: <Activity className="w-4 h-4 text-zinc-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {metrics.map((m) => (
        <div
          key={m.id}
          className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[0.7rem] uppercase tracking-wider text-[#a1a1aa] font-semibold truncate">
              {m.label}
            </span>
            <div className="p-1 rounded-md bg-white/[0.04] text-zinc-400 flex-shrink-0">
              {m.icon}
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
            {m.value}
          </div>
          <div className="text-[0.7rem] text-[#71717a] mt-1">
            {m.subtext}
          </div>
        </div>
      ))}
    </div>
  );
};
