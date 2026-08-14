import React from 'react';
import { Link } from 'react-router-dom';

interface BrandProps {
  variant?: 'student' | 'admin' | 'public';
  className?: string;
}

export const Brand: React.FC<BrandProps> = ({ variant = 'student', className = '' }) => {
  const targetPath = variant === 'admin' ? '/admin' : variant === 'student' ? '/dashboard' : '/';

  return (
    <Link
      to={targetPath}
      aria-label={variant === 'admin' ? 'GymSync Admin Command Center' : 'GymSync Student Portal'}
      className={`flex items-center gap-2.5 text-[#fafafa] font-bold text-[0.95rem] tracking-tight no-underline hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded ${className}`}
    >
      <div
        className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0"
        aria-hidden="true"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="2" y="11" width="20" height="2" rx="1" fill="currentColor"/>
          <rect x="4" y="6" width="3" height="12" rx="1" fill="currentColor"/>
          <rect x="17" y="6" width="3" height="12" rx="1" fill="currentColor"/>
          <circle cx="2" cy="7" r="1.5" fill="currentColor"/>
          <circle cx="22" cy="7" r="1.5" fill="currentColor"/>
          <circle cx="2" cy="17" r="1.5" fill="currentColor"/>
          <circle cx="22" cy="17" r="1.5" fill="currentColor"/>
        </svg>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-extrabold text-[#fafafa]">GymSync</span>
        {variant === 'admin' && (
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
            Admin
          </span>
        )}
      </div>
    </Link>
  );
};
