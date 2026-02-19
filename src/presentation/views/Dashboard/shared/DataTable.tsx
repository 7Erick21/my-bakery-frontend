'use client';

import type { ReactNode } from 'react';

import { DashboardCard } from '@/components/atoms';

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
  keyExtractor?: (item: T, index: number) => string;
  rowClassName?: (item: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = 'No hay datos',
  keyExtractor,
  rowClassName
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <div className='text-center py-12 text-gray-500 dark:text-gray-400'>{emptyMessage}</div>;
  }

  return (
    <DashboardCard noPadding className='overflow-x-auto'>
      <table className='w-full text-14-16'>
        <thead>
          <tr className='bg-amber-50/40 dark:bg-amber-950/20 border-b border-border-card-children-light dark:border-border-card-children-dark'>
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 ${col.className || ''}`}
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
                  <td key={col.key} className={`px-4 py-3 ${col.className || ''}`}>
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
