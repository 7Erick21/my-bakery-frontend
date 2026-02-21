import { createClient } from '@/lib/supabase/server';

export async function getAllUsers() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, role, preferred_language, created_at')
    .order('created_at', { ascending: false });

  return data ?? [];
}
