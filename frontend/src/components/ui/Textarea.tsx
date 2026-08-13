import React, { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      className = '',
      id,
      disabled,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          rows={rows}
          className={`w-full bg-[#121215] text-[#fafafa] text-sm border rounded-md p-3 transition-colors duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[#71717a] ${
            error
              ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500/20'
              : 'border-white/10 hover:border-white/20 focus:border-blue-500 focus:ring-blue-500/20'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-400 font-medium">{error}</p>
        ) : (
          helperText && <p className="text-xs text-[#71717a]">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
