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
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={`w-full appearance-none bg-[#121215] text-[#fafafa] text-sm border rounded-md py-2 pl-3.5 pr-9 transition-colors duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
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
          <ChevronDown className="absolute right-3 w-4 h-4 text-[#71717a] pointer-events-none" />
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

Select.displayName = 'Select';
