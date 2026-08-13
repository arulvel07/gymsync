import React from 'react';
import { Search, X } from 'lucide-react';
import { Input, InputProps } from './Input';

export interface SearchInputProps extends Omit<InputProps, 'startIcon' | 'endIcon'> {
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder = 'Search...', className = '', ...props }, ref) => {
    const hasValue = Boolean(value);

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        startIcon={<Search className="w-4 h-4" />}
        endIcon={
          hasValue && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="p-0.5 rounded text-[#71717a] hover:text-[#fafafa] hover:bg-white/10 focus:outline-none transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : undefined
        }
        className={className}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
