import { getAllOrdersAdmin } from '@/server/queries/orders';

import { OrdersList } from '@/views/Dashboard/Orders';

export default async function DashboardOrdersPage() {
  const orders = await getAllOrdersAdmin();

  return <OrdersList orders={orders} />;
}
