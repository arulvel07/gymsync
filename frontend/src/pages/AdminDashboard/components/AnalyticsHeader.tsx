import React from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Calendar } from 'lucide-react';

export type TimeRangeDays = 7 | 30 | 90;

interface AnalyticsHeaderProps {
  days: TimeRangeDays;
  onRangeChange: (days: TimeRangeDays) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  days,
  onRangeChange,
  onRefresh,
  isRefreshing,
  lastUpdated,
}) => {
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Gym Insights
        </h1>
        <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1">
          Understand how your gym is being used.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Time Range Selector */}
        <div
          className="inline-flex items-center p-1 bg-white/[0.03] border border-white/10 rounded-lg"
          role="group"
          aria-label="Analytics time range"
        >
          <Calendar className="w-3.5 h-3.5 text-[#71717a] ml-2.5 mr-1.5 hidden sm:inline" />
          {([7, 30, 90] as TimeRangeDays[]).map((range) => {
            const isActive = days === range;
            return (
              <button
                key={range}
                type="button"
                onClick={() => onRangeChange(range)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  isActive
                    ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40 shadow-sm'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
                aria-pressed={isActive}
              >
                {range} Days
              </button>
            );
          })}
        </div>

        {/* Manual Refresh Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-9 px-3 text-xs gap-1.5 border-white/10 hover:bg-white/[0.05]"
          title="Refresh analytics data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : 'text-[#a1a1aa]'}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        {/* Subtle Last Updated Timestamp */}
        {lastUpdated && (
          <span className="text-[0.7rem] text-[#71717a] hidden xl:inline font-mono">
            Updated {formatLastUpdated(lastUpdated)}
          </span>
        )}
      </div>
    </div>
  );
};
