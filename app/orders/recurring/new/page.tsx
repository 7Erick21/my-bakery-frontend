import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth/helpers';
import { getUserAddresses } from '@/server/queries/addresses';

import { RecurringScheduleForm } from '@/views/Orders';

export default async function NewRecurringSchedulePage() {
  const user = await getSession();
  if (!user) redirect('/auth');

  const addresses = await getUserAddresses(user.id);

  return <RecurringScheduleForm addresses={addresses} />;
}
