'use client';

import { type FC, useState } from 'react';

import { Input, StatusBadge } from '@/components/atoms';
import type { InventoryItem } from '@/lib/supabase/models';
import { updateLowStockThreshold, updateStock } from '@/server/actions/inventory';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { DataTable } from '../shared/DataTable';
import { PageHeader } from '../shared/PageHeader';

interface InventoryListProps {
  inventory: InventoryItem[];
}

export const InventoryList: FC<InventoryListProps> = ({ inventory }) => {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState(0);
  const [editThreshold, setEditThreshold] = useState(0);

  function startEdit(item: InventoryItem) {
    setEditingId(item.product_id);
    setEditStock(item.stock);
    setEditThreshold(item.low_stock_threshold);
  }

  async function saveEdit(productId: string) {
    await updateStock(productId, editStock);
    await updateLowStockThreshold(productId, editThreshold);
    setEditingId(null);
  }

  const columns = [
    {
      key: 'product',
      header: 'Producto',
      render: (item: InventoryItem) => (
        <span className='font-medium text-gray-900 dark:text-gray-100'>
          {item.products?.product_translations?.[0]?.name || item.product_id}
        </span>
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (item: InventoryItem) => {
        const isLow = item.stock <= item.low_stock_threshold;
        return editingId === item.product_id ? (
          <Input
            type='number'
            value={editStock}
            onChange={e => setEditStock(Number(e.target.value))}
            className='w-20 py-1'
            min={0}
          />
        ) : (
          <span className={isLow ? 'text-red-600 font-bold' : ''}>{item.stock}</span>
        );
      }
    },
    {
      key: 'threshold',
      header: 'Umbral bajo',
      render: (item: InventoryItem) =>
        editingId === item.product_id ? (
          <Input
            type='number'
            value={editThreshold}
            onChange={e => setEditThreshold(Number(e.target.value))}
            className='w-20 py-1'
            min={0}
          />
        ) : (
          item.low_stock_threshold
        )
    },
    {
      key: 'status',
      header: 'Estado',
      render: (item: InventoryItem) => {
        const isLow = item.stock <= item.low_stock_threshold;
        return isLow ? (
          <StatusBadge variant='red'>Stock bajo</StatusBadge>
        ) : (
          <StatusBadge variant='green'>OK</StatusBadge>
        );
      }
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item: InventoryItem) =>
        editingId === item.product_id ? (
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => saveEdit(item.product_id)}
              className='text-green-600 hover:text-green-700 text-xs font-medium cursor-pointer'
            >
              Guardar
            </button>
            <button
              type='button'
              onClick={() => setEditingId(null)}
              className='text-gray-500 hover:text-gray-700 text-xs cursor-pointer'
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type='button'
            onClick={() => startEdit(item)}
            className='text-amber-600 hover:text-amber-700 text-xs font-medium cursor-pointer'
          >
            Editar
          </button>
        )
    }
  ];

  return (
    <div>
      <PageHeader title={t('dashboard.nav.inventory', 'Inventario')} />
      <DataTable
        columns={columns}
        data={inventory}
        emptyMessage='No hay productos en inventario. Los productos nuevos aparecen aqui automaticamente.'
        rowClassName={(item: InventoryItem) =>
          item.stock <= item.low_stock_threshold ? 'bg-red-50 dark:bg-red-900/10' : ''
        }
      />
    </div>
  );
};

InventoryList.displayName = 'InventoryList';
