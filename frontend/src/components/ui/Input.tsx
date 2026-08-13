import React, { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      startIcon,
      endIcon,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3 text-[#71717a] pointer-events-none flex items-center justify-center">
              {startIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={`w-full bg-[#121215] text-[#fafafa] text-sm border rounded-md py-2 transition-colors duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[#71717a] ${
              startIcon ? 'pl-9' : 'pl-3.5'
            } ${endIcon ? 'pr-9' : 'pr-3.5'} ${
              error
                ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20'
                : 'border-white/10 hover:border-white/20 focus:border-blue-500 focus:ring-blue-500/20'
            } ${className}`}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 text-[#71717a] flex items-center justify-center">
              {endIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-400 font-medium">{error}</p>
        ) : (
          helperText && <p className="text-xs text-[#71717a]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
