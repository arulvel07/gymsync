import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatHour, formatDate, formatDuration } from '@/lib/utils';
import type { DailyStat, WorkoutDistributionItem, AnalyticsSummary } from '@/types';
import { Flame, Calendar, Dumbbell, Clock } from 'lucide-react';

interface InsightCalloutProps {
  summary: AnalyticsSummary | null;
  dailyStats: DailyStat[];
  distribution: WorkoutDistributionItem[];
  loading: boolean;
}

export const InsightCallout: React.FC<InsightCalloutProps> = ({
  summary,
  dailyStats,
  distribution,
  loading,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton height="14px" width="140px" className="mb-1" />
          <Skeleton height="10px" width="180px" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton height="32px" width="32px" className="rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton height="10px" width="80px" />
                <Skeleton height="12px" width="120px" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Derive Busiest Day from dailyStats
  const sortedDaily = [...dailyStats].sort((a, b) => b.count - a.count);
  const maxDay = sortedDaily[0] && sortedDaily[0].count > 0 ? sortedDaily[0] : null;

  // Derive Top Workout from distribution
  const topWorkout = distribution && distribution[0] && distribution[0].count > 0 ? distribution[0] : null;

  // Derive Peak Period from summary
  const peakHourStr = summary
    ? `${formatHour(summary.peak_hour)} – ${formatHour((summary.peak_hour + 1) % 24)}`
    : '—';

  const highlights = [
    {
      id: 'peak',
      label: 'Peak Period',
      value: peakHourStr,
      subtext: 'Busiest overall hour window',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'busiest-day',
      label: 'Busiest Day Recorded',
      value: maxDay ? `${formatDate(maxDay.date)}` : '—',
      subtext: maxDay ? `${maxDay.count} total check-ins` : 'No data recorded',
      icon: <Calendar className="w-4 h-4 text-blue-400" />,
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      id: 'top-workout',
      label: 'Primary Workout Focus',
      value: topWorkout ? topWorkout.workout_type : '—',
      subtext: topWorkout
        ? `${topWorkout.count} sessions (${topWorkout.percentage ?? Math.round((topWorkout.count / (distribution.reduce((a, b) => a + b.count, 0) || 1)) * 100)}%)`
        : 'No workout data',
      icon: <Dumbbell className="w-4 h-4 text-emerald-400" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'avg-duration',
      label: 'Average Session Duration',
      value: summary?.avg_duration_minutes ? formatDuration(summary.avg_duration_minutes) : '—',
      subtext: 'Calculated over 30 days',
      icon: <Clock className="w-4 h-4 text-cyan-400" />,
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xs uppercase tracking-wider text-[#a1a1aa] font-semibold">
          Operational Highlights
        </CardTitle>
        <p className="text-[0.72rem] text-[#71717a]">
          Evidence-based observations derived from attendance records
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {highlights.map((h) => (
          <div
            key={h.id}
            className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className={`p-2 rounded-lg border ${h.bg} flex-shrink-0 mt-0.5`}>
              {h.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[0.7rem] uppercase tracking-wider text-[#71717a] font-semibold">
                {h.label}
              </div>
              <div className="text-sm font-bold text-white tracking-tight truncate mt-0.5">
                {h.value}
              </div>
              <div className="text-[0.7rem] text-[#a1a1aa] font-mono mt-0.5">
                {h.subtext}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
