import React from 'react';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export const PageLoadingFallback: React.FC = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in"
    >
      <span className="sr-only">Loading page content...</span>

      {/* Top Header Skeleton */}
      <div className="space-y-2">
        <Skeleton height="14px" width="120px" rounded="rounded-md" />
        <Skeleton height="32px" width="260px" rounded="rounded-lg" />
        <Skeleton height="16px" width="380px" rounded="rounded-md" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};
