'use client';

import type { FC, ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState: FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
      {icon && <div className='text-gray-300 dark:text-gray-600 mb-4'>{icon}</div>}
      <h3 className='text-lg font-medium text-gray-700 dark:text-gray-300 mb-1'>{title}</h3>
      {description && (
        <p className='text-16-20 text-gray-500 dark:text-gray-400 max-w-sm'>{description}</p>
      )}
      {action && <div className='mt-4'>{action}</div>}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
