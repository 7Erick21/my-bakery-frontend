import { createClient } from '@/lib/supabase/server';

export async function getUserNotifications(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function getUnreadCount(userId: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  return count ?? 0;
}
