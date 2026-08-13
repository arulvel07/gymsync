import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatHour } from '@/lib/utils';
import type { WorkoutPlan, WorkoutTemplate } from '@/types';
import { Dumbbell, Clock, Plus, CheckCircle2 } from 'lucide-react';

export interface WeekDayInfo {
  dateStr: string;
  dayName: string;
  shortName: string;
  dayOfWeek: number; // 0=Sun, 1=Mon...
  dayOfMonth: number;
  monthName: string;
  isToday: boolean;
}

interface WeeklyScheduleProps {
  weekDays: WeekDayInfo[];
  plans: WorkoutPlan[];
  templates: WorkoutTemplate[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  loading?: boolean;
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  weekDays,
  plans,
  templates,
  selectedDate,
  onSelectDate,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="hidden md:grid grid-cols-7 gap-3 mb-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="p-3 rounded-xl bg-[#121215] border border-white/10 space-y-3">
            <Skeleton height="16px" width="60%" />
            <Skeleton height="24px" width="80%" />
            <Skeleton height="14px" width="100%" />
          </div>
        ))}
      </div>
    );
  }

  // Create fast map for plans and templates
  const planMap = new Map<string, WorkoutPlan>();
  plans.forEach((p) => planMap.set(p.planned_date, p));

  const templateMap = new Map<number, WorkoutTemplate>();
  templates.forEach((t) => templateMap.set(t.day_of_week, t));

  return (
    <div className="hidden md:block mb-6">
      <div className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-3 flex items-center justify-between">
        <span>YOUR WEEK</span>
        <span className="text-[11px] text-zinc-500 font-normal">Click any day to schedule or view crowd forecast</span>
      </div>

      <div className="grid grid-cols-7 gap-2.5">
        {weekDays.map((day) => {
          const plan = planMap.get(day.dateStr);
          const template = templateMap.get(day.dayOfWeek);
          const isSelected = selectedDate === day.dateStr;

          // Determine workout and time slot (plan takes precedence over routine template)
          const workoutName = plan ? plan.workout_type : template ? template.workout_type : null;
          const timeSlot = plan ? plan.planned_time_slot : template ? template.planned_time_slot : null;
          const isFromTemplate = !plan && !!template;

          return (
            <button
              key={day.dateStr}
              type="button"
              onClick={() => onSelectDate(day.dateStr)}
              className={`text-left p-3 rounded-xl border transition-all duration-150 relative flex flex-col justify-between min-h-[120px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-900/20 text-white'
                  : day.isToday
                  ? 'bg-[#18181c] border-amber-500/40 text-zinc-200 hover:border-amber-500/70'
                  : 'bg-[#121215] border-white/10 text-zinc-300 hover:border-white/20 hover:bg-[#18181c]'
              }`}
            >
              {/* Day Header */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-blue-400' : 'text-zinc-400'}`}>
                    {day.shortName}
                  </span>
                  {day.isToday && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Today
                    </span>
                  )}
                </div>

                <div className="text-lg font-bold font-mono tracking-tight text-white mb-2">
                  {day.dayOfMonth} <span className="text-xs font-normal text-zinc-400">{day.monthName}</span>
                </div>
              </div>

              {/* Workout Content */}
              <div className="mt-auto pt-2 border-t border-white/5">
                {workoutName ? (
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                      <Dumbbell className={`w-3 h-3 shrink-0 ${isSelected ? 'text-blue-400' : 'text-zinc-400'}`} />
                      <span className="truncate">{workoutName}</span>
                    </div>

                    <div className="text-[10px] text-zinc-400 flex items-center justify-between">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-zinc-500" />
                        {timeSlot !== null ? formatHour(timeSlot) : '—'}
                      </span>
                      {plan ? (
                        <span className="text-[9px] font-semibold text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Planned
                        </span>
                      ) : isFromTemplate ? (
                        <span className="text-[9px] text-zinc-500 italic">Routine</span>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1 hover:text-zinc-400 transition-colors">
                    <Plus className="w-3 h-3 text-zinc-600" />
                    <span>Open</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
