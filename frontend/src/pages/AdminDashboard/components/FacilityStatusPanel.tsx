import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { StatusType } from '@/components/ui/StatusIndicator';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getOccupancyLevel, formatTime } from '@/lib/utils';
import type { OccupancyResponse } from '@/types';
import { RefreshCw, Activity, ShieldCheck, ShieldAlert } from 'lucide-react';

interface FacilityStatusPanelProps {
  occupancy: OccupancyResponse | null;
  loading: boolean;
  error: boolean;
  onRefresh: () => void;
  lastUpdated: Date | null;
}

export const FacilityStatusPanel: React.FC<FacilityStatusPanelProps> = ({
  occupancy,
  loading,
  error,
  onRefresh,
  lastUpdated,
}) => {
  if (loading && !occupancy) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-4 w-36" />
        </div>
      </Card>
    );
  }

  if (error || !occupancy) {
    return (
      <Card className="p-6 border-rose-500/20 bg-rose-500/5">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
              <ShieldAlert size={14} /> Facility Telemetry Status
            </div>
            <h3 className="text-lg font-bold text-white">Status Unavailable</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Could not retrieve real-time gym occupancy data from the facility server.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={onRefresh}>
            <RefreshCw size={14} /> Retry
          </Button>
        </div>
      </Card>
    );
  }

  const isOpen = occupancy.is_open;
  const count = occupancy.current_count ?? 0;
  const max = occupancy.max_capacity ?? 50;
  const pct = occupancy.percentage ?? Math.round((count / max) * 100);
  const isFull = count >= max;

  const level = getOccupancyLevel(pct);

  // Status mapping using StatusBadge status types
  let statusType: StatusType = 'open';
  let statusDetail = level.label;

  if (!isOpen) {
    statusType = 'closed';
    statusDetail = 'Gym closed by administration';
  } else if (isFull) {
    statusType = 'full';
    statusDetail = 'Maximum capacity reached';
  } else if (pct > 70) {
    statusType = 'moderate';
    statusDetail = level.label;
  }

  return (
    <Card className="p-6 flex flex-col justify-between relative overflow-hidden">
      <div>
        {/* Header bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-1.5">
              <Activity size={14} className="text-blue-400" /> Facility Status
            </span>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={statusType} />
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="text-zinc-400 hover:text-white p-1.5 h-auto"
              title="Refresh facility status"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </Button>
          </div>
        </div>

        {/* Headcount Stat */}
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span
                className="text-5xl font-extrabold font-mono leading-none tracking-tight"
                style={{ color: !isOpen ? '#ef4444' : level.color }}
              >
                {count}
              </span>
              <span className="text-xl font-medium text-zinc-500 font-mono">/ {max}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              {isOpen ? statusDetail : 'Facility is currently closed for workouts'}
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold font-mono" style={{ color: !isOpen ? '#ef4444' : level.color }}>
              {pct}%
            </div>
            <div className="text-[0.7rem] uppercase tracking-wider font-semibold text-zinc-500">
              Capacity Load
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden mb-3">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${Math.min(100, pct)}%`,
              backgroundColor: !isOpen ? '#ef4444' : level.color,
            }}
          />
        </div>
      </div>

      {/* Footer Meta */}
      <div className="flex justify-between items-center text-[0.72rem] text-zinc-500 pt-2 border-t border-white/5">
        <span className="flex items-center gap-1 text-zinc-400">
          <ShieldCheck size={12} className="text-emerald-400" /> Sensor & Access Gateways Online
        </span>
        {lastUpdated && (
          <span className="font-mono">
            Updated {formatTime(lastUpdated.toISOString())}
          </span>
        )}
      </div>
    </Card>
  );
};
