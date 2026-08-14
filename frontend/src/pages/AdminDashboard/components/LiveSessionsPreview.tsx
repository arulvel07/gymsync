import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatTime, formatDuration } from '@/lib/utils';
import { getWorkoutColor, getWorkoutIcon } from '@/lib/constants';
import type { GymSession } from '@/types';
import { Activity, ArrowRight, UserCheck } from 'lucide-react';

interface LiveSessionsPreviewProps {
  sessions: GymSession[];
  loading: boolean;
  onViewAll: () => void;
}

export const LiveSessionsPreview: React.FC<LiveSessionsPreviewProps> = ({
  sessions,
  loading,
  onViewAll,
}) => {
  if (loading && !sessions.length) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    );
  }

  // Display top 5 active/recent sessions
  const displaySessions = sessions.slice(0, 5);

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-zinc-400 font-semibold flex items-center gap-1.5 mb-0.5">
            <Activity size={14} className="text-emerald-400" /> Live Activity
          </div>
          <h3 className="text-base font-bold text-white">Current & Recent Sessions</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-blue-400 hover:text-blue-300">
          View Attendance Register <ArrowRight size={14} />
        </Button>
      </div>

      {/* Sessions Content */}
      {displaySessions.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-zinc-400 uppercase text-[0.7rem] tracking-wider font-semibold">
                  <th className="pb-2.5 font-semibold">Student</th>
                  <th className="pb-2.5 font-semibold">Roll Number</th>
                  <th className="pb-2.5 font-semibold">Workout</th>
                  <th className="pb-2.5 font-semibold">Check-In</th>
                  <th className="pb-2.5 font-semibold text-right">Status / Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {displaySessions.map((s) => {
                  const isActive = !s.check_out;
                  const workoutColor = getWorkoutColor(s.workout_type);

                  return (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 font-semibold text-white">
                        {s.full_name || 'Student'}
                      </td>
                      <td className="py-3 font-mono text-zinc-400">
                        {s.roll_number || '—'}
                      </td>
                      <td className="py-3 font-medium">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[0.72rem] bg-white/[0.04] border border-white/5"
                          style={{ color: workoutColor }}
                        >
                          {getWorkoutIcon(s.workout_type, "w-3.5 h-3.5")}
                          <span>{s.workout_type}</span>
                        </span>
                      </td>
                      <td className="py-3 font-mono text-zinc-400">
                        {formatTime(s.check_in)}
                      </td>
                      <td className="py-3 text-right">
                        {isActive ? (
                          <StatusBadge status="active" />
                        ) : (
                          <span className="font-mono text-zinc-400">
                            {s.duration_minutes ? formatDuration(s.duration_minutes) : formatTime(s.check_out)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="sm:hidden space-y-2.5">
            {displaySessions.map((s) => {
              const isActive = !s.check_out;
              const workoutColor = getWorkoutColor(s.workout_type);

              return (
                <div
                  key={s.id}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {s.full_name || 'Student'}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        {s.roll_number || '—'}
                      </div>
                    </div>
                    {isActive ? (
                      <StatusBadge status="active" />
                    ) : (
                      <span className="text-[11px] font-mono text-zinc-400">
                        {s.duration_minutes ? formatDuration(s.duration_minutes) : formatTime(s.check_out)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5 text-zinc-400">
                    <span
                      className="inline-flex items-center gap-1 font-medium"
                      style={{ color: workoutColor }}
                    >
                      {getWorkoutIcon(s.workout_type, "w-3 h-3")}
                      <span>{s.workout_type}</span>
                    </span>
                    <span className="font-mono text-zinc-400">
                      In: {formatTime(s.check_in)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState
          icon={<UserCheck className="w-8 h-8 text-zinc-500" />}
          title="No Active Sessions"
          description="No students are currently checked into the gym."
          className="py-8"
        />
      )}
    </Card>
  );
};
