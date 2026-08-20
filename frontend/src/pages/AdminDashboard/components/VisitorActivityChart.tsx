import React from 'react';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { LineChart } from '@/components/charts/LineChart';
import type { DailyStat } from '@/types';
import type { TimeRangeDays } from './AnalyticsHeader';
import { formatDate } from '@/lib/utils';
import { TrendingUp, Info } from 'lucide-react';

interface VisitorActivityChartProps {
  data: DailyStat[];
  days: TimeRangeDays;
  loading: boolean;
}

export const VisitorActivityChart: React.FC<VisitorActivityChartProps> = ({
  data,
  days,
  loading,
}) => {
  // Safe derived calculation from real data
  const hasData = data && data.length > 0 && data.some((d) => d.count > 0);
  
  let derivedNote = '';
  if (hasData) {
    const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);
    const avgDaily = (totalCount / data.length).toFixed(1);
    
    // Find peak day
    const maxStat = [...data].sort((a, b) => b.count - a.count)[0];
    if (maxStat && maxStat.count > 0) {
      derivedNote = `Peak day: ${maxStat.count} visits on ${formatDate(maxStat.date)}. Average: ${avgDaily} visits/day over ${days} days.`;
    } else {
      derivedNote = `Average: ${avgDaily} visits/day over the last ${days} days.`;
    }
  }

  return (
    <div className="mb-6">
      <ChartContainer
        title="Visitor Activity"
        description={`Daily headcount trend over the last ${days} days`}
        loading={loading}
        empty={!hasData}
        emptyMessage={`No visitor records available for the selected ${days}-day period.`}
        height="h-[280px] sm:h-[320px]"
        className="w-full"
      >
        <LineChart data={data} />
      </ChartContainer>

      {/* Safe Contextual Trend Note */}
      {!loading && hasData && derivedNote && (
        <div className="mt-2.5 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-lg flex items-center gap-2 text-xs text-[#a1a1aa]">
          <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span>{derivedNote}</span>
        </div>
      )}
    </div>
  );
};
