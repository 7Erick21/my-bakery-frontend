import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth/helpers';
import { getUserOrders } from '@/server/queries/orders';

import { OrderHistory } from '@/views/Orders';

export default async function OrdersPage() {
  const user = await getSession();
  if (!user) redirect('/auth');

  const orders = await getUserOrders(user.id);

  return <OrderHistory orders={orders} />;
}
