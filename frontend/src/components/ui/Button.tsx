import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  iconLeft,
  iconRight,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none';

  const variantClasses = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 border border-blue-500/30 shadow-sm',
    secondary:
      'bg-[#121215] text-[#fafafa] hover:bg-[#18181c] active:bg-[#1f1f24] border border-white/10 shadow-sm',
    ghost:
      'bg-transparent text-[#a1a1aa] hover:text-[#fafafa] hover:bg-white/5 active:bg-white/10',
    danger:
      'bg-red-600/90 text-white hover:bg-red-500 active:bg-red-700 border border-red-500/30 shadow-sm',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 border border-emerald-500/30 shadow-sm',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[32px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
    lg: 'px-5 py-2.5 text-base gap-2.5 min-h-[48px]',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      ) : (
        iconLeft && <span className="flex-shrink-0">{iconLeft}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && iconRight && <span className="flex-shrink-0">{iconRight}</span>}
    </button>
  );
};
