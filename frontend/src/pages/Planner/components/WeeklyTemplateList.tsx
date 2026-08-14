import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { WORKOUT_TYPES } from '@/lib/constants';
import { formatHour } from '@/lib/utils';
import type { WorkoutTemplate } from '@/types';
import { TIME_SLOTS } from './WorkoutPlanForm';
import { Repeat, Edit2, Trash2, Dumbbell, Clock } from 'lucide-react';

interface WeeklyTemplateListProps {
  templates: WorkoutTemplate[];
  onSaveTemplate: (dayOfWeek: number, timeSlot: number, workout: string) => Promise<void>;
  onDeleteTemplate: (dayOfWeek: number) => Promise<void>;
  loading?: boolean;
}

export const DAYS_MAPPING = [
  { name: 'Monday', short: 'Mon', dayOfWeek: 1 },
  { name: 'Tuesday', short: 'Tue', dayOfWeek: 2 },
  { name: 'Wednesday', short: 'Wed', dayOfWeek: 3 },
  { name: 'Thursday', short: 'Thu', dayOfWeek: 4 },
  { name: 'Friday', short: 'Fri', dayOfWeek: 5 },
  { name: 'Saturday', short: 'Sat', dayOfWeek: 6 },
  { name: 'Sunday', short: 'Sun', dayOfWeek: 0 },
];

export const WeeklyTemplateList: React.FC<WeeklyTemplateListProps> = ({
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  loading = false,
}) => {
  const [editingDay, setEditingDay] = useState<{ dayName: string; dayOfWeek: number } | null>(null);
  const [workoutType, setWorkoutType] = useState('Push');
  const [customWorkout, setCustomWorkout] = useState('');
  const [timeSlot, setTimeSlot] = useState(17);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const templateMap = new Map<number, WorkoutTemplate>();
  templates.forEach((t) => templateMap.set(t.day_of_week, t));

  const handleOpenEdit = (dayName: string, dayOfWeek: number) => {
    const existing = templateMap.get(dayOfWeek);
    setEditingDay({ dayName, dayOfWeek });
    if (existing) {
      const isKnown = (WORKOUT_TYPES as readonly string[]).includes(existing.workout_type);
      if (isKnown) {
        setWorkoutType(existing.workout_type);
        setCustomWorkout('');
      } else {
        setWorkoutType('Others');
        setCustomWorkout(existing.workout_type);
      }
      setTimeSlot(existing.planned_time_slot);
    } else {
      setWorkoutType('Push');
      setCustomWorkout('');
      setTimeSlot(17);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;
    const finalWorkout = workoutType === 'Others' ? customWorkout.trim() : workoutType;
    if (!finalWorkout) return;

    setSubmitting(true);
    try {
      await onSaveTemplate(editingDay.dayOfWeek, timeSlot, finalWorkout);
      setEditingDay(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingDay) return;
    setDeleting(true);
    try {
      await onDeleteTemplate(editingDay.dayOfWeek);
      setEditingDay(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3 border-b border-[#27272a]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-[#fafafa] tracking-tight flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-blue-400" />
              Weekly Routine
            </CardTitle>
            <span className="text-[11px] text-zinc-500 font-normal">Recurring schedule for every week</span>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {DAYS_MAPPING.map((day) => {
              const tpl = templateMap.get(day.dayOfWeek);
              return (
                <div
                  key={day.dayOfWeek}
                  className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">{day.name}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(day.name, day.dayOfWeek)}
                      className="p-1 text-zinc-500 hover:text-blue-400 rounded transition-colors cursor-pointer"
                      title={`Edit ${day.name} routine`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>

                  {tpl ? (
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <Dumbbell className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate">{tpl.workout_type}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                        <span>{formatHour(tpl.planned_time_slot)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-zinc-500 py-1 italic">
                      No routine set
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Routine Modal */}
      {editingDay && (
        <Modal
          isOpen={true}
          onClose={() => setEditingDay(null)}
          title={`Set ${editingDay.dayName} Routine`}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Workout Focus
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {WORKOUT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setWorkoutType(type)}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium text-left cursor-pointer ${
                      workoutType === type
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-semibold'
                        : 'bg-[#18181b] border-[#27272a] text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {workoutType === 'Others' && (
                <div className="mt-2">
                  <Input
                    label="Custom Workout"
                    value={customWorkout}
                    onChange={(e) => setCustomWorkout(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <Select
              label="Default Time Slot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(parseInt(e.target.value))}
            >
              {TIME_SLOTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>

            <div className="flex justify-between items-center pt-3 border-t border-[#27272a]">
              {templateMap.has(editingDay.dayOfWeek) ? (
                <Button
                  variant="danger"
                  size="sm"
                  type="button"
                  loading={deleting}
                  disabled={submitting}
                  onClick={handleDelete}
                  className="gap-1 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Routine
                </Button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <Button variant="secondary" type="button" onClick={() => setEditingDay(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" loading={submitting} disabled={deleting}>
                  Save Routine
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};
