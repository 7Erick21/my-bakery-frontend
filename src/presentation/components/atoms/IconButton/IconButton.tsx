'use client';

import type { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'accent' | 'info' | 'danger';
  'aria-label': string;
}

const sizes = {
  sm: 'w-7 h-7',
  md: 'w-8 h-8',
  lg: 'w-10 h-10'
};

const variants = {
  ghost:
    'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
  accent:
    'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-300',
  info: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300',
  danger:
    'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-300'
};

export const IconButton: FC<IconButtonProps> = ({
  size = 'md',
  variant = 'ghost',
  className = '',
  children,
  disabled = false,
  ...props
}) => {
  return (
    <button
      type='button'
      className={`inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

IconButton.displayName = 'IconButton';
