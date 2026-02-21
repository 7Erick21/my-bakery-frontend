'use client';

import type { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';

interface OptionCardProps extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  selected?: boolean;
}

export const OptionCard: FC<OptionCardProps> = ({
  selected = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      type='button'
      className={`w-full text-left p-4 rounded-xl border-2 text-sm cursor-pointer transition-all ${
        selected
          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 shadow-sm'
          : 'border-border-card-children-light dark:border-border-card-children-dark hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

OptionCard.displayName = 'OptionCard';
