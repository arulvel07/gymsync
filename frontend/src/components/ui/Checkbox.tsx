import React, { InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, checked, disabled, className = '', id, onChange, ...props }, ref) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex items-start gap-3 select-none">
        <div className="relative flex items-center pt-0.5">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`w-4 h-4 rounded border transition-colors flex items-center justify-center cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${
              checked
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-[#121215] border-white/20 hover:border-white/40'
            } ${error ? 'border-red-500' : ''}`}
            onClick={(e) => {
              if (disabled) return;
              e.preventDefault();
              const syntheticEvent = {
                target: { checked: !checked },
              } as React.ChangeEvent<HTMLInputElement>;
              onChange?.(syntheticEvent);
            }}
          >
            {checked && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        </div>
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <label
                htmlFor={checkboxId}
                className={`text-sm font-medium cursor-pointer ${
                  disabled ? 'opacity-50 cursor-not-allowed' : 'text-[#fafafa]'
                }`}
              >
                {label}
              </label>
            )}
            {description && <p className="text-xs text-[#71717a]">{description}</p>}
            {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
