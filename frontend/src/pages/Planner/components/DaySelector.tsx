import React, { useRef, useEffect } from 'react';
import type { WeekDayInfo } from './WeeklySchedule';
import type { WorkoutPlan, WorkoutTemplate } from '@/types';
import { Dumbbell } from 'lucide-react';

interface DaySelectorProps {
  weekDays: WeekDayInfo[];
  plans: WorkoutPlan[];
  templates: WorkoutTemplate[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  weekDays,
  plans,
  templates,
  selectedDate,
  onSelectDate,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const planMap = new Map<string, WorkoutPlan>();
  plans.forEach((p) => planMap.set(p.planned_date, p));

  const templateMap = new Map<number, WorkoutTemplate>();
  templates.forEach((t) => templateMap.set(t.day_of_week, t));

  // Scroll active item into view smoothly on select
  useEffect(() => {
    if (!scrollRef.current) return;
    const selectedEl = scrollRef.current.querySelector('[data-selected="true"]');
    if (selectedEl) {
      selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedDate]);

  return (
    <div className="md:hidden mb-5">
      <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-2 flex items-center justify-between">
        <span>Select Day</span>
        <span className="text-[10px] text-zinc-500 font-normal">Swipe to view week</span>
      </div>

      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {weekDays.map((day) => {
          const plan = planMap.get(day.dateStr);
          const template = templateMap.get(day.dayOfWeek);
          const isSelected = selectedDate === day.dateStr;

          const workoutName = plan ? plan.workout_type : template ? template.workout_type : null;

          return (
            <button
              key={day.dateStr}
              type="button"
              data-selected={isSelected}
              onClick={() => onSelectDate(day.dateStr)}
              className={`snap-center shrink-0 min-w-[76px] px-3 py-2.5 rounded-xl border transition-all text-center flex flex-col items-center justify-between cursor-pointer focus:outline-none ${
                isSelected
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/30'
                  : day.isToday
                  ? 'bg-[#18181c] border-amber-500/50 text-zinc-200'
                  : 'bg-[#121215] border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {day.shortName}
              </div>

              <div className="text-base font-bold font-mono my-0.5">
                {day.dayOfMonth}
              </div>

              <div className="h-4 flex items-center justify-center">
                {workoutName ? (
                  <div
                    className={`text-[9px] px-1.5 py-0.2 rounded-full flex items-center gap-0.5 truncate max-w-[64px] ${
                      isSelected ? 'bg-white/20 text-white font-semibold' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    <Dumbbell className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{workoutName}</span>
                  </div>
                ) : (
                  <span className={`text-[9px] ${isSelected ? 'text-blue-100' : 'text-zinc-600'}`}>
                    Open
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
