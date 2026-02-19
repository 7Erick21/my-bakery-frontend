'use client';

import type { FC } from 'react';

import type { InventoryMovementItem } from '@/lib/supabase/models';
import { MOVEMENT_TYPE_LABELS } from '@/shared/constants/inventory';
import { DataTable } from '../shared/DataTable';
import { PageHeader } from '../shared/PageHeader';

interface InventoryMovementsProps {
  movements: InventoryMovementItem[];
}

export const InventoryMovements: FC<InventoryMovementsProps> = ({ movements }) => {
  const columns = [
    {
      key: 'product',
      header: 'Producto',
      render: (item: InventoryMovementItem) => (
        <span className='font-medium text-gray-900 dark:text-gray-100'>
          {item.products?.product_translations?.[0]?.name ?? item.product_id}
        </span>
      )
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (item: InventoryMovementItem) => (
        <span className='text-gray-700 dark:text-gray-300'>
          {MOVEMENT_TYPE_LABELS[item.movement_type] ?? item.movement_type}
        </span>
      )
    },
    {
      key: 'quantity',
      header: 'Cantidad',
      render: (item: InventoryMovementItem) => {
        const isPositive = item.quantity > 0;
        return (
          <span className={isPositive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
            {isPositive ? `+${item.quantity}` : item.quantity}
          </span>
        );
      }
    },
    {
      key: 'notes',
      header: 'Notas',
      render: (item: InventoryMovementItem) => (
        <span className='text-gray-500 dark:text-gray-400 truncate max-w-48 inline-block'>
          {item.notes || '-'}
        </span>
      )
    },
    {
      key: 'user',
      header: 'Usuario',
      render: (item: InventoryMovementItem) => (
        <span className='text-gray-600 dark:text-gray-400'>{item.profiles?.full_name ?? '-'}</span>
      )
    },
    {
      key: 'date',
      header: 'Fecha',
      render: (item: InventoryMovementItem) => (
        <span className='text-gray-500 dark:text-gray-400 text-xs'>
          {new Date(item.created_at).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    }
  ];

  return (
    <div>
      <PageHeader title='Movimientos de inventario' />
      <DataTable columns={columns} data={movements} emptyMessage='No hay movimientos registrados' />
    </div>
  );
};

InventoryMovements.displayName = 'InventoryMovements';
