import React from 'react';

export type StatusType =
  | 'open'
  | 'closed'
  | 'full'
  | 'active'
  | 'expired'
  | 'high'
  | 'moderate'
  | 'low'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export interface StatusIndicatorProps {
  status: StatusType;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  pulse = false,
  size = 'md',
  className = '',
}) => {
  const colorMap: Record<StatusType, string> = {
    open: 'bg-emerald-500',
    active: 'bg-emerald-500',
    success: 'bg-emerald-500',
    low: 'bg-emerald-500',

    warning: 'bg-amber-500',
    moderate: 'bg-amber-500',

    closed: 'bg-red-500',
    full: 'bg-red-500',
    expired: 'bg-red-500',
    danger: 'bg-red-500',
    high: 'bg-red-500',

    info: 'bg-blue-500',
    neutral: 'bg-zinc-500',
  };

  const sizeMap = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const dotColor = colorMap[status] || 'bg-zinc-500';
  const sizeClass = sizeMap[size];

  return (
    <span className={`relative inline-flex items-center justify-center ${className}`}>
      {pulse && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${dotColor}`}
        />
      )}
      <span className={`relative inline-flex rounded-full ${sizeClass} ${dotColor}`} />
    </span>
  );
};
