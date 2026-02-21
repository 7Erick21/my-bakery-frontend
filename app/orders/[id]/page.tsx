import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';
import { getInvoiceByOrderId } from '@/server/queries/invoices';
import { getOrderById } from '@/server/queries/orders';

import { OrderDetail } from '@/views/Orders';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect('/auth');

  const { id } = await params;
  const order = await getOrderById(id, user.id);

  if (!order) redirect('/orders');

  const supabase = await createClient();
  const [invoice, bizumRow] = await Promise.all([
    getInvoiceByOrderId(order.id),
    supabase.from('business_info').select('value').eq('key', 'bizum_phone').maybeSingle()
  ]);

  return <OrderDetail order={order} invoiceId={invoice?.id} bizumPhone={bizumRow.data?.value} />;
}
