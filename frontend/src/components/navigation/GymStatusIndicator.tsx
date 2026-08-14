import React, { useEffect, useState } from 'react';
import { attendanceApi } from '@/services/api/attendance';
import type { OccupancyResponse } from '@/types';

interface GymStatusIndicatorProps {
  className?: string;
}

export const GymStatusIndicator: React.FC<GymStatusIndicatorProps> = ({ className = '' }) => {
  const [occupancy, setOccupancy] = useState<OccupancyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchOccupancy = async () => {
      try {
        const data = await attendanceApi.getOccupancy();
        if (isMounted) {
          setOccupancy(data);
          setError(false);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchOccupancy();
    const interval = setInterval(fetchOccupancy, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121215] border border-white/10 text-xs text-[#71717a] ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#71717a] animate-pulse" />
        <span className="font-mono text-[0.72rem]">Checking status...</span>
      </div>
    );
  }

  if (error || !occupancy) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121215] border border-white/10 text-xs text-[#71717a] ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
        <span className="font-mono text-[0.72rem]">Status offline</span>
      </div>
    );
  }

  const isOpen = occupancy.is_open;
  const count = occupancy.current_count ?? 0;
  const max = occupancy.max_capacity ?? 50;

  return (
    <div
      role="status"
      aria-label={`Facility status: ${isOpen ? 'Open' : 'Closed'}. ${isOpen ? `${count} of ${max} capacity currently in use.` : 'Facility is closed.'}`}
      className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium border transition-colors shrink-0 ${
        isOpen
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      } ${className}`}
      title={isOpen ? `Gym is Open. ${count} of ${max} capacity currently in use.` : 'Gym is currently Closed.'}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}
        aria-hidden="true"
      />
      <span className="font-semibold text-[0.72rem] sm:text-[0.75rem] tracking-tight">
        {isOpen ? 'OPEN' : 'CLOSED'}
      </span>
      {isOpen && (
        <>
          <span className="text-white/20 hidden xs:inline" aria-hidden="true">•</span>
          <span className="font-mono text-[0.7rem] sm:text-[0.72rem] font-medium text-emerald-300 hidden xs:inline" aria-hidden="true">
            {count}/{max}
          </span>
        </>
      )}
    </div>
  );
};
