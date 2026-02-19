'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { type FC, useState } from 'react';

import { DashboardCard, StatusBadge } from '@/components/atoms';
import type { InvoiceWithItems } from '@/lib/supabase/models';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { sendInvoiceEmail } from '@/server/actions/invoices';
import { useTranslation } from '@/shared/hooks/useTranslate';

interface InvoiceDetailProps {
  invoice: InvoiceWithItems;
}

export const InvoiceDetail: FC<InvoiceDetailProps> = ({ invoice }) => {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  async function handleSendEmail() {
    setSending(true);
    setSendError(null);
    try {
      await sendInvoiceEmail(invoice.id);
      setSentSuccess(true);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Error al enviar');
    }
    setSending(false);
  }

  // Group items by tax_rate for IVA summary
  const ivaByRate = new Map<number, { base: number; iva: number }>();
  for (const item of invoice.invoice_items) {
    const existing = ivaByRate.get(item.tax_rate) || { base: 0, iva: 0 };
    existing.base += item.line_base;
    existing.iva += item.line_iva;
    ivaByRate.set(item.tax_rate, existing);
  }

  return (
    <div>
      <Link
        href={'/dashboard/invoices' as Route}
        className='text-amber-600 hover:text-amber-700 mb-6 inline-block text-sm'
      >
        ← Volver a facturas
      </Link>

      <DashboardCard className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-24-32 font-bold text-gray-900 dark:text-gray-100'>
              {invoice.invoice_number}
            </h1>
            <p className='text-sm text-gray-500'>
              {formatDate(invoice.invoice_date || invoice.created_at)}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              target='_blank'
              rel='noreferrer'
              className='px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg'
            >
              Descargar PDF
            </a>
            <button
              type='button'
              onClick={handleSendEmail}
              disabled={sending || !invoice.buyer_email}
              className='px-4 py-2 border border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-sm font-medium rounded-lg cursor-pointer disabled:opacity-50'
            >
              {sending ? 'Enviando...' : 'Enviar email'}
            </button>
          </div>
        </div>

        {sendError && (
          <div className='p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm'>
            {sendError}
          </div>
        )}

        {sentSuccess && (
          <div className='p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm'>
            Factura enviada correctamente
          </div>
        )}

        <div className='grid grid-cols-2 gap-6'>
          {/* Seller */}
          <div>
            <h2 className='text-xs font-bold text-gray-500 mb-2 uppercase'>Emisor</h2>
            <p className='text-gray-900 dark:text-gray-100 font-medium'>{invoice.seller_name}</p>
            {invoice.seller_nif && (
              <p className='text-sm text-gray-500'>NIF: {invoice.seller_nif}</p>
            )}
            {invoice.seller_address && (
              <p className='text-sm text-gray-500'>{invoice.seller_address}</p>
            )}
          </div>

          {/* Buyer */}
          <div>
            <h2 className='text-xs font-bold text-gray-500 mb-2 uppercase'>Cliente</h2>
            <p className='text-gray-900 dark:text-gray-100 font-medium'>{invoice.buyer_name}</p>
            {invoice.buyer_nif && <p className='text-sm text-gray-500'>NIF: {invoice.buyer_nif}</p>}
            {invoice.buyer_address && (
              <p className='text-sm text-gray-500'>{invoice.buyer_address}</p>
            )}
            {invoice.buyer_email && <p className='text-sm text-gray-500'>{invoice.buyer_email}</p>}
          </div>
        </div>

        {/* Items */}
        <div className='border-t border-border-card-children-light dark:border-border-card-children-dark pt-4'>
          <h2 className='text-18-24 font-semibold text-gray-900 dark:text-gray-100 mb-4'>Lineas</h2>
          <table className='w-full text-sm'>
            <thead>
              <tr className='text-gray-500 text-xs'>
                <th className='text-left py-2'>Producto</th>
                <th className='text-center py-2'>Cant.</th>
                <th className='text-right py-2'>Base unit.</th>
                <th className='text-center py-2'>IVA %</th>
                <th className='text-right py-2'>IVA</th>
                <th className='text-right py-2'>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.invoice_items.map(item => (
                <tr
                  key={item.id}
                  className='border-t border-border-card-children-light/60 dark:border-border-card-children-dark/60'
                >
                  <td className='py-2 text-gray-900 dark:text-gray-100'>{item.product_name}</td>
                  <td className='py-2 text-center text-gray-600 dark:text-gray-400'>
                    {item.quantity}
                  </td>
                  <td className='py-2 text-right text-gray-600 dark:text-gray-400'>
                    {formatPrice(item.unit_base)}
                  </td>
                  <td className='py-2 text-center text-gray-600 dark:text-gray-400'>
                    {item.tax_rate}%
                  </td>
                  <td className='py-2 text-right text-gray-600 dark:text-gray-400'>
                    {formatPrice(item.line_iva)}
                  </td>
                  <td className='py-2 text-right font-medium text-gray-900 dark:text-gray-100'>
                    {formatPrice(item.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* IVA Summary */}
        <div className='border-t border-border-card-children-light dark:border-border-card-children-dark pt-4'>
          <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
            Desglose IVA
          </h3>
          {[...ivaByRate.entries()].map(([rate, { base, iva }]) => (
            <div key={rate} className='flex justify-between text-sm'>
              <span className='text-gray-500'>
                IVA {rate}% (base: {formatPrice(base)})
              </span>
              <span className='text-gray-700 dark:text-gray-300'>{formatPrice(iva)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className='border-t border-border-card-children-light dark:border-border-card-children-dark pt-4 space-y-2'>
          <div className='flex justify-between'>
            <span className='text-gray-500'>Base imponible</span>
            <span>{formatPrice(invoice.subtotal_base)}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-500'>Total IVA</span>
            <span>{formatPrice(invoice.total_iva)}</span>
          </div>
          {invoice.discount_amount > 0 && (
            <div className='flex justify-between text-green-600'>
              <span>Descuento</span>
              <span>-{formatPrice(invoice.discount_amount)}</span>
            </div>
          )}
          {invoice.delivery_fee > 0 && (
            <div className='flex justify-between'>
              <span className='text-gray-500'>Gastos de envio</span>
              <span>{formatPrice(invoice.delivery_fee)}</span>
            </div>
          )}
          <div className='flex justify-between text-lg font-bold'>
            <span>Total</span>
            <span className='text-amber-600'>{formatPrice(invoice.total)}</span>
          </div>
        </div>

        {/* Status */}
        <div className='flex items-center gap-3'>
          <span className='text-sm text-gray-500'>Estado de envio:</span>
          <StatusBadge variant={invoice.sent_at ? 'green' : 'gray'}>
            {invoice.sent_at ? `Enviada el ${formatDate(invoice.sent_at)}` : 'No enviada'}
          </StatusBadge>
        </div>
      </DashboardCard>
    </div>
  );
};

InvoiceDetail.displayName = 'InvoiceDetail';
