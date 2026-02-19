'use server';

import { revalidatePath } from 'next/cache';

import { requireAuth } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';

export async function markNotificationRead(notificationId: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  revalidatePath('/dashboard/notifications');
}

export async function markAllNotificationsRead() {
  const user = await requireAuth();
  const supabase = await createClient();

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  revalidatePath('/dashboard/notifications');
}
