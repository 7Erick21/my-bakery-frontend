import type { FC, PropsWithChildren } from 'react';

interface StatusBadgeProps extends PropsWithChildren {
  variant: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray';
  className?: string;
}

const variantStyles: Record<StatusBadgeProps['variant'], string> = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
};

export const StatusBadge: FC<StatusBadgeProps> = ({ variant, className = '', children }) => {
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-14-16 font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

StatusBadge.displayName = 'StatusBadge';
