import { getAllRecurringSchedulesAdmin } from '@/server/queries/recurring';

import { RecurringSchedulesListAdmin } from '@/views/Dashboard/RecurringOrders';

export default async function DashboardRecurringPage() {
  const schedules = await getAllRecurringSchedulesAdmin();

  return <RecurringSchedulesListAdmin schedules={schedules} />;
}
