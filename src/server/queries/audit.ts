import type { AuditEntry } from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';

export async function getAuditLog(limit = 100): Promise<AuditEntry[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('audit_log')
    .select(
      `
      id, table_name, record_id, action, old_data, new_data, created_at,
      profiles(full_name, email)
    `
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data ?? []) as unknown as AuditEntry[];
}
