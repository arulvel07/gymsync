import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { WORKOUT_TYPES } from '@/lib/constants';
import { formatDate, formatHour, getOccupancyLevel } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import type { WorkoutPlan, CrowdForecastResponse } from '@/types';
import {
  Calendar,
  Clock,
  Dumbbell,
  Trash2,
  CheckCircle2,
  Flame,
  Zap,
  Activity,
  PlusCircle,
  Save,
  Users,
} from 'lucide-react';

interface WorkoutPlanFormProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  existingPlan?: WorkoutPlan;
  selectedTimeSlot: number;
  onTimeSlotChange: (timeSlot: number) => void;
  onSavePlan: (date: string, timeSlot: number, workout: string, notes?: string) => Promise<void>;
  onDeletePlan: (date: string) => Promise<void>;
  forecast?: CrowdForecastResponse | null;
  forecastLoading?: boolean;
  loading?: boolean;
}

export const TIME_SLOTS = [
  { value: 6, label: '6:00 AM (Morning Entry)' },
  { value: 7, label: '7:00 AM' },
  { value: 8, label: '8:00 AM' },
  { value: 9, label: '9:00 AM' },
  { value: 10, label: '10:00 AM (Morning Close)' },
  { value: 16, label: '4:00 PM (Evening Reopen)' },
  { value: 17, label: '5:00 PM' },
  { value: 18, label: '6:00 PM' },
  { value: 19, label: '7:00 PM' },
  { value: 20, label: '8:00 PM' },
  { value: 21, label: '9:00 PM (Evening Close)' },
];

const getWorkoutIcon = (workout: string) => {
  switch (workout) {
    case 'Push':
    case 'Pull':
      return <Dumbbell className="w-4 h-4" />;
    case 'Legs':
      return <Flame className="w-4 h-4" />;
    case 'Cardio':
      return <Activity className="w-4 h-4" />;
    case 'Full Body':
    case 'Shoulders':
      return <Zap className="w-4 h-4" />;
    default:
      return <Dumbbell className="w-4 h-4" />;
  }
};

export const WorkoutPlanForm: React.FC<WorkoutPlanFormProps> = ({
  selectedDate,
  onSelectDate,
  existingPlan,
  selectedTimeSlot,
  onTimeSlotChange,
  onSavePlan,
  onDeletePlan,
  forecast,
  forecastLoading = false,
  loading = false,
}) => {
  const [selectedWorkout, setSelectedWorkout] = useState<string>('Push');
  const [customWorkout, setCustomWorkout] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync form state when selected date or existing plan changes
  useEffect(() => {
    if (existingPlan) {
      const isKnownType = (WORKOUT_TYPES as readonly string[]).includes(existingPlan.workout_type);
      if (isKnownType) {
        setSelectedWorkout(existingPlan.workout_type);
        setCustomWorkout('');
      } else {
        setSelectedWorkout('Others');
        setCustomWorkout(existingPlan.workout_type);
      }
      onTimeSlotChange(existingPlan.planned_time_slot);
      setNotes(existingPlan.notes || '');
    } else {
      setSelectedWorkout('Push');
      setCustomWorkout('');
      setNotes('');
    }
  }, [selectedDate, existingPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalWorkout = selectedWorkout === 'Others' ? customWorkout.trim() : selectedWorkout;
    if (!finalWorkout) return;

    setSubmitting(true);
    try {
      await onSavePlan(selectedDate, selectedTimeSlot, finalWorkout, notes.trim() || undefined);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingPlan) return;
    setDeleting(true);
    try {
      await onDeletePlan(selectedDate);
    } finally {
      setDeleting(false);
    }
  };

  const formattedDateTitle = formatDate(selectedDate);

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader className="pb-4 border-b border-[#27272a]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Plan A Workout
            </div>
            <CardTitle className="text-lg font-bold text-white">
              {formattedDateTitle}
            </CardTitle>
          </div>

          {existingPlan && (
            <Badge variant="green" icon={<CheckCircle2 className="w-3 h-3 text-emerald-400" />}>
              Planned
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-5 flex-1 flex flex-col justify-between">
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Target Date Picker */}
            <Input
              label="Target Date"
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onSelectDate(e.target.value)}
              className="text-xs"
            />

            {/* Workout Selection Pills / Grid */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Workout Focus
              </label>

              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                role="group"
                aria-label="Select workout focus"
              >
                {WORKOUT_TYPES.map((type) => {
                  const isSelected = selectedWorkout === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedWorkout(type)}
                      aria-pressed={isSelected}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-semibold shadow-sm'
                          : 'bg-[#18181b] border-[#27272a] text-zinc-300 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <span className={isSelected ? 'text-blue-400' : 'text-zinc-500'} aria-hidden="true">
                        {getWorkoutIcon(type)}
                      </span>
                      <span className="truncate">{type}</span>
                    </button>
                  );
                })}
              </div>

              {selectedWorkout === 'Others' && (
                <div className="mt-2.5">
                  <Input
                    label="Custom Workout Focus"
                    placeholder="e.g. Abs & Mobility, Calisthenics"
                    value={customWorkout}
                    onChange={(e) => setCustomWorkout(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            {/* Time Slot Selection */}
            <Select
              label="Training Time Slot"
              value={selectedTimeSlot}
              onChange={(e) => onTimeSlotChange(parseInt(e.target.value))}
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </Select>

            {/* Expected Crowd Indicator */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#18181b] border border-[#27272a]">
              <div className="text-xs text-zinc-400 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Expected crowd</span>
              </div>
              {forecastLoading ? (
                <Skeleton height="20px" width="70px" />
              ) : forecast ? (
                <Badge
                  variant={
                    getOccupancyLevel(forecast.predicted_percentage).class === 'low'
                      ? 'green'
                      : getOccupancyLevel(forecast.predicted_percentage).class === 'moderate'
                      ? 'amber'
                      : 'red'
                  }
                >
                  {getOccupancyLevel(forecast.predicted_percentage).label}
                </Badge>
              ) : (
                <span className="text-xs text-zinc-500">—</span>
              )}
            </div>

            {/* Workout Notes */}
            <Input
              label="Workout Notes (Optional)"
              placeholder="e.g. Heavy bench press 5x5, squat PR"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#27272a] flex items-center justify-between gap-3">
            {existingPlan ? (
              <>
                <Button
                  variant="danger"
                  size="sm"
                  type="button"
                  loading={deleting}
                  disabled={submitting || loading}
                  onClick={handleDelete}
                  className="gap-1.5 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Plan
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  loading={submitting}
                  disabled={deleting || loading}
                  className="gap-1.5 ml-auto text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Update Plan
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="md"
                type="submit"
                loading={submitting}
                disabled={loading}
                className="w-full gap-2 text-xs font-semibold justify-center"
              >
                <PlusCircle className="w-4 h-4" />
                Add to Plan
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
