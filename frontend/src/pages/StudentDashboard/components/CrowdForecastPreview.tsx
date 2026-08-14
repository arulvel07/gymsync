import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { DensityMeter } from '@/components/ui/DensityMeter';
import { plannerApi } from '@/services/api/planner';
import { getOccupancyLevel, formatHour, formatDateContext } from '@/lib/utils';
import type { CrowdForecastResponse } from '@/types';
import { CalendarClock, Clock, Lightbulb, AlertTriangle } from 'lucide-react';

const TIME_SLOTS = [
  { value: 6, label: '6:00 AM' },
  { value: 7, label: '7:00 AM' },
  { value: 8, label: '8:00 AM' },
  { value: 9, label: '9:00 AM' },
  { value: 10, label: '10:00 AM' },
  { value: 16, label: '4:00 PM' },
  { value: 17, label: '5:00 PM' },
  { value: 18, label: '6:00 PM' },
  { value: 19, label: '7:00 PM' },
  { value: 20, label: '8:00 PM' },
  { value: 21, label: '9:00 PM' },
];

export const CrowdForecastPreview: React.FC = () => {
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [forecastDate, setForecastDate] = useState(tomorrowStr);
  const [forecastTime, setForecastTime] = useState(17);
  const [forecast, setForecast] = useState<CrowdForecastResponse | null>(null);
  const [lighterSlotInfo, setLighterSlotInfo] = useState<{ hour: number; count: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await plannerApi.getCrowdForecast(forecastDate, forecastTime);
      setForecast(res);

      // Fetch 1-2 comparison slots for lighter traffic check (e.g. 15 / 3 PM or 7 AM)
      const altHours = [7, 15, 18].filter((h) => h !== forecastTime);
      const comparisonResults = await Promise.allSettled(
        altHours.map((h) => plannerApi.getCrowdForecast(forecastDate, h))
      );

      let bestAlt: { hour: number; count: number } | null = null;
      comparisonResults.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value) {
          const altCount = result.value.predicted_count;
          if (altCount < res.predicted_count) {
            if (!bestAlt || altCount < bestAlt.count) {
              bestAlt = { hour: altHours[idx], count: altCount };
            }
          }
        }
      });
      setLighterSlotInfo(bestAlt);
    } catch (err: any) {
      console.error('[CrowdForecastPreview] Forecast error:', err);
      setError(err.message || "Couldn't load forecast data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await plannerApi.getCrowdForecast(forecastDate, forecastTime);
        if (!cancelled) {
          setForecast(res);
          // Query comparison slots asynchronously for suggestion
          const altHours = [7, 15, 18].filter((h) => h !== forecastTime);
          const altRes = await Promise.allSettled(
            altHours.map((h) => plannerApi.getCrowdForecast(forecastDate, h))
          );
          if (!cancelled) {
            let bestAlt: { hour: number; count: number } | null = null;
            altRes.forEach((result, idx) => {
              if (result.status === 'fulfilled' && result.value) {
                const altCount = result.value.predicted_count;
                if (altCount < res.predicted_count) {
                  if (!bestAlt || altCount < bestAlt.count) {
                    bestAlt = { hour: altHours[idx], count: altCount };
                  }
                }
              }
            });
            setLighterSlotInfo(bestAlt);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error('[CrowdForecastPreview] Forecast error:', err);
          setError(err.message || 'Forecast unavailable');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [forecastDate, forecastTime]);

  const count = forecast?.predicted_count ?? 0;
  const maxCap = forecast?.max_capacity || 50;
  const percent = forecast?.predicted_percentage ?? 0;
  const level = getOccupancyLevel(percent);
  const dateContextText = formatDateContext(forecastDate, forecastTime);

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

      <CardContent className="pt-4 space-y-3 flex-1 flex flex-col justify-between">
        {/* Controls */}
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Date"
            type="date"
            className="text-xs py-1.5"
            value={forecastDate}
            onChange={(e) => setForecastDate(e.target.value)}
          />
          <Select
            label="Slot"
            className="text-xs py-1.5"
            value={forecastTime}
            onChange={(e) => setForecastTime(parseInt(e.target.value, 10))}
          >
            {TIME_SLOTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Content Body */}
        {loading && !forecast ? (
          <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] space-y-3">
            <Skeleton height="16px" width="50%" />
            <Skeleton height="32px" width="70%" />
          </div>
        ) : error && !forecast ? (
          <ErrorState
            title="Unable to load crowd forecast"
            message={error}
            onRetry={fetchForecast}
          />
        ) : !forecast ? (
          <EmptyState
            icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
            title="Crowd forecast unavailable"
            description="We don't have enough data for this time yet."
          />
        ) : (
          <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] space-y-3">
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

            <DensityMeter
              percentage={percent}
              count={count}
              maxCapacity={maxCap}
              size="md"
            />

            <div className="pt-1 flex items-baseline justify-between text-sm font-bold text-white font-mono">
              <span>{count} people expected</span>
              <span className="text-xs text-zinc-500 font-normal">
                ({percent}%)
              </span>
            </div>
          </div>
        )}

        {/* Actionable Lighter Time Suggestion */}
        {lighterSlotInfo && (
          <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-200">
                Try {formatHour(lighterSlotInfo.hour)} for lighter traffic
              </span>
              <span className="text-[11px] text-blue-300/80 block mt-0.5">
                {lighterSlotInfo.count} expected vs {count} expected at {formatHour(forecastTime)}.
              </span>
            </div>
          </div>
        )}

        {/* Grounded Attribution */}
        <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 pt-1 border-t border-zinc-800/50">
          <Clock className="w-3 h-3 text-zinc-600 shrink-0" />
          <span>Calculated from historical 30-day attendance and planned workouts.</span>
        </div>
      </CardContent>
    </Card>
  );
};
