import { getProfile } from '@/lib/auth/helpers';
import { DashboardHome } from '@/views/Dashboard/DashboardHome';

export default async function DashboardPage() {
  const profile = await getProfile();

  return <DashboardHome role={profile?.role ?? 'user'} email={profile?.email ?? ''} />;
}
