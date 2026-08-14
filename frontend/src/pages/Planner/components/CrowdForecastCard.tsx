import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { DensityMeter } from '@/components/ui/DensityMeter';
import { getOccupancyLevel, formatHour, formatDateContext } from '@/lib/utils';
import type { CrowdForecastResponse } from '@/types';
import { CalendarClock, Users, Clock, Lightbulb, AlertTriangle } from 'lucide-react';

interface CrowdForecastCardProps {
  selectedDate: string;
  selectedHour: number;
  forecast: CrowdForecastResponse | null;
  comparisonForecasts?: { hour: number; count: number; percentage: number }[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const CrowdForecastCard: React.FC<CrowdForecastCardProps> = ({
  selectedDate,
  selectedHour,
  forecast,
  comparisonForecasts = [],
  loading = false,
  error = null,
  onRetry,
}) => {
  if (loading && !forecast) {
    return (
      <Card className="h-full flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-[#27272a]">
          <Skeleton height="16px" width="60%" />
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <Skeleton height="24px" width="40%" />
          <Skeleton height="40px" width="100%" />
          <Skeleton height="20px" width="80%" />
        </CardContent>
      </Card>
    );
  }

  if (error && !forecast) {
    return (
      <Card className="h-full flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-[#27272a]">
          <CardTitle className="text-sm font-semibold text-[#fafafa] tracking-tight flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-blue-400" />
            When Should You Train?
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ErrorState
            title="Unable to load crowd forecast"
            message={error}
            onRetry={onRetry}
          />
        </CardContent>
      </Card>
    );
  }

  if (!forecast && !loading) {
    return (
      <Card className="h-full flex flex-col justify-between">
        <CardHeader className="pb-3 border-b border-[#27272a]">
          <CardTitle className="text-sm font-semibold text-[#fafafa] tracking-tight flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-blue-400" />
            When Should You Train?
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <EmptyState
            icon={<AlertTriangle className="w-6 h-6 text-amber-400" />}
            title="Crowd forecast unavailable"
            description="We don't have enough data for this time yet."
          />
        </CardContent>
      </Card>
    );
  }

  const count = forecast?.predicted_count ?? 0;
  const maxCap = forecast?.max_capacity || 50;
  const percent = forecast?.predicted_percentage ?? 0;
  const preplannedCount = forecast?.planned_students_count ?? 0;
  const level = getOccupancyLevel(percent);

  // Derive evidence-based lighter time suggestion from actual comparison forecasts
  const lighterSlot = comparisonForecasts
    .filter((f) => f.hour !== selectedHour && f.count < count)
    .sort((a, b) => a.count - b.count)[0];

  const dateContextText = formatDateContext(selectedDate, selectedHour);

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-[#27272a]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-[#fafafa] tracking-tight flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-blue-400" />
            When Should You Train?
          </CardTitle>
          <span className="text-xs font-semibold text-blue-400 font-mono">
            {dateContextText}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
        {/* Main Forecast Decision Block */}
        <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
              Expected crowd
            </span>
            <Badge
              variant={
                level.class === 'low'
                  ? 'green'
                  : level.class === 'moderate'
                  ? 'amber'
                  : 'red'
              }
            >
              {level.label}
            </Badge>
          </div>

          {/* Density Meter */}
          <DensityMeter
            percentage={percent}
            count={count}
            maxCapacity={maxCap}
            size="lg"
          />

          {/* Headcount Translation */}
          <div className="pt-1 flex items-baseline justify-between">
            <div className="text-xl font-bold text-white font-mono flex items-baseline gap-1.5">
              <span>{count} people expected</span>
              <span className="text-xs font-normal text-zinc-500">
                ({percent}% of {maxCap})
              </span>
            </div>
          </div>

          {/* Pre-planned Students */}
          {preplannedCount > 0 && (
            <div className="pt-2 border-t border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Users className="w-3.5 h-3.5 text-zinc-500" />
                Pre-planned workouts:
              </span>
              <span className="font-semibold text-white font-mono">
                {preplannedCount} students
              </span>
            </div>
          )}
        </div>

        {/* Actionable Lighter Time Suggestion (Fact-Based) */}
        {lighterSlot && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-200">
                Try {formatHour(lighterSlot.hour)} for lighter traffic
              </span>
              <p className="text-[11px] text-blue-300/80 mt-0.5">
                {lighterSlot.count} expected vs {count} expected at {formatHour(selectedHour)}.
              </p>
            </div>
          </div>
        )}

        {/* Factual Grounded Attribution */}
        <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-1 border-t border-zinc-800/50">
          <Clock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <span>Calculated from historical 30-day attendance and planned workouts.</span>
        </div>
      </CardContent>
    </Card>
  );
};
