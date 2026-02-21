import { redirect } from 'next/navigation';

import { getInvoiceById } from '@/server/queries/invoices';

import { InvoiceDetail } from '@/views/Dashboard/Invoices';

export default async function DashboardInvoiceDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) redirect('/dashboard/invoices');

  return <InvoiceDetail invoice={invoice} />;
}
