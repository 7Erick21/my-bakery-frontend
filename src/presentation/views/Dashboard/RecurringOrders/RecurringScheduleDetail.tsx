'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { type FC, useState } from 'react';

import {
  Button,
  DashboardCard,
  IconButton,
  Input,
  Label,
  Select,
  StatusBadge
} from '@/components/atoms';
import { ConfirmDialog } from '@/components/molecules';
import PencilIcon from '@/icons/pencil.svg';
import TrashIcon from '@/icons/trash.svg';
import type { ProductListItem, RecurringScheduleWithItems } from '@/lib/supabase/models';
import { formatDate, formatPrice } from '@/lib/utils/format';
import {
  deleteRecurringItemAdmin,
  deleteRecurringScheduleAdmin,
  toggleRecurringItem,
  toggleRecurringSchedule,
  upsertRecurringItemAdmin
} from '@/server/actions/recurring';
import { DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/shared/constants/checkout';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { useToastStore } from '@/shared/stores/toastStore';

const DAY_NAMES = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

interface RecurringScheduleDetailProps {
  schedule: RecurringScheduleWithItems;
  products?: ProductListItem[];
}

export const RecurringScheduleDetail: FC<RecurringScheduleDetailProps> = ({
  schedule,
  products = []
}) => {
  const { t } = useTranslation();
  const addToast = useToastStore(s => s.addToast);
  const [busy, setBusy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const lang = 'es';

  // Add item form state
  const [addProductId, setAddProductId] = useState('');
  const [addDayOfWeek, setAddDayOfWeek] = useState('1');
  const [addQuantity, setAddQuantity] = useState('1');
  const [addError, setAddError] = useState<string | null>(null);

  // Inline edit state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState('');

  const itemsByDay = new Map<number, typeof schedule.recurring_order_items>();
  for (let d = 1; d <= 7; d++) {
    itemsByDay.set(d, []);
  }
  for (const item of schedule.recurring_order_items) {
    const arr = itemsByDay.get(item.day_of_week);
    if (arr) arr.push(item);
  }

  async function handleToggle(active: boolean) {
    setBusy(true);
    try {
      await toggleRecurringSchedule(schedule.id, active);
    } catch (err) {
      console.error(err);
    }
    setBusy(false);
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteRecurringScheduleAdmin(schedule.id);
      addToast({ message: 'Pedido recurrente eliminado', type: 'success' });
    } catch (err) {
      console.error(err);
      addToast({ message: 'Error al eliminar', type: 'error' });
      setBusy(false);
    }
    setShowDeleteConfirm(false);
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

  async function handleDeleteItem(itemId: string) {
    setBusy(true);
    try {
      await deleteRecurringItemAdmin(itemId);
    } catch (err) {
      console.error(err);
    }
    setBusy(false);
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!addProductId || !addQuantity) return;

    setAddError(null);
    setBusy(true);
    try {
      await upsertRecurringItemAdmin(
        schedule.id,
        addProductId,
        Number(addDayOfWeek),
        Number(addQuantity)
      );
      setAddProductId('');
      setAddQuantity('1');
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Error');
    }
    setBusy(false);
  }

  async function handleUpdateQuantity(itemId: string, productId: string, dayOfWeek: number) {
    const qty = Number(editQuantity);
    if (!qty || qty < 1) return;

    setBusy(true);
    try {
      await upsertRecurringItemAdmin(schedule.id, productId, dayOfWeek, qty);
    } catch (err) {
      console.error(err);
    }
    setEditingItemId(null);
    setBusy(false);
  }

  const getProductName = (item: (typeof schedule.recurring_order_items)[0]) =>
    item.products?.product_translations?.[0]?.name || 'Producto';

  return (
    <div>
      <Link
        href={'/dashboard/recurring' as Route}
        className='text-amber-600 hover:text-amber-700 mb-6 inline-block text-sm'
      >
        ← Volver a recurrentes
      </Link>

      <DashboardCard className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-32-48 font-bold text-gray-900 dark:text-gray-100'>
              {schedule.business_name}
            </h1>
            <p className='text-sm text-gray-500'>
              {schedule.profiles?.full_name} · {schedule.profiles?.email}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <Link href={`/dashboard/recurring/${schedule.id}/edit` as Route}>
              <IconButton aria-label='Editar' variant='accent'>
                <PencilIcon className='w-4 h-4' />
              </IconButton>
            </Link>
            <button
              type='button'
              onClick={() => handleToggle(!schedule.is_active)}
              disabled={busy}
              className='cursor-pointer disabled:opacity-50'
            >
              <StatusBadge variant={schedule.is_active ? 'green' : 'gray'}>
                {schedule.is_active ? 'Activo' : 'Inactivo'}
              </StatusBadge>
            </button>
            <IconButton
              aria-label='Eliminar'
              variant='danger'
              onClick={() => setShowDeleteConfirm(true)}
              disabled={busy}
            >
              <TrashIcon className='w-4 h-4' />
            </IconButton>
          </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-16-20'>
          <div>
            <span className='text-gray-500'>Contacto</span>
            <p className='text-gray-900 dark:text-gray-100'>{schedule.contact_name || '—'}</p>
            {schedule.contact_phone && (
              <p className='text-gray-500 text-sm'>{schedule.contact_phone}</p>
            )}
          </div>
          <div>
            <span className='text-gray-500'>Entrega</span>
            <p className='text-gray-900 dark:text-gray-100'>
              {DELIVERY_TYPE_LABELS[schedule.delivery_type]?.[lang] || schedule.delivery_type}
            </p>
          </div>
          <div>
            <span className='text-gray-500'>Pago</span>
            <p className='text-gray-900 dark:text-gray-100'>
              {PAYMENT_METHOD_LABELS[schedule.payment_method]?.[lang] || schedule.payment_method}
            </p>
          </div>
          <div>
            <span className='text-gray-500'>Creado</span>
            <p className='text-gray-900 dark:text-gray-100'>{formatDate(schedule.created_at)}</p>
          </div>
        </div>

        {schedule.addresses && (
          <div className='border-t border-border-card-children-light dark:border-border-card-children-dark pt-4'>
            <span className='text-sm text-gray-500'>Direccion</span>
            <p className='text-gray-900 dark:text-gray-100 text-16-20 mt-1'>
              {schedule.addresses.full_name}
            </p>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>
              {schedule.addresses.street}, {schedule.addresses.city}{' '}
              {schedule.addresses.postal_code}
            </p>
          </div>
        )}

        {/* Weekly planning grid */}
        <div className='border-t border-border-card-children-light dark:border-border-card-children-dark pt-4'>
          <h2 className='text-24-32 font-semibold text-gray-900 dark:text-gray-100 mb-4'>
            Planificacion semanal
          </h2>
          <div className='grid grid-cols-7 gap-2'>
            {DAY_NAMES.map((dayName, i) => {
              const dayNum = i + 1;
              const dayItems = itemsByDay.get(dayNum) || [];

              return (
                <div key={dayName} className='text-center'>
                  <div className='text-sm font-bold text-gray-600 dark:text-gray-400 mb-2'>
                    {dayName}
                  </div>
                  {dayItems.length === 0 ? (
                    <span className='text-sm text-gray-300'>—</span>
                  ) : (
                    <div className='space-y-1'>
                      {dayItems.map(item => (
                        <div
                          key={item.id}
                          className={`text-sm p-1.5 rounded ${
                            item.is_active
                              ? 'bg-amber-50 dark:bg-amber-900/20'
                              : 'bg-gray-100 dark:bg-gray-800 opacity-50'
                          }`}
                        >
                          <div className='truncate font-medium text-gray-900 dark:text-gray-100'>
                            {getProductName(item)}
                          </div>
                          <div className='text-gray-500'>
                            {editingItemId === item.id ? (
                              <form
                                onSubmit={e => {
                                  e.preventDefault();
                                  handleUpdateQuantity(item.id, item.product_id, item.day_of_week);
                                }}
                                className='flex items-center gap-1 justify-center mt-0.5'
                              >
                                <input
                                  type='number'
                                  min='1'
                                  value={editQuantity}
                                  onChange={e => setEditQuantity(e.target.value)}
                                  className='w-10 text-center text-sm border rounded px-1 py-0.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                                />
                                <button
                                  type='submit'
                                  disabled={busy}
                                  className='text-green-500 hover:text-green-600 cursor-pointer disabled:opacity-50'
                                >
                                  ✓
                                </button>
                                <button
                                  type='button'
                                  onClick={() => setEditingItemId(null)}
                                  className='text-gray-400 hover:text-gray-500 cursor-pointer'
                                >
                                  ✕
                                </button>
                              </form>
                            ) : (
                              <button
                                type='button'
                                onClick={() => {
                                  setEditingItemId(item.id);
                                  setEditQuantity(String(item.quantity));
                                }}
                                className='cursor-pointer hover:text-amber-500 transition-colors'
                                title='Click para editar cantidad'
                              >
                                x{item.quantity}
                                {item.products?.price
                                  ? ` · ${formatPrice(item.products.price * item.quantity)}`
                                  : ''}
                              </button>
                            )}
                          </div>
                          <div className='flex justify-center gap-1 mt-0.5'>
                            <button
                              type='button'
                              onClick={() => handleToggleItem(item.id, !item.is_active)}
                              disabled={busy}
                              className='text-gray-400 hover:text-amber-500 cursor-pointer disabled:opacity-50'
                            >
                              {item.is_active ? '⏸' : '▶'}
                            </button>
                            <button
                              type='button'
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={busy}
                              className='text-gray-400 hover:text-red-500 cursor-pointer disabled:opacity-50'
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add item form */}
        {products.length > 0 && (
          <div className='border-t border-border-card-children-light dark:border-border-card-children-dark pt-4'>
            <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3'>
              Agregar item
            </h3>
            <form onSubmit={handleAddItem} className='flex flex-wrap items-end gap-3'>
              <div className='flex-1 min-w-[180px]'>
                <Label htmlFor='add-product'>Producto</Label>
                <Select
                  id='add-product'
                  value={addProductId}
                  onChange={setAddProductId}
                  required
                  placeholder='Seleccionar...'
                  options={products.map(p => {
                    const name = p.product_translations?.[0]?.name || p.slug;
                    return { value: p.id, label: `${name} — ${formatPrice(p.price)}` };
                  })}
                />
              </div>
              <div className='w-32'>
                <Label htmlFor='add-day'>Dia</Label>
                <Select
                  id='add-day'
                  value={addDayOfWeek}
                  onChange={setAddDayOfWeek}
                  options={DAY_NAMES.map((name, i) => ({ value: String(i + 1), label: name }))}
                />
              </div>
              <div className='w-24'>
                <Label htmlFor='add-qty'>Cantidad</Label>
                <Input
                  id='add-qty'
                  type='number'
                  min='1'
                  value={addQuantity}
                  onChange={e => setAddQuantity(e.target.value)}
                  required
                />
              </div>
              <Button
                type='submit'
                variant='primary'
                disabled={busy || !addProductId}
                className='cursor-pointer'
              >
                Agregar
              </Button>
            </form>
            {addError && <p className='text-sm text-red-500 mt-2'>{addError}</p>}
          </div>
        )}

        {schedule.notes && (
          <div className='border-t border-border-card-children-light dark:border-border-card-children-dark pt-4'>
            <span className='text-sm text-gray-500'>Notas</span>
            <p className='text-gray-700 dark:text-gray-300 mt-1'>{schedule.notes}</p>
          </div>
        )}
      </DashboardCard>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title='¿Eliminar este pedido recurrente?'
        description='Esta accion no se puede deshacer.'
        loading={busy}
      />
    </div>
  );
};

RecurringScheduleDetail.displayName = 'RecurringScheduleDetail';
