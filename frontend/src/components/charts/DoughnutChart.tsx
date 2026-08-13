import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { WorkoutDistributionItem } from '@/types';
import { getWorkoutColor } from '@/lib/constants';
import { chartDarkTheme } from './chartConfig';

ChartJS.register(ArcElement, Tooltip, Legend);

export const DoughnutChart: React.FC<{ data: WorkoutDistributionItem[] }> = ({ data }) => {
  const chartData = {
    labels: data.map((d) => d.workout_type),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map((d) => getWorkoutColor(d.workout_type) + 'CC'),
        borderColor: '#121215',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: chartDarkTheme.textColor,
          font: { family: 'Inter', size: 12 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: chartDarkTheme.tooltipBg,
        titleColor: '#fafafa',
        bodyColor: chartDarkTheme.textColor,
        borderColor: chartDarkTheme.tooltipBorder,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 6,
      },
    },
  };

  return (
    <div className="h-full w-full">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};
