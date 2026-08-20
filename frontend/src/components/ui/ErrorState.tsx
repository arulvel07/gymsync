import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  variant?: 'inline' | 'section' | 'page';
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  variant = 'section',
  title = "Unable to load activity",
  message = "Your data is safe. We just couldn't reach the gym server.",
  onRetry,
  className = '',
}) => {
  if (variant === 'inline') {
    return (
      <div
        className={`p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center justify-between gap-3 ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-red-400 hover:text-red-200 underline font-medium cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`text-center p-8 max-w-md mx-auto ${
        variant === 'page' ? 'min-h-[50vh] flex flex-col items-center justify-center' : 'glass-card my-4'
      } ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div
        className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400"
        aria-hidden="true"
      >
        <AlertCircle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h4 className="text-sm font-semibold text-red-400 tracking-tight mb-1.5">{title}</h4>
      <p className="text-xs text-[#a1a1aa] leading-relaxed mb-5">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" iconLeft={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
};

