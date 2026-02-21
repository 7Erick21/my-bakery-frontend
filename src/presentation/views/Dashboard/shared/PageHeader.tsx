'use client';

import type { FC, ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
  subtitle?: string;
}

export const PageHeader: FC<PageHeaderProps> = ({ title, action, subtitle }) => {
  return (
    <div className='flex items-center justify-between mb-6'>
      <div>
        <h1 className='text-32-48 font-bold text-gray-900 dark:text-gray-100'>{title}</h1>
        {subtitle && <p className='text-16-20 text-gray-500'>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
};

PageHeader.displayName = 'PageHeader';
