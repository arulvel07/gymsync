import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WORKOUT_TYPES } from '@/lib/constants';
import { Dumbbell, Activity, Flame, Zap, Compass, QrCode, ArrowRight } from 'lucide-react';

interface CheckInPanelProps {
  selectedWorkout: string;
  onSelectWorkout: (workout: string) => void;
  customWorkout: string;
  onCustomWorkoutChange: (val: string) => void;
  onCheckInClick: () => void;
  loading: boolean;
  isOpen: boolean;
  isFull: boolean;
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
}) => {
  const canCheckIn = isOpen && !isFull;

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-1">
          Session Registration
        </div>
        <CardTitle className="text-lg font-semibold text-white">
          Ready to Train? What are you working today?
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 flex-1">
        {/* Workout Selection Grid */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Select Training Focus
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {WORKOUT_TYPES.map((type) => {
              const isSelected = selectedWorkout === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onSelectWorkout(type)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 text-blue-400 shadow-sm'
                      : 'bg-[#18181b] border-[#27272a] text-zinc-300 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  <span className={isSelected ? 'text-blue-400' : 'text-zinc-500'}>
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

      <div className="p-5 pt-3 border-t border-[#27272a]">
        <Button
          variant="primary"
          size="lg"
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3"
          onClick={onCheckInClick}
          loading={loading}
          disabled={!canCheckIn || loading}
        >
          <QrCode className="w-4 h-4" />
          <span>{!isOpen ? 'Facility Closed' : isFull ? 'Capacity Reached' : 'Check In Now'}</span>
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>
      </div>
    </Card>
  );
};
