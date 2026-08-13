import React from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-white/10 ${className}`}
    >
      <div>
        {eyebrow && (
          <div className="text-[0.68rem] uppercase font-bold tracking-widest text-blue-400 mb-1">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#fafafa] tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">{actions}</div>}
    </div>
  );
};
