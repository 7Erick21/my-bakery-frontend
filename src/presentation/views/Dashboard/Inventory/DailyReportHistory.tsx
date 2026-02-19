'use client';

import type { FC } from 'react';

import type { DailyReportWithItems } from '@/lib/supabase/models';
import { DataTable } from '../shared/DataTable';
import { PageHeader } from '../shared/PageHeader';

interface DailyReportHistoryProps {
  reports: DailyReportWithItems[];
}

export const DailyReportHistory: FC<DailyReportHistoryProps> = ({ reports }) => {
  const columns = [
    {
      key: 'date',
      header: 'Fecha',
      render: (item: DailyReportWithItems) => (
        <span className='font-medium text-gray-900 dark:text-gray-100'>{item.report_date}</span>
      )
    },
    {
      key: 'created_by',
      header: 'Creado por',
      render: (item: DailyReportWithItems) => (
        <span className='text-gray-600 dark:text-gray-400'>
          {item.profiles?.full_name ?? 'Desconocido'}
        </span>
      )
    },
    {
      key: 'items_count',
      header: 'Productos',
      render: (item: DailyReportWithItems) => (
        <span>{item.daily_inventory_report_items.length}</span>
      )
    },
    {
      key: 'notes',
      header: 'Notas',
      render: (item: DailyReportWithItems) => (
        <span className='text-gray-500 dark:text-gray-400 truncate max-w-48 inline-block'>
          {item.notes || '-'}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (item: DailyReportWithItems) => (
        <a
          href={`/dashboard/inventory/daily-report?date=${item.report_date}`}
          className='text-amber-600 hover:text-amber-700 text-xs font-medium'
        >
          Ver detalle
        </a>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title='Historial de informes diarios'
        action={
          <a
            href='/dashboard/inventory/daily-report'
            className='text-amber-600 hover:text-amber-700 text-14-16 font-medium'
          >
            Informe de hoy
          </a>
        }
      />
      <DataTable
        columns={columns}
        data={reports}
        emptyMessage='No hay informes diarios registrados'
      />
    </div>
  );
};

DailyReportHistory.displayName = 'DailyReportHistory';
