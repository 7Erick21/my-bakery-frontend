import { DashboardCard, Skeleton } from '@/components/atoms';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <DashboardCard noPadding className='overflow-hidden'>
      <div className='bg-amber-50/40 dark:bg-amber-950/20 border-b border-border-card-children-light dark:border-border-card-children-dark px-4 py-3 flex gap-4'>
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} variant='text' className='h-4 flex-1' />
        ))}
      </div>
      {Array.from({ length: rows }, (_, rowIdx) => (
        <div
          key={rowIdx}
          className='px-4 py-3 flex gap-4 border-b border-border-card-children-light/60 dark:border-border-card-children-dark/60'
        >
          {Array.from({ length: columns }, (_, colIdx) => (
            <Skeleton
              key={colIdx}
              variant='text'
              className={`h-4 flex-1 ${colIdx === 0 ? 'max-w-[60%]' : ''}`}
            />
          ))}
        </div>
      ))}
    </DashboardCard>
  );
}
