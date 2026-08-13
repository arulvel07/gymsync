import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className = '',
}) => {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex items-center justify-between gap-4 select-none ${className}`}>
      {(label || description) && (
        <div className="space-y-0.5">
          {label && (
            <label
              htmlFor={toggleId}
              className={`text-sm font-medium cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'text-[#fafafa]'
              }`}
            >
              {label}
            </label>
          )}
          {description && <p className="text-xs text-[#71717a]">{description}</p>}
        </div>
      )}
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? 'bg-blue-600' : 'bg-[#1f1f24] hover:bg-[#282830]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
