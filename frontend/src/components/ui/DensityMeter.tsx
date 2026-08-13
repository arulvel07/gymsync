import React from 'react';
import { getOccupancyLevel, getDensityBlocks } from '@/lib/utils';

interface DensityMeterProps {
  percentage: number;
  count: number;
  maxCapacity: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DensityMeter: React.FC<DensityMeterProps> = ({
  percentage,
  count,
  maxCapacity,
  size = 'md',
  className = '',
}) => {
  const level = getOccupancyLevel(percentage);
  const { filled, total } = getDensityBlocks(percentage);

  const sizeClasses = {
    sm: {
      block: 'h-3.5 w-2 rounded-[1px]',
      gap: 'gap-0.5',
    },
    md: {
      block: 'h-5 w-3 rounded-[2px]',
      gap: 'gap-1',
    },
    lg: {
      block: 'h-6 w-3.5 rounded-[2px]',
      gap: 'gap-1.5',
    },
  }[size];

  const ariaDescription = `Expected crowd density: ${level.label}, ${count} of ${maxCapacity} people expected (${percentage}% capacity).`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div
        className={`flex items-center ${sizeClasses.gap} select-none`}
        role="img"
        aria-label={ariaDescription}
      >
        {Array.from({ length: total }).map((_, i) => {
          const isFilled = i < filled;
          return (
            <span
              key={i}
              className={`transition-colors duration-300 ${sizeClasses.block} ${
                isFilled ? '' : 'bg-white/5 border border-white/10'
              }`}
              style={{
                backgroundColor: isFilled ? level.color : undefined,
                borderColor: isFilled ? level.color : undefined,
              }}
            />
          );
        })}
      </div>
      <span className="sr-only">{ariaDescription}</span>
    </div>
  );
};
