import { redirect } from 'next/navigation';

import { getRecurringScheduleById } from '@/server/queries/recurring';
import { RecurringScheduleFormAdmin } from '@/views/Dashboard/RecurringOrders/RecurringScheduleForm';

export default async function DashboardRecurringEditPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const schedule = await getRecurringScheduleById(id);

  if (!schedule) redirect('/dashboard/recurring');

  return <RecurringScheduleFormAdmin schedule={schedule} />;
}
