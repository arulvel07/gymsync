import React from 'react';
import { Dumbbell, Flame, Activity, Zap, Target, Edit3, Layers, HeartPulse } from 'lucide-react';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gym-qxdu.onrender.com';
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://owrqljgboratvcmuzpkx.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cnFsamdib3JhdHZjbXV6cGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5MjMwNTYsImV4cCI6MjEwMTQ5OTA1Nn0.GgVitgmpcehOnsBzjfWe8lrI4J3bMamhBTO2-LAW1mQ';

export const WORKOUT_TYPES = [
  'Push',
  'Pull',
  'Legs',
  'Shoulders',
  'Cardio',
  'Full Body',
  'Others',
] as const;

export const WORKOUT_COLORS: Record<string, string> = {
  Push: '#3b82f6',
  Pull: '#8b5cf6',
  Legs: '#10b981',
  'Upper Body': '#06b6d4',
  'Lower Body': '#f59e0b',
  Cardio: '#ef4444',
  'Full Body': '#ec4899',
  Core: '#f97316',
  Shoulders: '#06b6d4',
  Others: '#94a3b8',
};

export function getWorkoutColor(type: string): string {
  return WORKOUT_COLORS[type] || '#94a3b8';
}

/**
 * Safe icon factory mapping workout types to small, consistent Lucide React icons.
 */
export function getWorkoutIcon(type: string, className = "w-3.5 h-3.5 inline-block"): React.ReactNode {
  switch (type) {
    case 'Push':
    case 'Pull':
      return <Dumbbell className={className} aria-hidden="true" />;
    case 'Legs':
    case 'Lower Body':
      return <Flame className={className} aria-hidden="true" />;
    case 'Upper Body':
      return <Layers className={className} aria-hidden="true" />;
    case 'Cardio':
      return <HeartPulse className={className} aria-hidden="true" />;
    case 'Full Body':
      return <Zap className={className} aria-hidden="true" />;
    case 'Core':
      return <Target className={className} aria-hidden="true" />;
    case 'Shoulders':
      return <Dumbbell className={className} aria-hidden="true" />;
    default:
      return <Edit3 className={className} aria-hidden="true" />;
  }
}

export const WORKOUT_ICONS: Record<string, React.ReactNode> = {
  Push: <Dumbbell className="w-3.5 h-3.5 inline-block" aria-hidden="true" />,
  Pull: <Dumbbell className="w-3.5 h-3.5 inline-block" aria-hidden="true" />,
  Legs: <Flame className="w-3.5 h-3.5 inline-block" aria-hidden="true" />,
  'Upper Body': <Layers className="w-3.5 h-3.5 inline-block" aria-hidden="true" />,
  'Lower Body': <Flame className="w-3.5 h-3.5 inline-block" aria-hidden="true" />,
  Cardio: <HeartPulse className="w-3.5 h-3.5 inline-block" aria-hidden="true" />,
  'Full Body': <Zap className="w-3.5 h-3.5 inline-block" aria-hidden="true" />,
  Core: <Target className="w-3.5 h-3.5 inline-block" aria-hidden="true" />,
  Shoulders: <Dumbbell className="w-3.5 h-3.5 inline-block" aria-hidden="true" />,
  Others: <Edit3 className="w-3.5 h-3.5 inline-block" aria-hidden="true" />,
};

export const MAX_SESSION_MINUTES = 120;
