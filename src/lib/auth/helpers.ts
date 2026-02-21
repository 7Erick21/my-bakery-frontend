import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/supabase/types';

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return profile;
}

export async function requireAuth() {
  const user = await getSession();
  if (!user) {
    redirect('/auth');
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await getProfile();
  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect('/dashboard');
  }
  return profile;
}
