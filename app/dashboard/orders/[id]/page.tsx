import { redirect } from 'next/navigation';

import { getInvoiceByOrderId } from '@/server/queries/invoices';
import { getOrderById } from '@/server/queries/orders';

import { OrderManage } from '@/views/Dashboard/Orders';

export default async function DashboardOrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) redirect('/dashboard/orders');

  const invoice = await getInvoiceByOrderId(order.id);

  return <OrderManage order={order} invoiceId={invoice?.id} />;
}
