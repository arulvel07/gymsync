import React, { HTMLAttributes } from 'react';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  height?: string;
  width?: string;
  rounded?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height,
  width,
  rounded = 'rounded-md',
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      className={`animate-pulse bg-white/5 ${rounded} ${className}`}
      style={{ height, width, ...style }}
      {...props}
    />
  );
};

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="14px"
          width={i === lines - 1 && lines > 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`glass-card p-6 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton height="16px" width="40%" />
        <Skeleton height="20px" width="60px" rounded="rounded-full" />
      </div>
      <Skeleton height="36px" width="50%" />
      <SkeletonText lines={2} />
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className = '',
}) => {
  return (
    <div className={`w-full border border-white/10 rounded-md overflow-hidden ${className}`}>
      <div className="bg-[#121215] p-3 flex gap-4 border-b border-white/10">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height="16px" className="flex-1" />
        ))}
      </div>
      <div className="divide-y divide-white/5 bg-[#09090b]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-3.5 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} height="14px" className="flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
