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

export const WORKOUT_ICONS: Record<string, string> = {
  Push: '💪',
  Pull: '🏋️',
  Legs: '🦵',
  'Upper Body': '🔝',
  'Lower Body': '⬇️',
  Cardio: '🏃',
  'Full Body': '⚡',
  Core: '🎯',
  Shoulders: '🏋️',
  Others: '✏️',
};

export function getWorkoutColor(type: string): string {
  return WORKOUT_COLORS[type] || '#94a3b8';
}

export function getWorkoutIcon(type: string): string {
  return WORKOUT_ICONS[type] || '🏋️';
}

export const MAX_SESSION_MINUTES = 120;
