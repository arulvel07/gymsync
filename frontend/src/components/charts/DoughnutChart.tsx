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
import { chartDarkTheme, commonAnimationOptions } from './chartConfig';

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
    animation: commonAnimationOptions,
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

  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0) || 1;

  return (
    <div className="h-full w-full relative">
      <div className="sr-only">
        <table>
          <caption>Workout Distribution Breakdown</caption>
          <thead>
            <tr>
              <th scope="col">Workout Type</th>
              <th scope="col">Session Count</th>
              <th scope="col">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.workout_type}>
                <td>{d.workout_type}</td>
                <td>{d.count}</td>
                <td>{d.percentage ?? Math.round((d.count / totalCount) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="h-full w-full" aria-hidden="true">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};
