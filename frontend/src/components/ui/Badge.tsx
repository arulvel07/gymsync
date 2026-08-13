import React, { HTMLAttributes, ReactNode } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'neutral';
  icon?: ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'green',
  icon,
  className = '',
  ...props
}) => {
  const variantClasses = {
    green: 'badge-green',
    amber: 'badge-amber',
    red: 'badge-red',
    blue: 'badge-blue',
    neutral: 'bg-white/5 text-[#a1a1aa] border border-white/10',
  };

  return (
    <span className={`badge ${variantClasses[variant]} ${className}`} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
