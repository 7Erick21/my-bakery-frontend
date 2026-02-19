import { redirect } from 'next/navigation';

import { getProducts } from '@/server/queries/products';
import { getRecurringScheduleById } from '@/server/queries/recurring';
import { RecurringScheduleDetail } from '@/views/Dashboard/RecurringOrders';

export default async function DashboardRecurringDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [schedule, products] = await Promise.all([getRecurringScheduleById(id), getProducts('es')]);

  if (!schedule) redirect('/dashboard/recurring');

  return <RecurringScheduleDetail schedule={schedule} products={products} />;
}
