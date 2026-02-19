'use client';

import { type FC, useState } from 'react';

import { Button, Checkbox, DashboardCard, Input, Label } from '@/components/atoms';
import type {
  ProductAdminListItem,
  ProductionScheduleItem,
  RecurringProductionItem
} from '@/lib/supabase/models';
import { getTranslation } from '@/lib/utils/translation';
import {
  deleteScheduleItem,
  toggleScheduleItem,
  upsertScheduleItem
} from '@/server/actions/production';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { PageHeader } from '../shared/PageHeader';

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface ProductionScheduleProps {
  schedule: ProductionScheduleItem[];
  products: ProductAdminListItem[];
  recurringItems: RecurringProductionItem[];
}

/** Merged row for the combined table */
interface MergedRow {
  product_id: string;
  product_name: string;
  base_quantity: number;
  recurring_quantity: number;
  total: number;
  recurring_details: { business_name: string; quantity: number }[];
  /** Original schedule item (null for recurring-only products) */
  scheduleItem: ProductionScheduleItem | null;
}

export const ProductionSchedule: FC<ProductionScheduleProps> = ({
  schedule,
  products,
  recurringItems
}) => {
  const { t } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  // Build recurring lookup: key = product_id__day_of_week
  const recurringMap = new Map<string, RecurringProductionItem>();
  for (const item of recurringItems) {
    recurringMap.set(`${item.product_id}__${item.day_of_week}`, item);
  }

  function resolveProductName(productId: string): string {
    const product = products.find(p => p.id === productId);
    if (!product) return 'Producto';
    const tr = getTranslation(product.product_translations, 'es');
    return tr?.name ?? product.slug;
  }

  function getItemProductName(item: ProductionScheduleItem): string {
    const joinedName = item.products?.product_translations?.[0]?.name;
    if (joinedName) return joinedName;
    return resolveProductName(item.product_id);
  }

  /** Build merged rows for a given day, combining base schedule + recurring-only products */
  function getMergedRows(day: number): MergedRow[] {
    const rows: MergedRow[] = [];
    const seenProducts = new Set<string>();

    // First: products that exist in the base schedule for this day
    for (const item of schedule) {
      if (item.day_of_week !== day) continue;
      seenProducts.add(item.product_id);
      const recKey = `${item.product_id}__${day}`;
      const rec = recurringMap.get(recKey);
      const recQty = rec?.total_quantity ?? 0;

      rows.push({
        product_id: item.product_id,
        product_name: getItemProductName(item),
        base_quantity: item.base_quantity,
        recurring_quantity: recQty,
        total: item.base_quantity + recQty,
        recurring_details: rec?.details ?? [],
        scheduleItem: item
      });
    }

    // Second: recurring-only products (not in base schedule for this day)
    for (const rec of recurringItems) {
      if (rec.day_of_week !== day || seenProducts.has(rec.product_id)) continue;
      seenProducts.add(rec.product_id);

      rows.push({
        product_id: rec.product_id,
        product_name: rec.product_name,
        base_quantity: 0,
        recurring_quantity: rec.total_quantity,
        total: rec.total_quantity,
        recurring_details: rec.details,
        scheduleItem: null
      });
    }

    return rows;
  }

  /** Check if any day has data */
  function hasAnyData(): boolean {
    for (let day = 1; day <= 7; day++) {
      if (getMergedRows(day).length > 0) return true;
    }
    return false;
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct || quantity < 1) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.set('product_id', selectedProduct);
      formData.set('day_of_week', String(selectedDay));
      formData.set('base_quantity', String(quantity));
      await upsertScheduleItem(formData);
      setSelectedProduct('');
      setQuantity(1);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  }

  async function handleSaveQuantity(item: ProductionScheduleItem) {
    if (editQuantity < 1) return;
    try {
      const formData = new FormData();
      formData.set('product_id', item.product_id);
      formData.set('day_of_week', String(item.day_of_week));
      formData.set('base_quantity', String(editQuantity));
      await upsertScheduleItem(formData);
    } catch (err) {
      console.error(err);
    }
    setEditingId(null);
  }

  async function handleToggle(item: ProductionScheduleItem) {
    try {
      await toggleScheduleItem(item.id, !item.is_active);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteScheduleItem(id);
    } catch (err) {
      console.error(err);
    }
    setDeleting(null);
  }

  async function handleDownloadPdf() {
    setGenerating(true);
    try {
      const { generateProductionSchedulePdf } = await import('@/lib/pdf/productionSchedulePdf');
      await generateProductionSchedulePdf(schedule, products, recurringItems);
    } catch (err) {
      console.error(err);
    }
    setGenerating(false);
  }

  return (
    <div>
      <PageHeader
        title={t('dashboard.nav.production', 'Producción')}
        subtitle='Calendario base permanente + pedidos recurrentes'
        action={
          <Button
            variant='secondary'
            className='cursor-pointer'
            onClick={handleDownloadPdf}
            disabled={generating}
          >
            {generating ? 'Generando...' : 'Descargar PDF'}
          </Button>
        }
      />

      {/* Add item form */}
      <DashboardCard className='mb-6' title='Añadir producto'>
        <form onSubmit={handleAdd} className='flex flex-wrap gap-4 items-end'>
          <div className='flex-1 min-w-48'>
            <Label>Producto</Label>
            <select
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              required
              className='w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-14-16 text-gray-900 dark:text-gray-100'
            >
              <option value=''>Seleccionar producto...</option>
              {products.map(p => {
                const tr = getTranslation(p.product_translations, 'es');
                return (
                  <option key={p.id} value={p.id}>
                    {tr?.name ?? p.slug}
                  </option>
                );
              })}
            </select>
          </div>
          <div className='w-40'>
            <Label>Día</Label>
            <select
              value={selectedDay}
              onChange={e => setSelectedDay(Number(e.target.value))}
              className='w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-14-16 text-gray-900 dark:text-gray-100'
            >
              {DAY_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className='w-28'>
            <Label>Cantidad</Label>
            <Input
              type='number'
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              min={1}
              required
            />
          </div>
          <Button variant='primary' className='cursor-pointer' type='submit' disabled={submitting}>
            {submitting ? 'Añadiendo...' : 'Añadir'}
          </Button>
        </form>
        <p className='text-xs text-gray-500 mt-2'>
          Si el producto ya existe para ese día, se actualizará la cantidad.
        </p>
      </DashboardCard>

      {/* Weekly grid */}
      {!hasAnyData() ? (
        <p className='text-gray-500 py-12 text-center'>
          No hay productos en el calendario. Usa el formulario de arriba para añadir productos.
        </p>
      ) : (
        <div className='space-y-6'>
          {[1, 2, 3, 4, 5, 6, 7].map(day => {
            const mergedRows = getMergedRows(day);
            if (mergedRows.length === 0) return null;

            const dayTotalBase = mergedRows.reduce((s, r) => s + r.base_quantity, 0);
            const dayTotalRecurring = mergedRows.reduce((s, r) => s + r.recurring_quantity, 0);
            const dayTotal = dayTotalBase + dayTotalRecurring;

            return (
              <DashboardCard key={day} title={DAY_NAMES[day - 1]}>
                <table className='w-full text-14-16'>
                  <thead>
                    <tr className='border-b border-border-card-children-light dark:border-border-card-children-dark text-left'>
                      <th className='py-2 px-3 font-medium text-gray-500'>Producto</th>
                      <th className='py-2 px-3 font-medium text-gray-500'>Base</th>
                      <th className='py-2 px-3 font-medium text-gray-500'>Recurrentes</th>
                      <th className='py-2 px-3 font-medium text-gray-500'>Total</th>
                      <th className='py-2 px-3 font-medium text-gray-500'>Activo</th>
                      <th className='py-2 px-3 font-medium text-gray-500'>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mergedRows.map(row => {
                      const isEditing = row.scheduleItem && editingId === row.scheduleItem.id;
                      const isDeleting = row.scheduleItem && deleting === row.scheduleItem.id;
                      const cellKey = `${row.product_id}__${day}`;
                      const isExpanded = expandedCell === cellKey;

                      return (
                        <tr
                          key={cellKey}
                          className={`border-b border-border-card-children-light/60 dark:border-border-card-children-dark/60 ${
                            row.scheduleItem && !row.scheduleItem.is_active ? 'opacity-50' : ''
                          }`}
                        >
                          <td className='py-2 px-3'>{row.product_name}</td>
                          <td className='py-2 px-3'>
                            {isEditing && row.scheduleItem ? (
                              <Input
                                type='number'
                                value={editQuantity}
                                onChange={e => setEditQuantity(Number(e.target.value))}
                                className='w-20 py-1'
                                min={1}
                              />
                            ) : (
                              <span className='font-medium'>{row.base_quantity}</span>
                            )}
                          </td>
                          <td className='py-2 px-3 relative'>
                            {row.recurring_quantity > 0 ? (
                              <button
                                type='button'
                                onClick={() => setExpandedCell(isExpanded ? null : cellKey)}
                                className='font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
                                title='Ver desglose por empresa'
                              >
                                {row.recurring_quantity}
                              </button>
                            ) : (
                              <span className='text-gray-400'>0</span>
                            )}
                            {isExpanded && row.recurring_details.length > 0 && (
                              <div className='absolute z-10 left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 min-w-48'>
                                <p className='text-xs font-semibold text-gray-500 mb-1'>
                                  Desglose:
                                </p>
                                {row.recurring_details.map(d => (
                                  <div
                                    key={d.business_name}
                                    className='flex justify-between text-xs py-0.5'
                                  >
                                    <span>{d.business_name}</span>
                                    <span className='font-medium ml-4'>{d.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className='py-2 px-3'>
                            <span className='font-bold'>{row.total}</span>
                          </td>
                          <td className='py-2 px-3'>
                            {row.scheduleItem ? (
                              <Checkbox
                                checked={row.scheduleItem.is_active}
                                onChange={() => handleToggle(row.scheduleItem!)}
                              />
                            ) : (
                              <span className='text-xs text-gray-400'>—</span>
                            )}
                          </td>
                          <td className='py-2 px-3'>
                            {row.scheduleItem ? (
                              isEditing ? (
                                <div className='flex gap-2'>
                                  <button
                                    type='button'
                                    onClick={() => handleSaveQuantity(row.scheduleItem!)}
                                    className='text-green-600 hover:text-green-700 text-xs font-medium cursor-pointer'
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    type='button'
                                    onClick={() => setEditingId(null)}
                                    className='text-gray-500 text-xs cursor-pointer'
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <div className='flex gap-2'>
                                  <button
                                    type='button'
                                    onClick={() => {
                                      setEditingId(row.scheduleItem!.id);
                                      setEditQuantity(row.scheduleItem!.base_quantity);
                                    }}
                                    className='text-amber-600 hover:text-amber-700 text-xs font-medium cursor-pointer'
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type='button'
                                    onClick={() => handleDelete(row.scheduleItem!.id)}
                                    disabled={!!isDeleting}
                                    className='text-red-600 hover:text-red-700 text-xs font-medium cursor-pointer disabled:opacity-50'
                                  >
                                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                                  </button>
                                </div>
                              )
                            ) : (
                              <span className='text-xs text-gray-400'>Solo recurrente</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Totals row */}
                    <tr className='bg-amber-50/50 dark:bg-amber-900/10 font-semibold'>
                      <td className='py-2 px-3 text-gray-600 dark:text-gray-300'>Total</td>
                      <td className='py-2 px-3'>{dayTotalBase}</td>
                      <td className='py-2 px-3'>{dayTotalRecurring}</td>
                      <td className='py-2 px-3'>{dayTotal}</td>
                      <td className='py-2 px-3' />
                      <td className='py-2 px-3' />
                    </tr>
                  </tbody>
                </table>
              </DashboardCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

ProductionSchedule.displayName = 'ProductionSchedule';
