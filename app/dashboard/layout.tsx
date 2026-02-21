import { redirect } from 'next/navigation';

import { getProfile } from '@/lib/auth/helpers';
import type { UserRole } from '@/lib/supabase/types';
import { DashboardLayout } from '@/presentation/layout/DashboardLayout';

export default async function DashboardRootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();
  const role = (profile?.role ?? 'user') as UserRole;

  if (!profile || role === 'user') {
    redirect(!profile ? '/auth' : '/');
  }

  return <DashboardLayout userRole={role}>{children}</DashboardLayout>;
}
