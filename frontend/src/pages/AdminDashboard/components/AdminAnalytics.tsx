import React, { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '@/services/api/analytics';
import type {
  DailyStat,
  PeakHour,
  WorkoutDistributionItem,
  AnalyticsSummary as AnalyticsSummaryType,
} from '@/types';
import { AnalyticsHeader, type TimeRangeDays } from './AnalyticsHeader';
import { AnalyticsSummary } from './AnalyticsSummary';
import { VisitorActivityChart } from './VisitorActivityChart';
import { PeakHoursChart } from './PeakHoursChart';
import { WorkoutDistribution } from './WorkoutDistribution';
import { InsightCallout } from './InsightCallout';
import { ErrorState } from '@/components/ui/ErrorState';

export const AdminAnalytics: React.FC = () => {
  const [days, setDays] = useState<TimeRangeDays>(30);
  const [summary, setSummary] = useState<AnalyticsSummaryType | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [distribution, setDistribution] = useState<WorkoutDistributionItem[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const [sumRes, dailyRes, peakRes, distRes] = await Promise.allSettled([
          analyticsApi.getSummary(),
          analyticsApi.getDailyStats(days),
          analyticsApi.getPeakHours(days),
          analyticsApi.getWorkoutDistribution(days),
        ]);

        let fetchFailed = false;

        if (sumRes.status === 'fulfilled') {
          setSummary(sumRes.value);
        } else {
          console.error('[Analytics] Failed to fetch summary:', sumRes.reason);
        }

        if (dailyRes.status === 'fulfilled') {
          setDailyStats(dailyRes.value);
        } else {
          console.error('[Analytics] Failed to fetch daily stats:', dailyRes.reason);
        }

        if (peakRes.status === 'fulfilled') {
          setPeakHours(peakRes.value);
        } else {
          console.error('[Analytics] Failed to fetch peak hours:', peakRes.reason);
        }

        if (distRes.status === 'fulfilled') {
          setDistribution(distRes.value);
        } else {
          console.error('[Analytics] Failed to fetch distribution:', distRes.reason);
        }

        // If all 4 failed, trigger error state
        if (
          sumRes.status === 'rejected' &&
          dailyRes.status === 'rejected' &&
          peakRes.status === 'rejected' &&
          distRes.status === 'rejected'
        ) {
          fetchFailed = true;
          setError('Unable to load gym analytics data. Please check connection and try again.');
        }

        if (!fetchFailed) {
          setLastUpdated(new Date());
        }
      } catch (err: any) {
        console.error('[Analytics] Unexpected error:', err);
        setError('An unexpected error occurred while loading gym insights.');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [days]
  );

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const handleRangeChange = (newDays: TimeRangeDays) => {
    if (newDays !== days) {
      setDays(newDays);
    }
  };

  const handleRefresh = () => {
    loadData(true);
  };

  // Calculate sum of visits for the selected period from dailyStats
  const periodVisits = dailyStats.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <div className="w-full animate-fade-in-up pb-8">
      {/* Header */}
      <AnalyticsHeader
        days={days}
        onRangeChange={handleRangeChange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
      />

      {/* Global Error Banner if entire dataset failed */}
      {error && !loading && (
        <div className="mb-6">
          <ErrorState
            title="WE COULDN'T LOAD GYM INSIGHTS"
            message={error}
            onRetry={() => loadData(false)}
          />
        </div>
      )}

      {/* Summary Metrics Row */}
      <AnalyticsSummary
        summary={summary}
        days={days}
        periodVisits={periodVisits}
        loading={loading}
      />

      {/* Primary Line Chart: Visitor Activity */}
      <VisitorActivityChart
        data={dailyStats}
        days={days}
        loading={loading}
      />

      {/* Secondary & Supporting Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Peak Hours Bar Chart (2 columns on desktop) */}
        <div className="lg:col-span-2">
          <PeakHoursChart
            data={peakHours}
            days={days}
            loading={loading}
          />
        </div>

        {/* Workout Focus & Operational Highlights (1 column on desktop) */}
        <div className="lg:col-span-1 space-y-6">
          <WorkoutDistribution
            data={distribution}
            days={days}
            loading={loading}
          />
          <InsightCallout
            summary={summary}
            dailyStats={dailyStats}
            distribution={distribution}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};
