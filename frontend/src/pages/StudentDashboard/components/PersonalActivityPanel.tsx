import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { formatDate, formatTime, formatDuration, parseUTC } from '@/lib/utils';
import type { GymSession } from '@/types';
import { Activity, Calendar, Clock, Dumbbell, Plus } from 'lucide-react';

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
      const d = parseUTC(s.check_in);
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
    <Card id="activity" tabIndex={-1} className="w-full scroll-mt-20 focus:outline-none">
      <CardHeader className="pb-4 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold text-[#fafafa] tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Your Activity
            </CardTitle>
            <p className="text-xs text-[#a1a1aa] mt-0.5">
              Review your recent training sessions and visits.
            </p>
          </div>

          {/* Activity summary metrics */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/10 text-center">
              <div className="text-[10px] uppercase text-[#71717a] font-semibold">This Month</div>
              <div className="text-xs font-bold text-white">{currentMonthVisits} visits</div>
            </div>
            {avgDuration !== null && (
              <div className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/10 text-center">
                <div className="text-[10px] uppercase text-[#71717a] font-semibold">Avg Session</div>
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
              title="No Recent Workouts"
              description="Your workout log is clear. Check in when you train to start tracking your sessions."
              primaryAction={
                onCheckInRequest ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onCheckInRequest}
                    iconLeft={<Plus className="w-3.5 h-3.5" />}
                  >
                    Check In Now
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table label="Personal activity history table">
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
                        <Calendar className="w-3.5 h-3.5 text-[#71717a]" aria-hidden="true" />
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
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/10 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{s.workout_type}</span>
                      {!s.check_out && <Badge variant="green">Active</Badge>}
                    </div>
                    <div className="text-[11px] text-[#a1a1aa] flex items-center gap-2">
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
