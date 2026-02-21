import { Suspense } from 'react';

import { getAllOrdersAdmin } from '@/server/queries/orders';
import { OrdersList } from '@/views/Dashboard/Orders';
import { TableSkeleton } from '@/views/Dashboard/shared/TableSkeleton';

async function OrdersContent() {
  const orders = await getAllOrdersAdmin();
  return <OrdersList orders={orders} />;
}

export default function DashboardOrdersPage() {
  return (
    <Suspense fallback={<TableSkeleton rows={6} columns={5} />}>
      <OrdersContent />
    </Suspense>
  );
}
