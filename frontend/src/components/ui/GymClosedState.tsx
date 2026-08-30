import React, { ReactNode } from 'react';
import { Clock, Lock, Calendar } from 'lucide-react';
import { Button } from './Button';

export interface GymClosedStateProps {
  title?: string;
  closingTime?: string; // e.g. "10:00 PM"
  nextAvailableDate?: string; // e.g. "Tomorrow"
  nextAvailableTime?: string; // e.g. "6:00 AM"
  subtitle?: string;
  primaryAction?: ReactNode;
  onViewSchedule?: () => void;
  className?: string;
  variant?: 'card' | 'inline' | 'page';
}

export const GymClosedState: React.FC<GymClosedStateProps> = ({
  title = 'Gym Closed',
  closingTime = '10:00 PM',
  nextAvailableDate = 'Tomorrow',
  nextAvailableTime = '6:00 AM',
  subtitle,
  primaryAction,
  onViewSchedule,
  className = '',
  variant = 'card',
}) => {
  const formattedNotice = subtitle || `Today's hours ended at ${closingTime}.`;

  if (variant === 'inline') {
    return (
      <div
        className={`p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between gap-3 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <div className="truncate">
            <span className="font-semibold text-amber-200">{title}</span>
            <span className="mx-1.5 text-amber-500/60" aria-hidden="true">·</span>
            <span className="text-amber-300/90">{formattedNotice}</span>
          </div>
        </div>

        {onViewSchedule && (
          <button
            type="button"
            onClick={onViewSchedule}
            className="text-amber-400 hover:text-amber-200 font-semibold underline shrink-0 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          >
            View schedule
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`text-center p-6 sm:p-8 max-w-md mx-auto flex flex-col items-center justify-center ${
        variant === 'page'
          ? 'min-h-[50vh] glass-card my-6'
          : 'bg-[#121215]/80 border border-white/10 rounded-xl'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400 shrink-0"
        aria-hidden="true"
      >
        <Lock className="w-6 h-6" aria-hidden="true" />
      </div>

      <h3 className="text-base font-bold text-amber-400 tracking-tight mb-1">{title}</h3>
      <p className="text-xs text-[#a1a1aa] leading-relaxed mb-4">{formattedNotice}</p>

      {/* Next available session block */}
      <div className="w-full bg-white/5 border border-white/10 rounded-lg p-3 mb-5 text-left flex items-center gap-3">
        <div
          className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0"
          aria-hidden="true"
        >
          <Calendar className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase font-semibold text-[#71717a] tracking-wider">
            Your next available session
          </div>
          <div className="text-xs font-bold text-white font-mono mt-0.5 truncate">
            {nextAvailableDate} · {nextAvailableTime}
          </div>
        </div>
      </div>

      {/* Actions */}
      {primaryAction ? (
        primaryAction
      ) : onViewSchedule ? (
        <Button variant="secondary" size="sm" onClick={onViewSchedule} className="gap-1.5">
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          View tomorrow's schedule
        </Button>
      ) : null}
    </div>
  );
};
