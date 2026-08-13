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
          <CardTitle className="text-xs uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5" />
            Active Gym Session
          </CardTitle>
          <StatusBadge status="open" label="Session Active" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center py-6 text-center space-y-4">
        <div>
          <div className="text-xs text-zinc-400 font-medium mb-1">Current Training Focus</div>
          <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <span>{activeSession.workout_type}</span>
          </div>
          <div className="text-xs text-zinc-400 mt-1 flex items-center justify-center gap-1">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span>Started at {formatTime(activeSession.check_in)}</span>
          </div>
        </div>

        {/* Live Elapsed Duration Ticker */}
        <div className="w-full py-4 px-6 rounded-xl bg-[#121215] border border-[#27272a]">
          <div className="text-[11px] uppercase tracking-widest text-zinc-500 font-semibold mb-1">
            Elapsed Time
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-emerald-400">
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
          <span>End Session & Check Out</span>
        </Button>
      </div>
    </Card>
  );
};
