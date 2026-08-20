import React from 'react';
import { ChartContainer } from '@/components/charts/ChartContainer';
import { DoughnutChart } from '@/components/charts/DoughnutChart';
import type { WorkoutDistributionItem } from '@/types';
import type { TimeRangeDays } from './AnalyticsHeader';
import { getWorkoutColor } from '@/lib/constants';

interface WorkoutDistributionProps {
  data: WorkoutDistributionItem[];
  days: TimeRangeDays;
  loading: boolean;
}

export const WorkoutDistribution: React.FC<WorkoutDistributionProps> = ({
  data,
  days,
  loading,
}) => {
  const hasData = data && data.length > 0 && data.some((d) => d.count > 0);

  return (
    <ChartContainer
      title="Workout Focus Breakdown"
      description={`Share of workout categories (${days} days)`}
      loading={loading}
      empty={!hasData}
      emptyMessage={`No workout distribution logged in the last ${days} days.`}
      height="h-[220px]"
      className="mb-4"
    >
      <DoughnutChart data={data} />
    </ChartContainer>
  );
};
