import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth/helpers';
import { getUserAddresses } from '@/server/queries/addresses';
import { getProducts } from '@/server/queries/products';
import { getRecurringScheduleById } from '@/server/queries/recurring';

import { RecurringSchedule, RecurringScheduleForm } from '@/views/Orders';

export default async function RecurringSchedulePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect('/auth');

  const { id } = await params;
  const { edit } = await searchParams;
  const schedule = await getRecurringScheduleById(id, user.id);

  if (!schedule) redirect('/orders/recurring');

  if (edit === 'true') {
    const addresses = await getUserAddresses(user.id);
    return (
      <RecurringScheduleForm
        scheduleId={schedule.id}
        initialData={{
          business_name: schedule.business_name,
          contact_name: schedule.contact_name,
          contact_phone: schedule.contact_phone,
          delivery_type: schedule.delivery_type,
          payment_method: schedule.payment_method,
          notes: schedule.notes
        }}
        addresses={addresses}
      />
    );
  }

  const products = await getProducts('es');

  return <RecurringSchedule schedule={schedule} products={products} />;
}
