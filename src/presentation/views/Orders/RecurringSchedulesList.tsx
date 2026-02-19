'use client';

import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import type { RecurringScheduleWithItems } from '@/lib/supabase/models';
import { Layout } from '@/presentation/layout/Layout';
import { DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/shared/constants/checkout';
import { useTranslation } from '@/shared/hooks/useTranslate';

interface RecurringSchedulesListProps {
  schedules: RecurringScheduleWithItems[];
}

export const RecurringSchedulesList: FC<RecurringSchedulesListProps> = ({ schedules }) => {
  const { t } = useTranslation();
  const lang = 'es';

  return (
    <Layout>
      <section className='min-h-dvh pt-24 pb-16'>
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-32-48 font-bold text-gray-900 dark:text-gray-100'>
            {t('recurring.title', 'Pedidos recurrentes')}
          </h1>
          <Link
            href={'/orders/recurring/new' as Route}
            className='px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg'
          >
            {t('recurring.new', 'Nuevo')}
          </Link>
        </div>

        {schedules.length === 0 ? (
          <p className='text-center text-gray-500 dark:text-gray-400 py-12'>
            {t('recurring.empty', 'No tienes pedidos recurrentes configurados')}
          </p>
        ) : (
          <div className='space-y-4'>
            {schedules.map(schedule => (
              <Link
                key={schedule.id}
                href={`/orders/recurring/${schedule.id}` as Route}
                className='block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:border-amber-300 dark:hover:border-amber-700 transition-colors'
              >
                <div className='flex items-center justify-between mb-2'>
                  <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                    {schedule.business_name}
                  </h2>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      schedule.is_active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {schedule.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className='flex items-center gap-4 text-sm text-gray-500'>
                  {schedule.contact_name && <span>{schedule.contact_name}</span>}
                  <span>
                    {DELIVERY_TYPE_LABELS[schedule.delivery_type]?.[lang] || schedule.delivery_type}
                  </span>
                  <span>
                    {PAYMENT_METHOD_LABELS[schedule.payment_method]?.[lang] ||
                      schedule.payment_method}
                  </span>
                  <span>{schedule.recurring_order_items.length} items</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

RecurringSchedulesList.displayName = 'RecurringSchedulesList';
