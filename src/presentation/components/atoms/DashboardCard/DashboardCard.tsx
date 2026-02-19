import type { FC, HTMLAttributes, PropsWithChildren } from 'react';
import { Card } from '../Card';

interface DashboardCardProps extends HTMLAttributes<HTMLDivElement>, PropsWithChildren {
  title?: string;
  noPadding?: boolean;
}

export const DashboardCard: FC<DashboardCardProps> = ({
  title,
  noPadding,
  className = '',
  children,
  ...props
}) => {
  return (
    <Card
      variant='children'
      className={`rounded-xl backdrop-blur-sm border border-border-card-children-light dark:border-border-card-children-dark shadow-[--shadow-dashboard-card-light] dark:shadow-[--shadow-dashboard-card-dark] ${noPadding ? '' : 'p-6'} ${className}`}
      {...props}
    >
      {title && (
        <h2 className='text-18-24 font-semibold text-gray-900 dark:text-gray-100 mb-4'>{title}</h2>
      )}
      {children}
    </Card>
  );
};

DashboardCard.displayName = 'DashboardCard';
