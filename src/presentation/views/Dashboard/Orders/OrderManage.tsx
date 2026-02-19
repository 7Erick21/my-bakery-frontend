'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { type FC, useState } from 'react';

import { DashboardCard, StatusBadge } from '@/components/atoms';
import type { OrderWithItems } from '@/lib/supabase/models';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { updatePaymentStatus } from '@/server/actions/orders';
import { DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/shared/constants/checkout';
import { ORDER_STATUS_BADGE_VARIANTS } from '@/shared/constants/orderStatus';
import { useTranslation } from '@/shared/hooks/useTranslate';

interface OrderManageProps {
  order: OrderWithItems;
  invoiceId?: string | null;
}

export const OrderManage: FC<OrderManageProps> = ({ order, invoiceId }) => {
  const { t } = useTranslation();
  const [marking, setMarking] = useState(false);
  const lang = 'es';

  async function handleMarkAsPaid() {
    setMarking(true);
    try {
      await updatePaymentStatus(order.id, 'paid');
    } catch (err) {
      console.error(err);
    }
    setMarking(false);
  }

  return (
    <div>
      <Link
        href={'/dashboard/orders' as Route}
        className='text-amber-600 hover:text-amber-700 mb-6 inline-block text-sm'
      >
        ← Volver a pedidos
      </Link>

      <DashboardCard className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-24-32 font-bold text-gray-900 dark:text-gray-100'>
            Pedido #{order.id.slice(0, 8)}
          </h1>
          <StatusBadge variant={ORDER_STATUS_BADGE_VARIANTS[order.status] || 'gray'}>
            {order.status}
          </StatusBadge>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-14-16'>
          <div>
            <span className='text-gray-500'>Cliente</span>
            <p className='text-gray-900 dark:text-gray-100 font-medium'>
              {order.profiles?.full_name || '—'}
            </p>
            <p className='text-gray-500 text-xs'>{order.profiles?.email}</p>
          </div>
          <div>
            <span className='text-gray-500'>Fecha</span>
            <p className='text-gray-900 dark:text-gray-100'>{formatDate(order.created_at)}</p>
          </div>
          <div>
            <span className='text-gray-500'>Entrega</span>
            <p className='text-gray-900 dark:text-gray-100'>
              {order.delivery_date ? formatDate(order.delivery_date) : 'Inmediata'}
            </p>
          </div>
          <div>
            <span className='text-gray-500'>Pago</span>
            <div className='flex items-center gap-2 mt-1'>
              <StatusBadge variant={order.payment_status === 'paid' ? 'green' : 'yellow'}>
                {order.payment_status}
              </StatusBadge>
              {order.payment_status === 'pending' && order.payment_method !== 'stripe' && (
                <button
                  type='button'
                  onClick={handleMarkAsPaid}
                  disabled={marking}
                  className='px-2 py-0.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded cursor-pointer disabled:opacity-50'
                >
                  {marking ? '...' : 'Marcar pagado'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* New fields: delivery type, payment method, delivery fee */}
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'>
          <div>
            <span className='text-gray-500'>Metodo de pago</span>
            <p className='text-gray-900 dark:text-gray-100'>
              {PAYMENT_METHOD_LABELS[order.payment_method]?.[lang] || order.payment_method}
            </p>
          </div>
          <div>
            <span className='text-gray-500'>Tipo de entrega</span>
            <p className='text-gray-900 dark:text-gray-100'>
              {DELIVERY_TYPE_LABELS[order.delivery_type]?.[lang] || order.delivery_type}
            </p>
          </div>
          {order.delivery_fee > 0 && (
            <div>
              <span className='text-gray-500'>Gastos envio</span>
              <p className='text-gray-900 dark:text-gray-100'>{formatPrice(order.delivery_fee)}</p>
            </div>
          )}
        </div>

        {/* Delivery address */}
        {order.addresses && (
          <div className='border-t border-border-card-children-light dark:border-border-card-children-dark pt-4'>
            <span className='text-sm text-gray-500'>Direccion de envio</span>
            <p className='text-gray-900 dark:text-gray-100 text-sm mt-1'>
              {order.addresses.full_name}
            </p>
            <p className='text-gray-600 dark:text-gray-400 text-xs'>
              {order.addresses.street}, {order.addresses.city} {order.addresses.postal_code},{' '}
              {order.addresses.province}
            </p>
          </div>
        )}

        <div className='border-t border-border-card-children-light dark:border-border-card-children-dark pt-4'>
          <h2 className='text-18-24 font-semibold text-gray-900 dark:text-gray-100 mb-4'>
            Productos
          </h2>
          {order.order_items?.map(item => (
            <div key={item.id} className='flex justify-between py-2'>
              <span className='text-gray-700 dark:text-gray-300'>
                {item.products?.product_translations?.[0]?.name || 'Producto'} x {item.quantity}
                <span className='text-xs text-gray-400 ml-2'>IVA {item.tax_rate}%</span>
              </span>
              <span className='font-medium text-gray-900 dark:text-gray-100'>
                {formatPrice(item.total_price)}
              </span>
            </div>
          ))}
        </div>

        <div className='border-t border-border-card-children-light dark:border-border-card-children-dark pt-4 space-y-2'>
          <div className='flex justify-between'>
            <span className='text-gray-500'>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className='flex justify-between text-green-600'>
              <span>Descuento</span>
              <span>-{formatPrice(order.discount_amount)}</span>
            </div>
          )}
          {order.delivery_fee > 0 && (
            <div className='flex justify-between text-sm'>
              <span className='text-gray-500'>Gastos envio</span>
              <span>{formatPrice(order.delivery_fee)}</span>
            </div>
          )}
          <div className='flex justify-between text-lg font-bold'>
            <span>Total</span>
            <span className='text-amber-600'>{formatPrice(order.total)}</span>
          </div>
        </div>

        {order.notes && (
          <div className='border-t border-border-card-children-light dark:border-border-card-children-dark pt-4'>
            <span className='text-sm text-gray-500'>Notas</span>
            <p className='text-gray-700 dark:text-gray-300 mt-1'>{order.notes}</p>
          </div>
        )}

        {order.stripe_checkout_session_id && (
          <div className='border-t border-border-card-children-light dark:border-border-card-children-dark pt-4'>
            <span className='text-sm text-gray-500'>Stripe Session</span>
            <p className='text-gray-500 font-mono text-xs mt-1'>
              {order.stripe_checkout_session_id}
            </p>
          </div>
        )}

        {invoiceId && (
          <div className='border-t border-border-card-children-light dark:border-border-card-children-dark pt-4'>
            <a
              href={`/api/invoices/${invoiceId}/pdf`}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm'
            >
              {t('orders.downloadInvoice', 'Descargar factura')}
            </a>
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

OrderManage.displayName = 'OrderManage';
