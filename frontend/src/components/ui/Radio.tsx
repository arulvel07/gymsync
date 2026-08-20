import React, { InputHTMLAttributes } from 'react';

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, checked, disabled, className = '', id, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const radioId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `radio-${generatedId}`);
    const descId = description ? `${radioId}-desc` : undefined;

    return (
      <div className={`flex items-start gap-3 select-none ${className}`}>
        <div className="relative flex items-center pt-0.5">
          <input
            id={radioId}
            ref={ref}
            type="radio"
            checked={checked}
            disabled={disabled}
            onChange={onChange}
            aria-describedby={descId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`w-4 h-4 rounded-full border transition-colors flex items-center justify-center cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#09090b] peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${
              checked
                ? 'border-blue-500 bg-blue-600/10'
                : 'bg-[#121215] border-white/20 hover:border-white/40'
            }`}
            onClick={(e) => {
              if (disabled) return;
              e.preventDefault();
              const syntheticEvent = {
                target: { checked: true },
              } as React.ChangeEvent<HTMLInputElement>;
              onChange?.(syntheticEvent);
            }}
            aria-hidden="true"
          >
            {checked && <div className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />}
          </div>
        </div>
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <label
                htmlFor={radioId}
                className={`text-sm font-medium cursor-pointer ${
                  disabled ? 'opacity-50 cursor-not-allowed' : 'text-[#fafafa]'
                }`}
              >
                {label}
              </label>
            )}
            {description && (
              <p id={descId} className="text-xs text-[#71717a]">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
