import React from 'react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Sparkles, Dumbbell } from 'lucide-react';

interface DashboardGreetingProps {
  fullName?: string;
  isOpen: boolean;
  activeSession?: boolean;
}

export const DashboardGreeting: React.FC<DashboardGreetingProps> = ({
  fullName,
  isOpen,
  activeSession,
}) => {
  // Determine time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = fullName ? fullName.split(' ')[0] : 'Student';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-[#27272a]">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            {getGreeting()}, {firstName}
          </h1>
          {activeSession && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Dumbbell className="w-3 h-3" /> Training active
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          IIITDM Campus Gym · Live availability & workout tracking
        </p>
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge
          status={isOpen ? 'open' : 'closed'}
          label={isOpen ? 'Gym Open' : 'Gym Closed'}
        />
      </div>
    </div>
  );
};
