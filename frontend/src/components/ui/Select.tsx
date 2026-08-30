import React, { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      children,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `select-${generatedId}`);
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText && !error ? `${selectId}-helper` : undefined;
    const describedBy = [errorId, helperId, props['aria-describedby']].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-zinc-300"
          >
            {label}
            {props.required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            aria-required={props.required}
            className={`w-full appearance-none bg-[#121215] text-[#fafafa] text-base sm:text-sm border rounded-lg py-2 pl-3.5 pr-9 transition-colors duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20'
                : 'border-white/10 hover:border-white/20 focus:border-blue-500 focus:ring-blue-500/20'
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="bg-[#121215] text-[#fafafa]"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown
            className="absolute right-3 w-4 h-4 text-[#71717a] pointer-events-none"
            aria-hidden="true"
          />
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

Select.displayName = 'Select';
