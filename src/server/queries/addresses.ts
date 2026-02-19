import type { AddressItem } from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';

export async function getUserAddresses(userId: string): Promise<AddressItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  return (data ?? []) as unknown as AddressItem[];
}

export async function getAddressById(id: string): Promise<AddressItem | null> {
  const supabase = await createClient();

  const { data } = await supabase.from('addresses').select('*').eq('id', id).single();

  return (data as unknown as AddressItem) ?? null;
}
