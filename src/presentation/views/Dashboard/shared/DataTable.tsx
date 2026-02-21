'use client';

import type { ReactNode } from 'react';

import { DashboardCard } from '@/components/atoms';
import { EmptyState } from '@/components/molecules';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  rowClassName?: (item: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = 'No hay datos',
  emptyIcon,
  keyExtractor,
  rowClassName
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={
          emptyIcon || (
            <svg
              className='w-12 h-12'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1}
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z'
              />
            </svg>
          )
        }
        title={emptyMessage}
      />
    );
  }

  return (
    <DashboardCard noPadding className='overflow-x-auto'>
      <table className='w-full text-16-20'>
        <thead>
          <tr className='bg-amber-50/40 dark:bg-amber-950/20 border-b border-border-card-children-light dark:border-border-card-children-dark'>
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-4 py-3 font-medium text-gray-600 dark:text-gray-400 ${col.key === 'actions' ? 'text-center' : 'text-left'} ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const rec = item as Record<string, unknown>;
            const key = keyExtractor
              ? keyExtractor(item, index)
              : ((rec.id as string) ?? (rec.code as string));
            const extraClass = rowClassName ? rowClassName(item) : '';

            return (
              <tr
                key={key}
                className={`border-b border-border-card-children-light/60 dark:border-border-card-children-dark/60 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors ${extraClass}`}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.key === 'actions' ? 'text-center' : ''} ${col.className || ''}`}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </DashboardCard>
  );
}
