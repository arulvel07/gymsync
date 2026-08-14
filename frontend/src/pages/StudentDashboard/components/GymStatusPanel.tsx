import React from 'react';
import { OccupancyGauge } from '@/components/ui/OccupancyGauge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { GymClosedState } from '@/components/ui/GymClosedState';
import { getOccupancyLevel } from '@/lib/utils';
import type { OccupancyResponse } from '@/types';
import { Users, AlertCircle, Clock } from 'lucide-react';

interface GymStatusPanelProps {
  occupancy: OccupancyResponse | null;
  loading: boolean;
}

export const GymStatusPanel: React.FC<GymStatusPanelProps> = ({ occupancy, loading }) => {
  if (loading && !occupancy) {
    return <SkeletonCard />;
  }

  const currentCount = occupancy?.current_count || 0;
  const maxCapacity = occupancy?.max_capacity || 50;
  const percentage = occupancy?.percentage || 0;
  const isOpen = occupancy?.is_open ?? true;
  const level = getOccupancyLevel(percentage);
  const isFull = currentCount >= maxCapacity;

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-[#fafafa] tracking-tight flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            Gym Availability
          </CardTitle>
          <StatusIndicator
            status={!isOpen ? 'danger' : isFull ? 'danger' : level.class === 'low' ? 'success' : level.class === 'moderate' ? 'warning' : 'danger'}
            pulse={isOpen && !isFull}
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center py-4">
        <OccupancyGauge
          currentCount={currentCount}
          maxCapacity={maxCapacity}
          percentage={percentage}
          isOpen={isOpen}
          size="lg"
        />

        {/* Status context callouts */}
        {!isOpen && (
          <div className="w-full mt-4">
            <GymClosedState variant="inline" />
          </div>
        )}

        {isOpen && isFull && (
          <div className="w-full mt-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2 justify-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Facility at max capacity ({maxCapacity}/{maxCapacity}). Wait for check-outs.</span>
          </div>
        )}
      </CardContent>

      <div className="pt-3 border-t border-[#27272a] flex items-center justify-between text-xs text-zinc-400 px-5 pb-4">
        <span>Traffic Density:</span>
        <span className="font-semibold" style={{ color: isOpen ? level.color : '#ef4444' }}>
          {isOpen ? level.label : 'Closed'}
        </span>
      </div>
    </Card>
  );
};
