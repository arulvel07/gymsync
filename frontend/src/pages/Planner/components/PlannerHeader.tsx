import React from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface PlannerHeaderProps {
  weekStartDate: Date;
  weekEndDate: Date;
  isCurrentWeek: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
}

export const PlannerHeader: React.FC<PlannerHeaderProps> = ({
  weekStartDate,
  weekEndDate,
  isCurrentWeek,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
}) => {
  const startStr = formatDate(weekStartDate.toISOString().split('T')[0]);
  const endStr = formatDate(weekEndDate.toISOString().split('T')[0]);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#fafafa] flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-blue-400" />
            Workout Planner
          </h1>
        </div>
        <p className="text-xs text-[#a1a1aa] mt-1">
          Plan your weekly workouts and see expected crowd levels before choosing a time.
        </p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="text-xs font-semibold text-zinc-300 bg-[#121215] border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-zinc-500" />
          <span>
            {startStr} – {endStr}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#121215] border border-white/10 p-1 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
            onClick={onPrevWeek}
            title="Previous Week"
            aria-label="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {!isCurrentWeek && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] font-semibold text-blue-400 hover:text-blue-300 gap-1"
              onClick={onCurrentWeek}
              title="Jump to Current Week"
            >
              <RotateCcw className="w-3 h-3" />
              This Week
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
            onClick={onNextWeek}
            title="Next Week"
            aria-label="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
