import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { PeakHour } from '@/types';
import { formatHour, getOccupancyLevel } from '@/lib/utils';
import { commonCartesianScales, commonTooltipOptions, commonAnimationOptions } from './chartConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const BarChart: React.FC<{ data: PeakHour[] }> = ({ data }) => {
  const gymHours = data.filter((h) => h.hour >= 6 && h.hour <= 22);
  const maxVal = Math.max(...gymHours.map((x) => x.avg_visitors)) || 1;

  const chartData = {
    labels: gymHours.map((h) => formatHour(h.hour)),
    datasets: [
      {
        label: 'Avg Visitors',
        data: gymHours.map((h) => h.avg_visitors),
        backgroundColor: gymHours.map((h) => {
          const level = getOccupancyLevel((h.avg_visitors / maxVal) * 100);
          return level.color + 'A0';
        }),
        borderColor: gymHours.map((h) => {
          const level = getOccupancyLevel((h.avg_visitors / maxVal) * 100);
          return level.color;
        }),
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: commonAnimationOptions,
    plugins: {
      legend: { display: false },
      tooltip: commonTooltipOptions,
    },
    scales: commonCartesianScales,
  };

  return (
    <div className="h-full w-full relative">
      <div className="sr-only">
        <table>
          <caption>Hourly Gym Visitor Density</caption>
          <thead>
            <tr>
              <th scope="col">Hour</th>
              <th scope="col">Average Visitors</th>
            </tr>
          </thead>
          <tbody>
            {gymHours.map((h) => (
              <tr key={h.hour}>
                <td>{formatHour(h.hour)}</td>
                <td>{h.avg_visitors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="h-full w-full" aria-hidden="true">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
