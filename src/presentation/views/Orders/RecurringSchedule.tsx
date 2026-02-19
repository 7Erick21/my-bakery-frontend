'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { type FC, useState } from 'react';

import type { ProductListItem, RecurringScheduleWithItems } from '@/lib/supabase/models';
import { formatPrice } from '@/lib/utils/format';
import { Layout } from '@/presentation/layout/Layout';
import {
  deleteRecurringItem,
  toggleRecurringItem,
  toggleRecurringSchedule,
  upsertRecurringItem
} from '@/server/actions/recurring';
import { useTranslation } from '@/shared/hooks/useTranslate';

const DAY_NAMES = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

interface RecurringScheduleProps {
  schedule: RecurringScheduleWithItems;
  products: ProductListItem[];
}

export const RecurringSchedule: FC<RecurringScheduleProps> = ({ schedule, products }) => {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [addDay, setAddDay] = useState(1);
  const [addProductId, setAddProductId] = useState('');
  const [addQty, setAddQty] = useState(1);

  // Build grid: day_of_week (1-7) → items
  const itemsByDay = new Map<number, typeof schedule.recurring_order_items>();
  for (let d = 1; d <= 7; d++) {
    itemsByDay.set(d, []);
  }
  for (const item of schedule.recurring_order_items) {
    const arr = itemsByDay.get(item.day_of_week);
    if (arr) arr.push(item);
  }

  async function handleAddItem() {
    if (!addProductId) return;
    setBusy(true);
    try {
      await upsertRecurringItem(schedule.id, addProductId, addDay, addQty);
    } catch (err) {
      console.error(err);
    }
    setBusy(false);
  }

  async function handleDeleteItem(itemId: string) {
    setBusy(true);
    try {
      await deleteRecurringItem(itemId);
    } catch (err) {
      console.error(err);
    }
    setBusy(false);
  }

  async function handleToggleItem(itemId: string, active: boolean) {
    setBusy(true);
    try {
      await toggleRecurringItem(itemId, active);
    } catch (err) {
      console.error(err);
    }
    setBusy(false);
  }

  async function handleToggleSchedule(active: boolean) {
    setBusy(true);
    try {
      await toggleRecurringSchedule(schedule.id, active);
    } catch (err) {
      console.error(err);
    }
    setBusy(false);
  }

  const getProductName = (item: (typeof schedule.recurring_order_items)[0]) =>
    item.products?.product_translations?.[0]?.name || 'Producto';

  return (
    <Layout>
      <section className='min-h-dvh pt-24 pb-16'>
        <div className='max-w-4xl mx-auto'>
          <Link
            href={'/orders/recurring' as Route}
            className='text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 mb-4 inline-block text-sm'
          >
            ← {t('recurring.backToList', 'Volver a pedidos recurrentes')}
          </Link>

          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-24-32 font-bold text-gray-900 dark:text-gray-100'>
                {schedule.business_name}
              </h1>
              {schedule.contact_name && (
                <p className='text-gray-500 text-sm'>
                  {schedule.contact_name}
                  {schedule.contact_phone && ` · ${schedule.contact_phone}`}
                </p>
              )}
            </div>
            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={() => handleToggleSchedule(!schedule.is_active)}
                disabled={busy}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium cursor-pointer disabled:opacity-50 ${
                  schedule.is_active
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {schedule.is_active
                  ? t('recurring.active', 'Activo')
                  : t('recurring.inactive', 'Inactivo')}
              </button>
              <Link
                href={`/orders/recurring/${schedule.id}?edit=true` as Route}
                className='px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              >
                {t('common.edit', 'Editar')}
              </Link>
            </div>
          </div>

          {/* Add item form */}
          <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6'>
            <h2 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3'>
              {t('recurring.addProduct', 'Anadir producto')}
            </h2>
            <div className='flex flex-wrap gap-3 items-end'>
              <div className='flex-1 min-w-[200px]'>
                <label htmlFor='add-product' className='block text-xs text-gray-500 mb-1'>
                  Producto
                </label>
                <select
                  id='add-product'
                  value={addProductId}
                  onChange={e => setAddProductId(e.target.value)}
                  className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm'
                >
                  <option value=''>Seleccionar...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.product_translations?.[0]?.name || p.slug} — {formatPrice(p.price)}
                    </option>
                  ))}
                </select>
              </div>
              <div className='w-24'>
                <label htmlFor='add-day' className='block text-xs text-gray-500 mb-1'>
                  Dia
                </label>
                <select
                  id='add-day'
                  value={addDay}
                  onChange={e => setAddDay(Number(e.target.value))}
                  className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm'
                >
                  {DAY_NAMES.map((name, i) => (
                    <option key={name} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className='w-20'>
                <label htmlFor='add-qty' className='block text-xs text-gray-500 mb-1'>
                  Cant.
                </label>
                <input
                  id='add-qty'
                  type='number'
                  min={1}
                  value={addQty}
                  onChange={e => setAddQty(Math.max(1, Number(e.target.value)))}
                  className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm'
                />
              </div>
              <button
                type='button'
                onClick={handleAddItem}
                disabled={busy || !addProductId}
                className='px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg cursor-pointer disabled:opacity-50'
              >
                {t('common.add', 'Anadir')}
              </button>
            </div>
          </div>

          {/* Weekly grid */}
          <div className='grid grid-cols-1 md:grid-cols-7 gap-3'>
            {DAY_NAMES.map((dayName, i) => {
              const dayNum = i + 1;
              const dayItems = itemsByDay.get(dayNum) || [];

              return (
                <div
                  key={dayName}
                  className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3'
                >
                  <h3 className='text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 text-center'>
                    {dayName}
                  </h3>
                  {dayItems.length === 0 ? (
                    <p className='text-xs text-gray-400 text-center py-2'>—</p>
                  ) : (
                    <div className='space-y-2'>
                      {dayItems.map(item => (
                        <div
                          key={item.id}
                          className={`text-xs p-2 rounded-lg ${
                            item.is_active
                              ? 'bg-amber-50 dark:bg-amber-900/20'
                              : 'bg-gray-100 dark:bg-gray-800 opacity-50'
                          }`}
                        >
                          <div className='font-medium text-gray-900 dark:text-gray-100 truncate'>
                            {getProductName(item)}
                          </div>
                          <div className='flex items-center justify-between mt-1'>
                            <span className='text-gray-500'>x{item.quantity}</span>
                            <div className='flex gap-1'>
                              <button
                                type='button'
                                onClick={() => handleToggleItem(item.id, !item.is_active)}
                                disabled={busy}
                                className='text-gray-400 hover:text-amber-500 cursor-pointer disabled:opacity-50'
                                title={item.is_active ? 'Desactivar' : 'Activar'}
                              >
                                {item.is_active ? '⏸' : '▶'}
                              </button>
                              <button
                                type='button'
                                onClick={() => handleDeleteItem(item.id)}
                                disabled={busy}
                                className='text-gray-400 hover:text-red-500 cursor-pointer disabled:opacity-50'
                                title='Eliminar'
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {schedule.notes && (
            <div className='mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg'>
              <span className='text-xs text-gray-500'>Notas:</span>
              <p className='text-sm text-gray-700 dark:text-gray-300'>{schedule.notes}</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

RecurringSchedule.displayName = 'RecurringSchedule';
