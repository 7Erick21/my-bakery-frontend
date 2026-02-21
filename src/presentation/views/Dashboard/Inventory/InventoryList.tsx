'use client';

import { type FC, useState } from 'react';

import { Button, DashboardCard, IconButton, Input, StatusBadge } from '@/components/atoms';
import PencilIcon from '@/icons/pencil.svg';
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
          <div className='flex gap-2 justify-center'>
            <Button
              variant='primary'
              onClick={() => saveEdit(item.product_id)}
              className='!text-sm !px-2 !py-0.5'
            >
              Guardar
            </Button>
            <Button
              variant='secondary'
              onClick={() => setEditingId(null)}
              className='!text-sm !px-2 !py-0.5'
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <IconButton aria-label='Editar' variant='accent' onClick={() => startEdit(item)}>
            <PencilIcon className='w-4 h-4' />
          </IconButton>
        )
    }
  ];

  const totalProducts = inventory.length;
  const lowStockItems = inventory.filter(i => i.stock > 0 && i.stock <= i.low_stock_threshold);
  const outOfStockItems = inventory.filter(i => i.stock === 0);

  return (
    <div>
      <PageHeader title={t('dashboard.nav.inventory', 'Inventario')} />

      {/* Summary cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        <DashboardCard>
          <p className='text-14-16 text-gray-500 dark:text-gray-400'>Total productos</p>
          <p className='text-32-40 font-bold text-gray-900 dark:text-gray-100'>{totalProducts}</p>
        </DashboardCard>
        <DashboardCard>
          <p className='text-14-16 text-gray-500 dark:text-gray-400'>Stock bajo</p>
          <p className='text-32-40 font-bold text-amber-600 dark:text-amber-400'>
            {lowStockItems.length}
          </p>
        </DashboardCard>
        <DashboardCard>
          <p className='text-14-16 text-gray-500 dark:text-gray-400'>Sin stock</p>
          <p className='text-32-40 font-bold text-red-600 dark:text-red-400'>
            {outOfStockItems.length}
          </p>
        </DashboardCard>
      </div>

      {/* Low stock alerts */}
      {lowStockItems.length > 0 && (
        <DashboardCard className='mb-6'>
          <h3 className='text-16-20 font-semibold text-amber-700 dark:text-amber-400 mb-3'>
            Alertas de stock bajo
          </h3>
          <div className='space-y-3'>
            {lowStockItems.map(item => {
              const name = item.products?.product_translations?.[0]?.name || item.product_id;
              const pct = Math.round((item.stock / item.low_stock_threshold) * 100);
              return (
                <div key={item.product_id}>
                  <div className='flex justify-between text-14-16 mb-1'>
                    <span className='text-gray-700 dark:text-gray-300'>{name}</span>
                    <span className='text-gray-500 dark:text-gray-400'>
                      {item.stock} / {item.low_stock_threshold}
                    </span>
                  </div>
                  <div className='w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct <= 25 ? 'bg-red-500' : pct <= 50 ? 'bg-amber-500' : 'bg-yellow-400'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      )}

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
