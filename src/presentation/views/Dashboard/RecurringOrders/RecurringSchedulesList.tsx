'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { type FC, useState } from 'react';

import { Button, StatusBadge } from '@/components/atoms';
import type { RecurringScheduleWithItems } from '@/lib/supabase/models';
import { formatDate } from '@/lib/utils/format';
import { toggleRecurringSchedule } from '@/server/actions/recurring';
import { DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/shared/constants/checkout';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { DataTable } from '../shared/DataTable';
import { PageHeader } from '../shared/PageHeader';

interface RecurringSchedulesListProps {
  schedules: RecurringScheduleWithItems[];
}

export const RecurringSchedulesListAdmin: FC<RecurringSchedulesListProps> = ({ schedules }) => {
  const { t } = useTranslation();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const lang = 'es';

  async function handleToggle(id: string, isActive: boolean) {
    setTogglingId(id);
    try {
      await toggleRecurringSchedule(id, isActive);
    } catch (err) {
      console.error(err);
    }
    setTogglingId(null);
  }

  const columns = [
    {
      key: 'business',
      header: 'Empresa',
      render: (s: RecurringScheduleWithItems) => (
        <div>
          <span className='font-medium text-gray-900 dark:text-gray-100'>{s.business_name}</span>
          {s.contact_name && <p className='text-xs text-gray-500'>{s.contact_name}</p>}
        </div>
      )
    },
    {
      key: 'client',
      header: 'Cliente',
      render: (s: RecurringScheduleWithItems) => s.profiles?.full_name || s.profiles?.email || '—'
    },
    {
      key: 'delivery',
      header: 'Entrega',
      render: (s: RecurringScheduleWithItems) => (
        <span className='text-xs'>
          {DELIVERY_TYPE_LABELS[s.delivery_type]?.[lang] || s.delivery_type}
        </span>
      )
    },
    {
      key: 'payment',
      header: 'Pago',
      render: (s: RecurringScheduleWithItems) => (
        <span className='text-xs'>
          {PAYMENT_METHOD_LABELS[s.payment_method]?.[lang] || s.payment_method}
        </span>
      )
    },
    {
      key: 'items',
      header: 'Items',
      render: (s: RecurringScheduleWithItems) => (
        <span className='text-sm'>{s.recurring_order_items.length}</span>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: (s: RecurringScheduleWithItems) => (
        <button
          type='button'
          onClick={() => handleToggle(s.id, !s.is_active)}
          disabled={togglingId === s.id}
          className='cursor-pointer disabled:opacity-50'
        >
          <StatusBadge variant={s.is_active ? 'green' : 'gray'}>
            {s.is_active ? 'Activo' : 'Inactivo'}
          </StatusBadge>
        </button>
      )
    },
    {
      key: 'created',
      header: 'Creado',
      render: (s: RecurringScheduleWithItems) => (
        <span className='text-xs'>{formatDate(s.created_at)}</span>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (s: RecurringScheduleWithItems) => (
        <Link
          href={`/dashboard/recurring/${s.id}` as Route}
          className='text-amber-600 hover:text-amber-700 text-xs font-medium'
        >
          Ver
        </Link>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title={t('dashboard.nav.recurring', 'Pedidos recurrentes')}
        action={
          <Link href={'/dashboard/recurring/new' as Route}>
            <Button variant='primary' className='cursor-pointer'>
              + Nuevo
            </Button>
          </Link>
        }
      />
      <DataTable columns={columns} data={schedules} emptyMessage='No hay pedidos recurrentes' />
    </div>
  );
};

RecurringSchedulesListAdmin.displayName = 'RecurringSchedulesListAdmin';
