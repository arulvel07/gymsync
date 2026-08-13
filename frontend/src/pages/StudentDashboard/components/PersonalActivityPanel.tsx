import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { formatDate, formatTime, formatDuration } from '@/lib/utils';
import type { GymSession } from '@/types';
import { Activity, Calendar, Clock, Dumbbell } from 'lucide-react';

interface PersonalActivityPanelProps {
  history: GymSession[];
  loading: boolean;
  onCheckInRequest?: () => void;
}

export const PersonalActivityPanel: React.FC<PersonalActivityPanelProps> = ({
  history,
  loading,
  onCheckInRequest,
}) => {
  // Calculate real month visits count safely
  const currentMonthVisits = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return history.filter((s) => {
      const d = new Date(s.check_in.replace('Z', '+00:00'));
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
  }, [history]);

  // Calculate avg duration of completed sessions in history
  const avgDuration = React.useMemo(() => {
    const completed = history.filter((s) => s.duration_minutes !== null && s.duration_minutes > 0);
    if (!completed.length) return null;
    const total = completed.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);
    return Math.round(total / completed.length);
  }, [history]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4 border-b border-[#27272a]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Personal Activity & History
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review your recent training sessions at the campus facility.
            </p>
          </div>

          {/* Activity summary metrics */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-center">
              <div className="text-[10px] uppercase text-zinc-500 font-semibold">This Month</div>
              <div className="text-xs font-bold text-white">{currentMonthVisits} visits</div>
            </div>
            {avgDuration !== null && (
              <div className="px-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-center">
                <div className="text-[10px] uppercase text-zinc-500 font-semibold">Avg Session</div>
                <div className="text-xs font-bold text-white">{formatDuration(avgDuration)}</div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 px-0 pb-0">
        {loading ? (
          <div className="p-4">
            <SkeletonTable rows={4} />
          </div>
        ) : history.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon={<Dumbbell className="w-8 h-8 text-zinc-500" />}
              title="No Recent Activity"
              description="You haven't completed any gym sessions yet. Check in when you train to start building your log."
              primaryAction={
                onCheckInRequest ? (
                  <button
                    type="button"
                    onClick={onCheckInRequest}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                  >
                    Check In Now
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Workout Focus</TableHead>
                    <TableHead className="text-right">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-white flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        {formatDate(s.check_in)}
                      </TableCell>
                      <TableCell>{formatTime(s.check_in)}</TableCell>
                      <TableCell>
                        {s.check_out ? (
                          formatTime(s.check_out)
                        ) : (
                          <Badge variant="green">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-zinc-200">{s.workout_type}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {s.duration_minutes !== null ? formatDuration(s.duration_minutes) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-2 px-4 pb-4">
              {history.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{s.workout_type}</span>
                      {!s.check_out && <Badge variant="green">Active</Badge>}
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-2">
                      <span>{formatDate(s.check_in)}</span>
                      <span>·</span>
                      <span>{formatTime(s.check_in)}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-xs text-zinc-300 font-medium">
                    {s.duration_minutes !== null ? formatDuration(s.duration_minutes) : 'In progress'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
