import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { DailyStat } from '@/types';
import { formatDate } from '@/lib/utils';
import { commonCartesianScales, commonTooltipOptions, chartDarkTheme } from './chartConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const LineChart: React.FC<{ data: DailyStat[] }> = ({ data }) => {
  const chartData = {
    labels: data.map((d) => formatDate(d.date)),
    datasets: [
      {
        label: 'Daily Visitors',
        data: data.map((d) => d.count),
        borderColor: chartDarkTheme.accentColor,
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: chartDarkTheme.accentColor,
        pointHoverBackgroundColor: chartDarkTheme.accentColor,
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: commonTooltipOptions,
    },
    scales: commonCartesianScales,
  };

  return (
    <div className="h-full w-full">
      <Line data={chartData} options={options} />
    </div>
  );
};
