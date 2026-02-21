'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';

export async function upsertScheduleItem(formData: FormData) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const productId = formData.get('product_id') as string;
  const dayOfWeek = Number(formData.get('day_of_week'));
  const baseQuantity = Number(formData.get('base_quantity'));

  const { error } = await supabase
    .from('production_schedule')
    .upsert(
      { product_id: productId, day_of_week: dayOfWeek, base_quantity: baseQuantity },
      { onConflict: 'product_id,day_of_week' }
    );

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/production');
}

export async function deleteScheduleItem(id: string) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { error } = await supabase.from('production_schedule').delete().eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/production');
}

export async function toggleScheduleItem(id: string, isActive: boolean) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { error } = await supabase
    .from('production_schedule')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/production');
}
