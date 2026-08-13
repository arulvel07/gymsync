import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate, formatHour } from '@/lib/utils';
import type { WorkoutPlan, WorkoutTemplate } from '@/types';
import { Calendar, Plus, Trash2, Clock, Dumbbell, ExternalLink } from 'lucide-react';

interface PlannerPreviewProps {
  plans: WorkoutPlan[];
  templates: WorkoutTemplate[];
  onSavePlan: (date: string, time: number, workout: string) => Promise<void>;
  onDeletePlan: (date: string) => Promise<void>;
  loading?: boolean;
}

const TIME_SLOTS = [
  { value: 6, label: '6:00 AM' },
  { value: 7, label: '7:00 AM' },
  { value: 8, label: '8:00 AM' },
  { value: 9, label: '9:00 AM' },
  { value: 10, label: '10:00 AM' },
  { value: 16, label: '4:00 PM' },
  { value: 17, label: '5:00 PM' },
  { value: 18, label: '6:00 PM' },
  { value: 19, label: '7:00 PM' },
  { value: 20, label: '8:00 PM' },
  { value: 21, label: '9:00 PM' },
];

export const PlannerPreview: React.FC<PlannerPreviewProps> = ({
  plans,
  templates,
  onSavePlan,
  onDeletePlan,
  loading = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [planDate, setPlanDate] = useState(tomorrowStr);
  const [planTime, setPlanTime] = useState(17);
  const [planWorkout, setPlanWorkout] = useState('Chest');
  const [submitting, setSubmitting] = useState(false);

  // Determine next upcoming plan (sorted by date)
  const sortedPlans = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return [...plans]
      .filter((p) => p.planned_date >= today)
      .sort((a, b) => a.planned_date.localeCompare(b.planned_date));
  }, [plans]);

  const nextPlan = sortedPlans[0];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planDate || !planWorkout.trim()) return;
    setSubmitting(true);
    try {
      await onSavePlan(planDate, planTime, planWorkout.trim());
      setModalOpen(false);
      setPlanWorkout('Chest');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col justify-between">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              Your Next Workout
            </CardTitle>
            <div className="flex items-center gap-1">
              <Link
                to="/planner"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-500/10 transition-colors flex items-center gap-1 no-underline"
              >
                <span>Full Planner</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-400 hover:text-blue-300 gap-1 h-7 px-2"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5" /> Plan Workout
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-center">
          {nextPlan ? (
            <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-blue-400 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(nextPlan.planned_date)}
                  </div>
                  <div className="text-lg font-bold text-white mt-1 flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4 text-zinc-400" />
                    {nextPlan.workout_type}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-1.5 h-auto"
                  title="Remove plan"
                  onClick={() => onDeletePlan(nextPlan.planned_date)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  {formatHour(nextPlan.planned_time_slot)}
                </span>
                <span className="text-emerald-400 font-medium">Planned</span>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <EmptyState
                icon={<Calendar className="w-6 h-6 text-zinc-500" />}
                title="No Upcoming Workout"
                description="Plan your next session to keep your fitness routine on schedule."
                primaryAction={
                  <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
                    Schedule Session
                  </Button>
                }
              />
            </div>
          )}

          {/* Secondary upcoming list if multiple */}
          {sortedPlans.length > 1 && (
            <div className="mt-3 space-y-1.5">
              <div className="text-[10px] uppercase text-zinc-500 font-semibold">Later this week</div>
              {sortedPlans.slice(1, 3).map((p) => (
                <div
                  key={p.id}
                  className="px-3 py-2 rounded-lg bg-[#18181b]/50 border border-zinc-800/60 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-zinc-300">{p.workout_type}</span>
                  <span className="text-zinc-500 text-[11px]">
                    {formatDate(p.planned_date)} · {formatHour(p.planned_time_slot)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan Workout Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Plan Upcoming Workout">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Input
            label="Target Date"
            type="date"
            value={planDate}
            onChange={(e) => setPlanDate(e.target.value)}
          />

          <Select
            label="Preferred Time Slot"
            value={planTime}
            onChange={(e) => setPlanTime(parseInt(e.target.value))}
          >
            {TIME_SLOTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>

          <Input
            label="Workout Focus"
            placeholder="e.g. Chest & Triceps"
            value={planWorkout}
            onChange={(e) => setPlanWorkout(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-[#27272a]">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              Save Workout Plan
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
