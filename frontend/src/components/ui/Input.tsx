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
    const generatedId = React.useId();
    const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `input-${generatedId}`);
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId, props['aria-describedby']].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-zinc-300"
          >
            {label}
            {props.required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div
              className="absolute left-3 text-[#71717a] pointer-events-none flex items-center justify-center"
              aria-hidden="true"
            >
              {startIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            aria-required={props.required}
            className={`w-full bg-[#121215] text-[#fafafa] text-base sm:text-sm border rounded-lg py-2 transition-colors duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[#71717a] ${
              startIcon ? 'pl-9' : 'pl-3.5'
            } ${endIcon ? 'pr-9' : 'pr-3.5'} ${
              error
                ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20'
                : 'border-white/10 hover:border-white/20 focus:border-blue-500 focus:ring-blue-500/20'
            } ${className}`}
            {...props}
          />
          {endIcon && (
            <div
              className="absolute right-3 text-[#71717a] flex items-center justify-center"
              aria-hidden="true"
            >
              {endIcon}
            </div>
          )}
        </div>
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-red-400 font-medium">
            {error}
          </p>
        ) : (
          helperText && (
            <p id={helperId} className="text-xs text-[#71717a]">
              {helperText}
            </p>
          )
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
