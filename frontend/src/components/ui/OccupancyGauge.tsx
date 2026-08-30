import React from 'react';
import { getOccupancyLevel } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

export interface OccupancyGaugeProps {
  currentCount: number;
  maxCapacity: number;
  percentage: number;
  isOpen: boolean;
  size?: 'sm' | 'md' | 'lg';
  showStatusBadge?: boolean;
}

export const OccupancyGauge: React.FC<OccupancyGaugeProps> = ({
  currentCount,
  maxCapacity,
  percentage,
  isOpen,
  size = 'md',
  showStatusBadge = true,
}) => {
  const level = getOccupancyLevel(percentage);
  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  const animatedCount = useAnimatedNumber(currentCount, 350);
  const animatedPercentage = useAnimatedNumber(safePercentage, 350);

  const radiusMap = {
    sm: 55,
    md: 88,
    lg: 110,
  };

  const containerSizeMap = {
    sm: 'w-32 h-32',
    md: 'w-44 h-44',
    lg: 'w-56 h-56',
  };

  const numberSizeMap = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  };

  const r = radiusMap[size];
  const strokeWidth = size === 'sm' ? 8 : 10;
  const viewBoxSize = (r + strokeWidth) * 2;
  const center = viewBoxSize / 2;

  const circumference = 2 * Math.PI * r;
  const offset = circumference - (safePercentage / 100) * circumference;

  const gaugeColor = !isOpen ? '#ef4444' : level.color;
  const statusType = !isOpen
    ? 'closed'
    : safePercentage >= 90
    ? 'full'
    : safePercentage >= 60
    ? 'moderate'
    : 'open';

  const accessibleDescription = `Gym occupancy: ${currentCount} of ${maxCapacity} people present, ${safePercentage}% capacity. Status: ${
    !isOpen ? 'Gym Closed' : level.label
  }.`;

  return (
    <div className="flex flex-col items-center">
      <span className="sr-only">{accessibleDescription}</span>
      <div className={`relative ${containerSizeMap[size]} mx-auto mb-2`}>
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="w-full h-full -rotate-90"
          aria-hidden="true"
        >
          <circle
            className="fill-none stroke-white/5"
            cx={center}
            cy={center}
            r={r}
            strokeWidth={strokeWidth}
          />
          <circle
            className="fill-none transition-all duration-700 ease-out"
            cx={center}
            cy={center}
            r={r}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ stroke: gaugeColor }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
          <div className="flex items-baseline gap-1">
            <span
              className={`font-mono font-bold tabular-nums tracking-tight transition-colors duration-250 ${numberSizeMap[size]}`}
              style={{ color: gaugeColor }}
            >
              {animatedCount}
            </span>
            <span className="text-xs text-[#71717a]">/ {maxCapacity}</span>
          </div>
          <span className="font-mono text-xs font-medium text-[#a1a1aa] mt-0.5">
            {animatedPercentage}%
          </span>
        </div>
      </div>
      {showStatusBadge && (
        <StatusBadge status={statusType} className="mt-1" />
      )}
    </div>
  );
};
