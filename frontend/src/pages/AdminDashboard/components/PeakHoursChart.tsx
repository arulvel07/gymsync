import React from 'react';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { BarChart } from '@/components/charts/BarChart';
import type { PeakHour } from '@/types';
import type { TimeRangeDays } from './AnalyticsHeader';

interface PeakHoursChartProps {
  data: PeakHour[];
  days: TimeRangeDays;
  loading: boolean;
}

export const PeakHoursChart: React.FC<PeakHoursChartProps> = ({
  data,
  days,
  loading,
}) => {
  const hasData = data && data.length > 0 && data.some((h) => h.avg_visitors > 0);

  return (
    <ChartContainer
      title="Hourly Visitor Density"
      description={`Average visitor volume per hour (${days}-day average)`}
      loading={loading}
      empty={!hasData}
      emptyMessage={`No peak-hour traffic data recorded for the selected ${days}-day window.`}
      height="h-[280px]"
      className="h-full"
    >
      <BarChart data={data} />
    </ChartContainer>
  );
};
