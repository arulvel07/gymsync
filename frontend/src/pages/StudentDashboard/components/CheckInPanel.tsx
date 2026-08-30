import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WORKOUT_TYPES } from '@/lib/constants';
import { formatHour } from '@/lib/utils';
import type { WorkoutPlan } from '@/types';
import { Dumbbell, Activity, Flame, Zap, Compass, QrCode, ArrowRight, Calendar, Check } from 'lucide-react';

interface CheckInPanelProps {
  selectedWorkout: string;
  onSelectWorkout: (workout: string) => void;
  customWorkout: string;
  onCustomWorkoutChange: (val: string) => void;
  onCheckInClick: () => void;
  loading: boolean;
  isOpen: boolean;
  isFull: boolean;
  todayPlan?: WorkoutPlan | null;
}

// Icon helper without emojis
const getWorkoutLucideIcon = (type: string) => {
  switch (type) {
    case 'Push':
    case 'Pull':
      return <Dumbbell className="w-4 h-4" />;
    case 'Legs':
      return <Flame className="w-4 h-4" />;
    case 'Shoulders':
      return <Zap className="w-4 h-4" />;
    case 'Cardio':
      return <Activity className="w-4 h-4" />;
    case 'Full Body':
      return <Compass className="w-4 h-4" />;
    default:
      return <Dumbbell className="w-4 h-4" />;
  }
};

export const CheckInPanel: React.FC<CheckInPanelProps> = ({
  selectedWorkout,
  onSelectWorkout,
  customWorkout,
  onCustomWorkoutChange,
  onCheckInClick,
  loading,
  isOpen,
  isFull,
  todayPlan,
}) => {
  const canCheckIn = isOpen && !isFull;

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="text-xs uppercase tracking-wider text-[#71717a] font-semibold mb-1">
          Session Registration
        </div>
        <CardTitle className="text-lg font-semibold text-[#fafafa]">
          Ready to Train? What are you working today?
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 flex-1">
        {/* Today's Planned Workout Context Banner */}
        {todayPlan && (
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-between gap-3 text-xs animate-fade-in">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0" aria-hidden="true">
                <Calendar size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                  Today's Planned Workout
                </div>
                <div className="font-semibold text-white truncate text-xs sm:text-sm">
                  {todayPlan.workout_type} · {formatHour(todayPlan.planned_time_slot)}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onSelectWorkout(todayPlan.workout_type)}
              aria-label={`Select today's planned ${todayPlan.workout_type} workout`}
              className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${
                selectedWorkout === todayPlan.workout_type
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
              }`}
            >
              {selectedWorkout === todayPlan.workout_type ? (
                <>
                  <Check size={12} aria-hidden="true" />
                  <span>Selected</span>
                </>
              ) : (
                'Use Planned'
              )}
            </button>
          </div>
        )}

        {/* Workout Selection Grid */}
        <div>
          <label className="block text-xs font-semibold text-[#a1a1aa] mb-2">
            Select Training Focus
          </label>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            role="group"
            aria-label="Select training focus"
          >
            {WORKOUT_TYPES.map((type) => {
              const isSelected = selectedWorkout === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onSelectWorkout(type)}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 text-blue-400 shadow-sm'
                      : 'bg-[#18181c] border-white/10 text-zinc-300 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span className={isSelected ? 'text-blue-400' : 'text-[#71717a]'} aria-hidden="true">
                    {getWorkoutLucideIcon(type)}
                  </span>
                  <span className="truncate">{type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Workout Input for 'Others' */}
        {selectedWorkout === 'Others' && (
          <div className="pt-1 animate-fade-in-up">
            <Input
              label="Custom Workout Focus"
              placeholder="e.g. Abs & Forearms, Mobility"
              value={customWorkout}
              onChange={(e) => onCustomWorkoutChange(e.target.value)}
            />
          </div>
        )}
      </CardContent>

      <div className="p-5 pt-3 border-t border-white/10">
        <Button
          variant="primary"
          size="lg"
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3"
          onClick={onCheckInClick}
          loading={loading}
          disabled={!canCheckIn || loading}
        >
          <QrCode className="w-4 h-4" />
          <span>
            {loading
              ? 'Checking In...'
              : !isOpen
              ? 'Facility Closed'
              : isFull
              ? 'Capacity Reached'
              : 'Check In Now'}
          </span>
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>
      </div>
    </Card>
  );
};
