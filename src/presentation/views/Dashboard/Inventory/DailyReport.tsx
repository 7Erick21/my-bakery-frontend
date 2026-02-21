'use client';

import { useRouter } from 'next/navigation';
import { type FC, useState, useTransition } from 'react';

import { Button, DashboardCard, DatePicker, Input, Label, Textarea } from '@/components/atoms';
import type { DailyReportWithItems } from '@/lib/supabase/models';
import { createDailyReport, replaceDailyReport } from '@/server/actions/inventory';
import { PageHeader } from '../shared/PageHeader';

interface ProductOption {
  id: string;
  name: string;
}

interface ReportLine {
  product_id: string;
  produced: number;
  sold_physical: number;
  damaged: number;
  sold_online: number;
}

interface DailyReportProps {
  products: ProductOption[];
  todayReport: DailyReportWithItems | null;
  suggestedQuantities?: Record<string, number>;
  initialDate: string;
}

export const DailyReport: FC<DailyReportProps> = ({
  products,
  todayReport,
  suggestedQuantities,
  initialDate
}) => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notes, setNotes] = useState(todayReport?.notes ?? '');
  const [isEditing, setIsEditing] = useState(false);

  // Initialize lines from existing report or empty
  const initialLines: ReportLine[] = todayReport
    ? todayReport.daily_inventory_report_items.map(item => ({
        product_id: item.product_id,
        produced: item.produced,
        sold_physical: item.sold_physical,
        damaged: item.damaged,
        sold_online: item.sold_online
      }))
    : products.map(p => ({
        product_id: p.id,
        produced: suggestedQuantities?.[p.id] ?? 0,
        sold_physical: 0,
        damaged: 0,
        sold_online: 0
      }));

  const [lines, setLines] = useState<ReportLine[]>(initialLines);

  function updateLine(index: number, field: keyof ReportLine, value: number) {
    setLines(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function calculateLeftover(line: ReportLine): number {
    return Math.max(line.produced - line.sold_online - line.sold_physical - line.damaged, 0);
  }

  function getProductName(productId: string): string {
    return products.find(p => p.id === productId)?.name ?? 'Producto';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const items = lines
      .filter(l => l.produced > 0 || l.sold_physical > 0 || l.damaged > 0)
      .map(l => ({
        product_id: l.product_id,
        produced: l.produced,
        sold_physical: l.sold_physical,
        damaged: l.damaged
      }));

    if (items.length === 0) {
      setError('Debes rellenar al menos un producto.');
      return;
    }

    const formData = new FormData();
    formData.set('report_date', selectedDate);
    formData.set('notes', notes);
    formData.set('items', JSON.stringify(items));

    startTransition(async () => {
      try {
        if (todayReport && isEditing) {
          await replaceDailyReport(todayReport.id, formData);
        } else {
          await createDailyReport(formData);
        }
        setSuccess(true);
        setIsEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al guardar el informe');
      }
    });
  }

  const isReadonly = !!todayReport && !isEditing;

  return (
    <div>
      <PageHeader
        title='Informe diario'
        subtitle={`Fecha: ${selectedDate}`}
        action={
          <a
            href='/dashboard/inventory/daily-report/history'
            className='text-amber-600 hover:text-amber-700 text-16-20 font-medium'
          >
            Ver historial
          </a>
        }
      />

      <div className='mb-4'>
        <Label>Fecha del informe</Label>
        <DatePicker
          value={selectedDate}
          onChange={newDate => {
            setSelectedDate(newDate);
            router.push(`/dashboard/inventory/daily-report?date=${newDate}`);
          }}
          className='mt-1 w-64'
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {isReadonly && (
        <div className='mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-16-20 flex items-center justify-between gap-3'>
          <span>Ya existe un informe para esta fecha. Los datos se muestran en modo lectura.</span>
          <Button
            variant='secondary'
            type='button'
            className='cursor-pointer shrink-0'
            onClick={() => setIsEditing(true)}
          >
            Editar
          </Button>
        </div>
      )}

      {error && (
        <div className='mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-16-20'>
          {error}
        </div>
      )}

      {success && (
        <div className='mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-16-20'>
          Informe guardado correctamente.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <DashboardCard noPadding className='overflow-x-auto mb-6'>
          <table className='w-full text-16-20'>
            <thead>
              <tr className='bg-amber-50/40 dark:bg-amber-950/20 border-b border-border-card-children-light dark:border-border-card-children-dark'>
                <th className='px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400'>
                  Producto
                </th>
                <th className='px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400'>
                  Producido
                </th>
                <th className='px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400'>
                  Venta fisica
                </th>
                <th className='px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400'>
                  Danado
                </th>
                <th className='px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400'>
                  Venta online
                </th>
                <th className='px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400'>
                  Sobrante
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, index) => (
                <tr
                  key={line.product_id}
                  className='border-b border-border-card-children-light/60 dark:border-border-card-children-dark/60'
                >
                  <td className='px-4 py-3 font-medium text-gray-900 dark:text-gray-100'>
                    {getProductName(line.product_id)}
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-1.5'>
                      <span>{line.produced}</span>
                      {!todayReport && suggestedQuantities?.[line.product_id] ? (
                        <span className='text-xs text-amber-600 dark:text-amber-400 whitespace-nowrap'>
                          (sugerido)
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    {isReadonly ? (
                      line.sold_physical
                    ) : (
                      <Input
                        type='number'
                        value={line.sold_physical}
                        onChange={e => updateLine(index, 'sold_physical', Number(e.target.value))}
                        className='w-20 py-1'
                        min={0}
                      />
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    {isReadonly ? (
                      line.damaged
                    ) : (
                      <Input
                        type='number'
                        value={line.damaged}
                        onChange={e => updateLine(index, 'damaged', Number(e.target.value))}
                        className='w-20 py-1'
                        min={0}
                      />
                    )}
                  </td>
                  <td className='px-4 py-3 text-gray-500'>{line.sold_online}</td>
                  <td className='px-4 py-3 font-medium'>{calculateLeftover(line)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardCard>

        {!isReadonly && (
          <DashboardCard className='mb-6'>
            <Label>Notas</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className='mt-1'
              placeholder='Notas opcionales sobre el dia...'
            />

            <div className='mt-4'>
              <Button
                variant='primary'
                type='submit'
                className='cursor-pointer'
                disabled={isPending}
              >
                {isPending
                  ? 'Guardando...'
                  : isEditing
                    ? 'Actualizar informe diario'
                    : 'Guardar informe diario'}
              </Button>
            </div>
          </DashboardCard>
        )}
      </form>
    </div>
  );
};

DailyReport.displayName = 'DailyReport';
