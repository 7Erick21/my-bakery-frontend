'use client';

import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import type { OrderWithItems } from '@/lib/supabase/models';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { Layout } from '@/presentation/layout/Layout';
import { DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/shared/constants/checkout';
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS
} from '@/shared/constants/orderStatus';
import { useTranslation } from '@/shared/hooks/useTranslate';

interface OrderDetailProps {
  order: OrderWithItems;
  invoiceId?: string | null;
  bizumPhone?: string;
}

export const OrderDetail: FC<OrderDetailProps> = ({ order, invoiceId, bizumPhone }) => {
  const { t, lang } = useTranslation();

  return (
    <Layout>
      <section className='min-h-dvh pt-24 pb-16'>
        <div className='max-w-3xl mx-auto'>
          <Link
            href={'/orders' as Route}
            className='text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 mb-6 inline-block'
          >
            ← {t('orders.backToOrders', 'Volver a mis pedidos')}
          </Link>

          <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6'>
            <div className='flex items-center justify-between'>
              <h1 className='text-24-32 font-bold text-gray-900 dark:text-gray-100'>
                Pedido #{order.id.slice(0, 8)}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${ORDER_STATUS_COLORS[order.status] || ''}`}
              >
                {ORDER_STATUS_LABELS[order.status]?.[lang] || order.status}
              </span>
            </div>

            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-500'>Fecha</span>
                <p className='text-gray-900 dark:text-gray-100'>{formatDate(order.created_at)}</p>
              </div>
              {order.delivery_date && (
                <div>
                  <span className='text-gray-500'>Entrega</span>
                  <p className='text-gray-900 dark:text-gray-100'>
                    {formatDate(order.delivery_date)}
                  </p>
                </div>
              )}
              <div>
                <span className='text-gray-500'>Pago</span>
                <p className='text-gray-900 dark:text-gray-100'>
                  {PAYMENT_STATUS_LABELS[order.payment_status]?.[lang] || order.payment_status}
                </p>
              </div>
              <div>
                <span className='text-gray-500'>
                  {t('checkout.paymentMethod', 'Metodo de pago')}
                </span>
                <p className='text-gray-900 dark:text-gray-100'>
                  {PAYMENT_METHOD_LABELS[order.payment_method]?.[lang] || order.payment_method}
                </p>
              </div>
              <div>
                <span className='text-gray-500'>
                  {t('checkout.deliveryType', 'Tipo de entrega')}
                </span>
                <p className='text-gray-900 dark:text-gray-100'>
                  {DELIVERY_TYPE_LABELS[order.delivery_type]?.[lang] || order.delivery_type}
                </p>
              </div>
            </div>

            {/* Delivery address */}
            {order.addresses && (
              <div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
                <h2 className='text-sm font-semibold text-gray-500 mb-2'>
                  {t('checkout.address', 'Direccion de envio')}
                </h2>
                <p className='text-gray-900 dark:text-gray-100 text-sm'>
                  {order.addresses.full_name}
                </p>
                <p className='text-gray-600 dark:text-gray-400 text-sm'>
                  {order.addresses.street}, {order.addresses.city} {order.addresses.postal_code},{' '}
                  {order.addresses.province}
                </p>
              </div>
            )}

            {/* Bizum payment instructions */}
            {order.payment_status === 'pending' && order.payment_method === 'bizum' && (
              <div className='p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800'>
                <p className='text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3'>
                  {t('orders.bizumInstructions', 'Instrucciones de pago por Bizum')}
                </p>
                <div className='space-y-2 text-sm text-blue-700 dark:text-blue-300'>
                  <p>
                    1. {t('orders.bizumStep1', 'Envia')}{' '}
                    <span className='font-bold'>{formatPrice(order.total)}</span>{' '}
                    {t('orders.bizumStep1b', 'por Bizum al numero:')}
                  </p>
                  <p className='text-lg font-bold text-blue-800 dark:text-blue-200 pl-4'>
                    {bizumPhone || '---'}
                  </p>
                  <p>
                    2. {t('orders.bizumStep2', 'Indica la referencia:')}{' '}
                    <span className='font-bold font-mono'>
                      PED-{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </p>
                  <p className='text-xs text-blue-500 dark:text-blue-400 mt-2'>
                    {t(
                      'orders.bizumStep3',
                      'Tu pedido se confirmara cuando verifiquemos la recepcion del pago.'
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Cash payment instructions */}
            {order.payment_status === 'pending' && order.payment_method === 'cash' && (
              <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                <p className='text-sm font-medium text-blue-700 dark:text-blue-400 mb-1'>
                  {t('orders.paymentPending', 'Pago pendiente')}
                </p>
                <p className='text-xs text-blue-600 dark:text-blue-300'>
                  {t('checkout.cashInfo', 'Paga al recoger tu pedido en tienda.')}
                </p>
              </div>
            )}

            <div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4'>
                Productos
              </h2>
              {order.order_items?.map(item => (
                <div key={item.id} className='flex justify-between py-2'>
                  <span className='text-gray-700 dark:text-gray-300'>
                    {item.products?.product_translations?.[0]?.name || 'Producto'} x {item.quantity}
                  </span>
                  <span className='font-medium text-gray-900 dark:text-gray-100'>
                    {formatPrice(item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            <div className='border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2'>
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
                  <span className='text-gray-500'>
                    {t('checkout.deliveryFee', 'Gastos de envio')}
                  </span>
                  <span>{formatPrice(order.delivery_fee)}</span>
                </div>
              )}
              <div className='flex justify-between text-lg font-bold'>
                <span>Total</span>
                <span className='text-amber-600'>{formatPrice(order.total)}</span>
              </div>
            </div>

            {order.notes && (
              <div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
                <span className='text-sm text-gray-500'>Notas</span>
                <p className='text-gray-700 dark:text-gray-300 mt-1'>{order.notes}</p>
              </div>
            )}

            {invoiceId && (
              <div className='border-t border-gray-200 dark:border-gray-700 pt-4'>
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
          </div>
        </div>
      </section>
    </Layout>
  );
};

OrderDetail.displayName = 'OrderDetail';
