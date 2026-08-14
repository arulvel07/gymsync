import React from 'react';
import { Card } from '@/components/ui/Card';
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton height="12px" width="80px" className="mb-2" />
            <Skeleton height="28px" width="100px" className="mb-1" />
            <Skeleton height="10px" width="110px" />
          </Card>
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
      accent: 'border-l-2 border-l-blue-500',
    },
    {
      id: 'duration',
      label: 'Average Session',
      value: summary?.avg_duration_minutes ? formatDuration(summary.avg_duration_minutes) : '—',
      subtext: 'Time spent per visit',
      icon: <Clock className="w-4 h-4 text-emerald-400" />,
      accent: 'border-l-2 border-l-emerald-500',
    },
    {
      id: 'peak',
      label: 'Busiest Period',
      value: peakFormatted,
      subtext: 'Peak hourly density',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      accent: 'border-l-2 border-l-amber-500',
    },
    {
      id: 'unique',
      label: "Today's Unique Students",
      value: summary?.unique_users_today ?? 0,
      subtext: 'Active attendees today',
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      accent: 'border-l-2 border-l-cyan-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metrics.map((m) => (
        <Card key={m.id} className={`p-4 transition-all duration-200 hover:border-white/20 ${m.accent}`}>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[0.7rem] uppercase tracking-wider text-[#a1a1aa] font-semibold truncate">
              {m.label}
            </span>
            <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/5 flex-shrink-0">
              {m.icon}
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {m.value}
          </div>
          <div className="text-[0.7rem] text-[#71717a] mt-1 font-mono">
            {m.subtext}
          </div>
        </Card>
      ))}
    </div>
  );
};
