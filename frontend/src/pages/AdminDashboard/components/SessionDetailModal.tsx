import React from 'react';
import type { GymSession } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatTime, formatDuration } from '@/lib/utils';
import { Calendar, Clock, Dumbbell, Activity } from 'lucide-react';

interface SessionDetailModalProps {
  session: GymSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  if (!session) return null;

  const isActive = !session.check_out;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Session Details"
      description="Inspect real-time student gym check-in record."
      className="max-w-lg"
    >
      <div className="space-y-4 pt-2">
        {/* Header summary banner */}
        <div className="p-4 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
              {session.full_name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{session.full_name || 'Student'}</div>
              <div className="text-xs text-[#a1a1aa] font-mono truncate">{session.roll_number || 'No roll number'}</div>
            </div>
          </div>
          <StatusBadge status={isActive ? 'active' : 'closed'} label={isActive ? 'Active Now' : 'Completed'} />
        </div>

        {/* Detailed Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <div className="text-xs font-medium text-[#71717a] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> Date
            </div>
            <div className="text-xs text-[#fafafa] font-medium">{formatDate(session.check_in)}</div>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <div className="text-xs font-medium text-[#71717a] flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5 text-blue-400" /> Workout Focus
            </div>
            <div className="text-xs text-[#fafafa] font-medium">{session.workout_type}</div>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <div className="text-xs font-medium text-[#71717a] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Check In
            </div>
            <div className="text-xs text-[#fafafa] font-medium">{formatTime(session.check_in)}</div>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
            <div className="text-xs font-medium text-[#71717a] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Check Out
            </div>
            <div className="text-xs text-[#fafafa] font-medium">
              {session.check_out ? formatTime(session.check_out) : <span className="text-emerald-400 font-semibold">Active in Gym</span>}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1 sm:col-span-2">
            <div className="text-xs font-medium text-[#71717a] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-zinc-400" /> Session Duration
            </div>
            <div className="text-xs text-[#fafafa] font-medium font-mono">
              {session.duration_minutes !== null && session.duration_minutes !== undefined
                ? `${formatDuration(session.duration_minutes)} (${session.duration_minutes} minutes)`
                : 'Session in progress'}
            </div>
          </div>
        </div>

        {/* Record ID Metadata */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[0.7rem] text-[#71717a]">
          <span>Session Record ID</span>
          <span className="font-mono text-[0.68rem] text-[#a1a1aa] truncate max-w-[200px]">{session.id}</span>
        </div>
      </div>
    </Modal>
  );
};
