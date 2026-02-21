'use client';

import type { Route } from 'next';
import Link from 'next/link';
import type { FC } from 'react';

import { IconButton, StatusBadge } from '@/components/atoms';
import EyeIcon from '@/icons/eye.svg';
import type { InvoiceWithItems } from '@/lib/supabase/models';
import { formatDate, formatPrice } from '@/lib/utils/format';
import { useTranslation } from '@/shared/hooks/useTranslate';
import { DataTable } from '../shared/DataTable';
import { PageHeader } from '../shared/PageHeader';

interface InvoicesListProps {
  invoices: InvoiceWithItems[];
}

export const InvoicesList: FC<InvoicesListProps> = ({ invoices }) => {
  const { t } = useTranslation();

  const columns = [
    {
      key: 'number',
      header: 'Numero',
      render: (inv: InvoiceWithItems) => (
        <span className='font-mono text-sm font-medium'>{inv.invoice_number}</span>
      )
    },
    {
      key: 'date',
      header: 'Fecha',
      render: (inv: InvoiceWithItems) => (
        <span className='text-sm'>{formatDate(inv.invoice_date || inv.created_at)}</span>
      )
    },
    {
      key: 'buyer',
      header: 'Cliente',
      render: (inv: InvoiceWithItems) => (
        <div>
          <span className='text-sm'>{inv.buyer_name}</span>
          {inv.buyer_email && <p className='text-sm text-gray-500'>{inv.buyer_email}</p>}
        </div>
      )
    },
    {
      key: 'base',
      header: 'Base',
      render: (inv: InvoiceWithItems) => (
        <span className='text-sm'>{formatPrice(inv.subtotal_base)}</span>
      )
    },
    {
      key: 'iva',
      header: 'IVA',
      render: (inv: InvoiceWithItems) => (
        <span className='text-sm'>{formatPrice(inv.total_iva)}</span>
      )
    },
    {
      key: 'total',
      header: 'Total',
      render: (inv: InvoiceWithItems) => (
        <span className='font-medium'>{formatPrice(inv.total)}</span>
      )
    },
    {
      key: 'sent',
      header: 'Enviada',
      render: (inv: InvoiceWithItems) => (
        <StatusBadge variant={inv.sent_at ? 'green' : 'gray'}>
          {inv.sent_at ? 'Si' : 'No'}
        </StatusBadge>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (inv: InvoiceWithItems) => (
        <Link href={`/dashboard/invoices/${inv.id}` as Route}>
          <IconButton aria-label='Ver' variant='info'>
            <EyeIcon className='w-4 h-4' />
          </IconButton>
        </Link>
      )
    }
  ];

  return (
    <div>
      <PageHeader title={t('dashboard.nav.invoices', 'Facturas')} />
      <DataTable columns={columns} data={invoices} emptyMessage='No hay facturas' />
    </div>
  );
};

InvoicesList.displayName = 'InvoicesList';
