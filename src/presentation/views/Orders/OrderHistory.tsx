'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { type FC, useState } from 'react';

import type { OrderListItem } from '@/lib/supabase/models';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { getTranslation } from '@/lib/utils/translation';
import { Layout } from '@/presentation/layout/Layout';
import { DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/shared/constants/checkout';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/shared/constants/orderStatus';
import { useTranslation } from '@/shared/hooks/useTranslate';

interface OrderHistoryProps {
  orders: OrderListItem[];
}

export const OrderHistory: FC<OrderHistoryProps> = ({ orders }) => {
  const { t, lang } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <Layout>
      <section className='min-h-dvh pt-24 pb-16'>
        <h1 className='text-32-48 font-bold text-gray-900 dark:text-gray-100 mb-8'>
          {t('auth.myOrders', 'Mis pedidos')}
        </h1>

        {orders.length === 0 ? (
          <p className='text-center text-gray-500 dark:text-gray-400 py-12'>
            {t('orders.empty', 'No tienes pedidos aun')}
          </p>
        ) : (
          <div className='space-y-3'>
            {orders.map(order => {
              const isExpanded = expandedId === order.id;
              const invoiceId = order.invoices?.[0]?.id ?? null;
              const statusLabel = ORDER_STATUS_LABELS[order.status]?.[lang] || order.status;
              const statusColor = ORDER_STATUS_COLORS[order.status] || '';

              return (
                <div
                  key={order.id}
                  className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 transition-colors hover:border-amber-300 dark:hover:border-amber-700'
                >
                  {/* Collapsed header — always visible */}
                  <button
                    type='button'
                    onClick={() => toggle(order.id)}
                    className='w-full text-left p-4 sm:p-5 cursor-pointer'
                  >
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      {/* Left: order number + date */}
                      <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3'>
                        <span className='font-semibold text-gray-900 dark:text-gray-100'>
                          Pedido #{order.id.slice(0, 8)}
                        </span>
                        <span className='text-sm text-gray-500'>
                          {formatDate(order.created_at)}
                        </span>
                      </div>

                      {/* Right: status badge + total + invoice btn + chevron */}
                      <div className='flex items-center gap-3'>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                        <span className='text-lg font-bold text-amber-600 dark:text-amber-400'>
                          {formatPrice(order.total)}
                        </span>
                        {invoiceId && (
                          <a
                            href={`/api/invoices/${invoiceId}/pdf`}
                            target='_blank'
                            rel='noreferrer'
                            onClick={e => e.stopPropagation()}
                            className='inline-flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg'
                            title={t('orders.downloadInvoice', 'Descargar factura')}
                          >
                            {t('orders.invoice', 'Factura')}
                          </a>
                        )}
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          strokeWidth={2}
                        >
                          <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className='px-4 sm:px-5 pb-5 border-t border-gray-100 dark:border-gray-800 space-y-4'>
                      {/* Products list */}
                      <div className='pt-4'>
                        <h3 className='text-sm font-semibold text-gray-500 mb-2'>
                          {t('checkout.products', 'Productos')}
                        </h3>
                        {order.order_items?.map(item => {
                          const name =
                            getTranslation(item.products?.product_translations, lang)?.name ||
                            'Producto';
                          return (
                            <div key={item.id} className='flex justify-between py-1.5 text-sm'>
                              <span className='text-gray-700 dark:text-gray-300'>
                                {name} x {item.quantity}
                              </span>
                              <span className='font-medium text-gray-900 dark:text-gray-100'>
                                {formatPrice(item.total_price)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Price breakdown */}
                      <div className='border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1 text-sm'>
                        <div className='flex justify-between'>
                          <span className='text-gray-500'>Subtotal</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                          <div className='flex justify-between text-green-600'>
                            <span>{t('orders.discount', 'Descuento')}</span>
                            <span>-{formatPrice(order.discount_amount)}</span>
                          </div>
                        )}
                        {order.delivery_fee > 0 && (
                          <div className='flex justify-between'>
                            <span className='text-gray-500'>
                              {t('checkout.deliveryFee', 'Gastos de envio')}
                            </span>
                            <span>{formatPrice(order.delivery_fee)}</span>
                          </div>
                        )}
                        <div className='flex justify-between font-bold pt-1'>
                          <span>Total</span>
                          <span className='text-amber-600'>{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className='border-t border-gray-100 dark:border-gray-800 pt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500'>
                        <span>
                          {PAYMENT_METHOD_LABELS[order.payment_method]?.[lang] ||
                            order.payment_method}
                        </span>
                        <span>
                          {DELIVERY_TYPE_LABELS[order.delivery_type]?.[lang] || order.delivery_type}
                        </span>
                        {order.delivery_date && (
                          <span>
                            {t('orders.deliveryDate', 'Entrega')}: {formatDate(order.delivery_date)}
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div className='text-sm'>
                          <span className='text-gray-500'>{t('orders.notes', 'Notas')}:</span>{' '}
                          <span className='text-gray-700 dark:text-gray-300'>{order.notes}</span>
                        </div>
                      )}

                      {/* Link to full detail */}
                      <div className='pt-2'>
                        <Link
                          href={`/orders/${order.id}` as Route}
                          onClick={e => e.stopPropagation()}
                          className='text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium'
                        >
                          {t('orders.viewDetail', 'Ver detalle completo')} →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
};

OrderHistory.displayName = 'OrderHistory';
