import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTime } from '@/lib/utils';
import type { GymSession } from '@/types';
import { Dumbbell, Clock, LogOut } from 'lucide-react';

interface ActiveSessionPanelProps {
  activeSession: GymSession;
  sessionTimer: string;
  onCheckOut: () => void;
  loading?: boolean;
}

export const ActiveSessionPanel: React.FC<ActiveSessionPanelProps> = ({
  activeSession,
  sessionTimer,
  onCheckOut,
  loading = false,
}) => {
  return (
    <Card className="h-full flex flex-col justify-between border-emerald-500/30 bg-emerald-950/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-subtle" />
            <CardTitle className="text-xs uppercase tracking-widest font-bold text-emerald-400">
              YOU ARE CHECKED IN
            </CardTitle>
          </div>
          <StatusBadge status="open" label="Active Session" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-4">
        <div>
          <div className="text-xs text-zinc-400 font-medium mb-1">Current Focus</div>
          <div className="text-3xl font-extrabold text-white flex items-center justify-center gap-2 tracking-tight">
            <Dumbbell className="w-6 h-6 text-emerald-400" />
            <span>{activeSession.workout_type}</span>
          </div>
          <div className="text-xs text-zinc-400 mt-1.5 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Started {formatTime(activeSession.check_in)}</span>
          </div>
        </div>

        {/* Live Elapsed Duration Ticker */}
        <div className="w-full py-4 px-6 rounded-xl bg-[#121215] border border-[#27272a]">
          <div className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold mb-1 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle inline-block" />
            <span>Session Duration</span>
          </div>
          <div className="font-mono tabular-nums text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-400">
            {sessionTimer}
          </div>
        </div>
      </CardContent>

      <div className="p-5 pt-3 border-t border-[#27272a]">
        <Button
          variant="danger"
          size="lg"
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold py-3"
          onClick={onCheckOut}
          loading={loading}
        >
          <LogOut className="w-4 h-4" />
          <span>{loading ? 'Checking out...' : 'Check out'}</span>
        </Button>
      </div>
    </Card>
  );
};

