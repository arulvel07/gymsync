import React from 'react';
import { StatusIndicator, StatusType } from './StatusIndicator';
import { Badge } from './Badge';

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  pulse?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  pulse,
  className = '',
}) => {
  const badgeVariantMap: Record<StatusType, 'green' | 'amber' | 'red' | 'blue' | 'neutral'> = {
    open: 'green',
    active: 'green',
    success: 'green',
    low: 'green',

    moderate: 'amber',
    warning: 'amber',

    closed: 'red',
    full: 'red',
    expired: 'red',
    danger: 'red',
    high: 'red',

    info: 'blue',
    neutral: 'neutral',
  };

  const defaultLabelMap: Record<StatusType, string> = {
    open: 'OPEN',
    closed: 'CLOSED',
    full: 'FULL',
    active: 'ACTIVE',
    expired: 'EXPIRED',
    high: 'HIGH TRAFFIC',
    moderate: 'MODERATE TRAFFIC',
    low: 'LIGHT TRAFFIC',
    success: 'SUCCESS',
    warning: 'WARNING',
    danger: 'ERROR',
    info: 'INFO',
    neutral: 'OFFLINE',
  };

  const textLabel = label || defaultLabelMap[status];
  const variant = badgeVariantMap[status] || 'neutral';
  const shouldPulse = pulse !== undefined ? pulse : status === 'open' || status === 'active';

  return (
    <Badge
      variant={variant}
      icon={<StatusIndicator status={status} pulse={shouldPulse} size="sm" />}
      className={`font-semibold tracking-wider ${className}`}
    >
      {textLabel}
    </Badge>
  );
};
