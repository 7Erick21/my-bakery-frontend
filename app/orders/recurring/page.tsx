import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth/helpers';
import { getUserRecurringSchedules } from '@/server/queries/recurring';

import { RecurringSchedulesList } from '@/views/Orders';

export default async function RecurringOrdersPage() {
  const user = await getSession();
  if (!user) redirect('/auth');

  const schedules = await getUserRecurringSchedules(user.id);

  return <RecurringSchedulesList schedules={schedules} />;
}
