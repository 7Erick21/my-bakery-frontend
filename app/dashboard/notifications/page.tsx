import { getSession } from '@/lib/auth/helpers';
import { getUserNotifications } from '@/server/queries/notifications';

import { NotificationsList } from '@/views/Dashboard/Notifications';

export default async function DashboardNotificationsPage() {
  const user = await getSession();
  const notifications = user ? await getUserNotifications(user.id) : [];

  return <NotificationsList notifications={notifications} />;
}
