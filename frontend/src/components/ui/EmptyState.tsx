import React, { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'There is no data to display right now.',
  icon,
  primaryAction,
  secondaryAction,
  className = '',
}) => {
  return (
    <div className={`p-8 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}>
      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#71717a]">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h4 className="text-base font-semibold text-[#fafafa] mb-1 tracking-tight">{title}</h4>
      {description && <p className="text-xs text-[#a1a1aa] leading-relaxed mb-5">{description}</p>}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};
