import React from 'react';
import { Calendar } from 'lucide-react';
import { Input, InputProps } from './Input';

export interface DateInputProps extends Omit<InputProps, 'startIcon'> {}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ type = 'date', className = '', ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type={type}
        startIcon={<Calendar className="w-4 h-4" />}
        className={className}
        {...props}
      />
    );
  }
);

DateInput.displayName = 'DateInput';
