'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { type FC, useState } from 'react';

import { Button, IconButton, Select, StatusBadge } from '@/components/atoms';
import EyeIcon from '@/icons/eye.svg';
import type { OrderAdmin } from '@/lib/supabase/models';
import type { OrderStatus } from '@/lib/supabase/types';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { updateOrderStatus, updatePaymentStatus } from '@/server/actions/orders';
import { PAYMENT_METHOD_LABELS } from '@/shared/constants/checkout';
import { ORDER_STATUS_COLORS, ORDER_STATUS_OPTIONS } from '@/shared/constants/orderStatus';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { DataTable } from '../shared/DataTable';
import { PageHeader } from '../shared/PageHeader';

interface OrdersListProps {
  orders: OrderAdmin[];
}

export const OrdersList: FC<OrdersListProps> = ({ orders }) => {
  const { t } = useTranslation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error(err);
    }
    setUpdatingId(null);
  }

  async function handleMarkAsPaid(orderId: string) {
    setUpdatingId(orderId);
    try {
      await updatePaymentStatus(orderId, 'paid');
    } catch (err) {
      console.error(err);
    }
    setUpdatingId(null);
  }

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (order: OrderAdmin) => (
        <span className='font-mono text-sm'>{order.id.slice(0, 8)}</span>
      )
    },
    {
      key: 'client',
      header: 'Cliente',
      render: (order: OrderAdmin) => order.profiles?.full_name || order.profiles?.email || '—'
    },
    {
      key: 'total',
      header: 'Total',
      render: (order: OrderAdmin) => <span className='font-medium'>{formatPrice(order.total)}</span>
    },
    {
      key: 'method',
      header: 'Metodo',
      render: (order: OrderAdmin) => (
        <span className='text-sm'>
          {PAYMENT_METHOD_LABELS[order.payment_method]?.es || order.payment_method}
        </span>
      )
    },
    {
      key: 'payment',
      header: 'Pago',
      render: (order: OrderAdmin) => (
        <div className='flex items-center gap-2'>
          <StatusBadge variant={order.payment_status === 'paid' ? 'green' : 'yellow'}>
            {order.payment_status}
          </StatusBadge>
          {order.payment_status === 'pending' && order.payment_method !== 'stripe' && (
            <Button
              variant='primary'
              onClick={() => handleMarkAsPaid(order.id)}
              disabled={updatingId === order.id}
              className='!px-2 !py-0.5 !text-sm !rounded'
            >
              Pagado
            </Button>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: (order: OrderAdmin) => (
        <Select
          value={order.status}
          onChange={v => handleStatusChange(order.id, v as OrderStatus)}
          disabled={updatingId === order.id}
          className={`px-2 py-1 rounded text-sm font-medium border-0 cursor-pointer ${ORDER_STATUS_COLORS[order.status] || ''}`}
          options={ORDER_STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
        />
      )
    },
    {
      key: 'delivery',
      header: 'Entrega',
      render: (order: OrderAdmin) => (
        <span className='text-sm'>
          {order.delivery_date ? formatDate(order.delivery_date) : '—'}
        </span>
      )
    },
    {
      key: 'date',
      header: 'Fecha',
      render: (order: OrderAdmin) => <span className='text-sm'>{formatDate(order.created_at)}</span>
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (order: OrderAdmin) => (
        <Link href={`/dashboard/orders/${order.id}` as Route}>
          <IconButton aria-label='Ver' variant='info'>
            <EyeIcon className='w-4 h-4' />
          </IconButton>
        </Link>
      )
    }
  ];

  return (
    <div>
      <PageHeader title={t('dashboard.nav.orders', 'Pedidos')} />
      <DataTable columns={columns} data={orders} emptyMessage='No hay pedidos' />
    </div>
  );
};

OrdersList.displayName = 'OrdersList';
