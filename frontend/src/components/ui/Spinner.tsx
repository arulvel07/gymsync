import React from 'react';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3.5 h-3.5 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-blue-500 border-t-transparent shrink-0 ${sizeClasses[size]} ${className}`}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export const PageLoader: React.FC<{ label?: string }> = ({ label = 'Loading GymSync...' }) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 p-6 text-center">
      <Spinner size="xl" />
      <p className="text-sm font-medium text-[#a1a1aa] tracking-wide animate-pulse">{label}</p>
    </div>
  );
};
