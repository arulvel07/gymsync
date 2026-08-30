import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { DensityMeter } from '@/components/ui/DensityMeter';
import { getOccupancyLevel, formatHour } from '@/lib/utils';
import { Clock } from 'lucide-react';

export interface TimeForecastItem {
  hour: number;
  count: number;
  percentage: number;
  maxCapacity: number;
}

interface ForecastComparisonProps {
  items: TimeForecastItem[];
  selectedHour: number;
  onSelectHour: (hour: number) => void;
  loading?: boolean;
}

export const ForecastComparison: React.FC<ForecastComparisonProps> = ({
  items,
  selectedHour,
  onSelectHour,
  loading = false,
}) => {
  if (!items.length && !loading) return null;

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-white/10">
        <CardTitle className="text-sm font-semibold text-[#fafafa] tracking-tight flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            Time Slot Crowd Comparison
          </span>
          <span className="text-[11px] text-[#71717a] font-normal">
            Select a slot to view detailed forecast
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5" role="group" aria-label="Time slot crowd comparison options">
          {items.map((item) => {
            const level = getOccupancyLevel(item.percentage);
            const isSelected = item.hour === selectedHour;
            const ariaLabel = `Time slot ${formatHour(item.hour)}: ${item.count} expected visitors, ${level.label}`;

            return (
              <button
                key={item.hour}
                type="button"
                aria-label={ariaLabel}
                aria-pressed={isSelected}
                onClick={() => onSelectHour(item.hour)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                    : 'bg-[#18181c] border-white/10 text-zinc-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold font-mono ${isSelected ? 'text-blue-400' : 'text-zinc-200'}`}>
                    {formatHour(item.hour)}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: level.color }}>
                    {level.class.toUpperCase()}
                  </span>
                </div>

                {/* Density Meter */}
                <DensityMeter
                  percentage={item.percentage}
                  count={item.count}
                  maxCapacity={item.maxCapacity}
                  size="sm"
                />

                <div className="text-xs font-bold font-mono text-white flex items-baseline gap-1">
                  <span>{item.count} expected</span>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
